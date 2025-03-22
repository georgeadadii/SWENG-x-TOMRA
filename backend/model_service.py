import grpc
from concurrent import futures
import model_service_pb2
import model_service_pb2_grpc
import neo4j_service_pb2
import neo4j_service_pb2_grpc
import logging
import requests
import uuid
from azure.cosmos import CosmosClient
import os
from pathlib import Path
from dotenv import load_dotenv
from azure.identity import ClientSecretCredential
from azure.keyvault.secrets import SecretClient
from datetime import datetime

env_path = Path("..") / ".env"  # Go up one level to the root directory
load_dotenv(dotenv_path=env_path)


class ModelService(model_service_pb2_grpc.ModelServiceServicer):
    def __init__(self):
        # Initialize the Neo4j Service client
        self.neo4j_channel = grpc.insecure_channel("localhost:50052")
        self.neo4j_stub = neo4j_service_pb2_grpc.Neo4jServiceStub(
            self.neo4j_channel)

        TENANT_ID = os.getenv("AZURE_TENANT_ID")
        CLIENT_ID = os.getenv("AZURE_CLIENT_ID")
        CLIENT_SECRET = os.getenv("AZURE_CLIENT_SECRET")

        if not all([TENANT_ID, CLIENT_ID, CLIENT_SECRET]):
            raise ValueError("Missing one or more required environment variables: AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET")

        KEY_VAULT_URL = "https://sweng25group06keyvault.vault.azure.net/"
        credential = ClientSecretCredential(TENANT_ID, CLIENT_ID, CLIENT_SECRET)
        secret_client = SecretClient(vault_url=KEY_VAULT_URL, credential=credential)

        secret = secret_client.get_secret("COSMOS-ENDPOINT")
        COSMOS_ENDPOINT = secret.value
        secret = secret_client.get_secret("COSMOS-KEY")
        COSMOS_KEY = secret.value
        secret = secret_client.get_secret("COSMOS-DATABASE-NAME")
        DATABASE_NAME = secret.value
        secret = secret_client.get_secret("COSMOS-CONTAINER-NAME")
        CONTAINER_NAME = secret.value

        if not all([COSMOS_ENDPOINT, COSMOS_KEY, DATABASE_NAME, CONTAINER_NAME]):
            raise ValueError("Missing one or more required environment variables.")

        COSMOS_CONN_STR = f"AccountEndpoint={COSMOS_ENDPOINT};AccountKey={COSMOS_KEY};"

        try:
            self.cosmos_client = CosmosClient.from_connection_string(
                COSMOS_CONN_STR)
            self.cosmos_db = self.cosmos_client.get_database_client(
                DATABASE_NAME)
            self.cosmos_container = self.cosmos_db.get_container_client(
                CONTAINER_NAME)
        except Exception as e:
            print(f"Cosmos DB failed: {str(e)}")
            raise

    def StoreResults(self, request_iterator, context):
        """Handles a stream of classification results, stores them, and streams responses."""
        try:
            for request in request_iterator:
                print("Received image and results from client.")

                # Log class labels and confidences
                for label, confidence in zip(request.class_labels, request.confidences):
                    print(f"Class: {label}, Confidence: {confidence}")

                # Process results, skipping image download
                image_url = request.image_url
                print(f"Processing metadata for image with URL: {image_url}")

                success = True
                try:
                    if not (len(request.class_labels) == len(request.confidences) == len(request.bbox_coordinates)):
                        raise ValueError("Mismatched list lengths in request.")

                    for label, confidence, bbox in zip(request.class_labels, request.confidences, request.bbox_coordinates):
                        neo4j_request = neo4j_service_pb2.ClassificationResult(
                            class_label=label,
                            confidence=confidence,
                            image_url=image_url,
                            batch_id=request.batch_id,
                            task_type=request.task_type,
                            bbox_coordinates=bbox,
                            image_width=request.image_width,  
                            image_height=request.image_height,  
                            image_format=request.image_format  
                        )

                        try:
                            neo4j_response = self.neo4j_stub.StoreResult(
                                iter([neo4j_request]))
                            for res in neo4j_response:
                                if not res.success:
                                    print("Neo4j StoreResult failed")
                                    success = False
                        except grpc.RpcError as e:
                            print(
                                f"Neo4j gRPC Error: {e.code()} - {e.details()}")
                            context.set_code(e.code())
                            context.set_details(e.details())
                            return  # Stop processing this request

                    metrics_data = {
                        "image_url": request.image_url,
                        "top_label": list(request.class_labels)[0] if request.class_labels else "",
                        "labels": list(request.class_labels),
                        "confidences": list(request.confidences),
                        "preprocessing_time": request.preprocessing_time,
                        "inference_time": request.inference_time,
                        "postprocessing_time": request.postprocessing_time,
                        "bbox_coordinates": list(request.bbox_coordinates),
                        "box_proportions": list(request.box_proportions)
                    }

                    if not self.store_metrics_in_cosmos(metrics_data, request.batch_id, request.task_type):
                        success = False

                except Exception as e:
                    print(f"Unexpected error when processing request: {e}")
                    context.set_code(grpc.StatusCode.INTERNAL)
                    context.set_details(str(e))
                    return

                yield model_service_pb2.ResultsResponse(
                    success=success,
                    message="Results stored successfully." if success else "Some issues encountered."
                )

        except Exception as e:
            print(f"Unexpected error in StoreResults: {e}")
            context.set_code(grpc.StatusCode.UNKNOWN)
            context.set_details(f"Server Error: {str(e)}")
            yield model_service_pb2.ResultsResponse(success=False, message=f"Server error: {str(e)}")

        finally:
            print("StoreResults iterator fully consumed.")

    def StoreMetrics(self, request, context):
        try:
            print("Received metrics from client.")
            neo4j_metrics_request = neo4j_service_pb2.MetricsResult(
                total_images=request.total_images,
                total_time=request.total_time,
                average_confidence_score=request.average_confidence_score,
                average_confidence_for_labels=request.average_confidence_for_labels,
                confidence_distribution=request.confidence_distribution,
                detection_count_distribution=request.detection_count_distribution,
                category_distribution=request.category_distribution,
                category_percentages=request.category_percentages,
                total_preprocessing_time=request.total_preprocessing_time,
                total_inference_time=request.total_inference_time,
                total_postprocessing_time=request.total_postprocessing_time,
                average_inference_time=request.average_inference_time,
                inference_time_distribution=request.inference_time_distribution,
                average_box_size=request.average_box_size,
                box_size_distribution=request.box_size_distribution,
                average_box_proportion=request.average_box_proportion,
                box_proportion_distribution=request.box_proportion_distribution,
                average_preprocess_time=request.average_preprocess_time,
                average_postprocess_time=request.average_postprocess_time,
                preprocess_time_distribution=request.preprocess_time_distribution,
                postprocess_time_distribution=request.postprocess_time_distribution,
                batch_id=request.batch_id
            )
            neo4j_response = self.neo4j_stub.StoreMetrics(
                neo4j_metrics_request)
            print("Neo4j StoreMetrics response:", neo4j_response.success)
            return model_service_pb2.MetricsResponse(success=True, message="Metrics stored successfully in Neo4j")
        except Exception as e:
            return model_service_pb2.MetricsResponse(success=False, message=f"Error storing metrics: {str(e)}")

    def store_metrics_in_cosmos(self, metrics_data, batch_id, task_type):
        """
        Stores metrics data for an image in Cosmos DB.
        Args: metrics_data (dict): A dictionary containing metrics data for an image.
        Returns: bool: True if the metrics were successfully stored, False otherwise.
        """

        required_fields = [
            "image_url", "top_label", "labels", "confidences", "preprocessing_time",
            "inference_time", "postprocessing_time", "bbox_coordinates", "box_proportions"
        ]
        for field in required_fields:
            if field not in metrics_data:
                raise ValueError(f"Missing required field: {field}")

        try:

            query = f"""
            SELECT * FROM c 
            WHERE c.image_url = @image_url 
            AND c.labels = @labels
            """

            parameters = [
            {"name": "@image_url", "value": metrics_data["image_url"]},
            {"name": "@labels", "value": metrics_data["labels"]}
            ]

            existing_items = list(self.cosmos_container.query_items(
                query=query,
                parameters=parameters,
                enable_cross_partition_query=True
            ))

            if existing_items:
                print(f"Duplicate result detected for image: {metrics_data['image_url']}")
                return False 

            bbox_dimensions = []
            for bbox_str in metrics_data["bbox_coordinates"]:
                try:
                    bbox = [float(coord) for coord in bbox_str.split(",")]
                    
                    if len(bbox) != 4:
                        print(f"Invalid bounding box format: {bbox_str}. Expected 4 values.")
                        continue

                    x_min, y_min, x_max, y_max = bbox
                    width = x_max - x_min
                    height = y_max - y_min
                    bbox_dimensions.append({
                        "width": width,
                        "height": height,
                        "coordinates": bbox  
                    })

                except Exception as e:
                    print(f"Error processing bounding box {bbox_str}: {str(e)}")
                    continue  

            
            cosmos_item = {
                "id": str(uuid.uuid4()),
                "image_url": metrics_data["image_url"],
                "top_label": metrics_data["top_label"],
                "labels": metrics_data["labels"],
                "confidences": metrics_data["confidences"],
                "preprocessing_time": metrics_data["preprocessing_time"],
                "inference_time": metrics_data["inference_time"],
                "postprocessing_time": metrics_data["postprocessing_time"],
                "bbox_coordinates": metrics_data["bbox_coordinates"],
                "bbox_dimensions": bbox_dimensions,
                "box_proportions": metrics_data["box_proportions"],
                "batch_id": batch_id,   
                "task_type": task_type,  
                "classified_at": datetime.utcnow().isoformat()  
            }

            self.cosmos_container.create_item(cosmos_item)
            
            print(
                f"Metrics stored successfully for image: {metrics_data['image_url']}")
            return True

        except Exception as e:
            print(f"Error storing metrics in Cosmos DB: {str(e)}")
            return False


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    model_service_pb2_grpc.add_ModelServiceServicer_to_server(
        ModelService(), server)
    server.add_insecure_port("[::]:50051")
    print("Server started, listening on [::]:50051")
    server.start()
    server.wait_for_termination()


if __name__ == "__main__":
    serve()
