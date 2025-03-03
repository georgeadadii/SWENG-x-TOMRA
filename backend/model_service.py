import grpc
from concurrent import futures
import model_service_pb2
import model_service_pb2_grpc
import neo4j_service_pb2
import neo4j_service_pb2_grpc
import logging
import requests


class ModelService(model_service_pb2_grpc.ModelServiceServicer):
    def __init__(self):
        # Initialize the Neo4j Service client
        self.neo4j_channel = grpc.insecure_channel("localhost:50052")
        self.neo4j_stub = neo4j_service_pb2_grpc.Neo4jServiceStub(self.neo4j_channel)

    def StoreResults(self, request_iterator, context):
        """Handles a stream of classification results, stores them, and streams responses."""
        try:
            for request in request_iterator:
                print("Received image and results from client.")

                # Log class labels and confidences
                for label, confidence in zip(request.class_labels, request.confidences):
                    print(f"Class: {label}, Confidence: {confidence}")

                # Download and save the image
                image_url = request.image_url
                response = requests.get(image_url)
                if response.status_code == 200:
                    image_path = f"received_{request.batch_id}.jpg"
                    with open(image_path, "wb") as f:
                        f.write(response.content)
                    print(f"Image saved to {image_path}")
                else:
                    print(f"Failed to download image: {image_url}")
                    yield model_service_pb2.ResultsResponse(success=False, message=f"Failed to download {image_url}.")
                    continue  

                # Send data to Neo4j service
                success = True
                try:
                    for label, confidence, bbox in zip(request.class_labels, request.confidences, request.bbox_coordinates):
                        neo4j_request = neo4j_service_pb2.ClassificationResult(
                            class_label=label,
                            confidence=confidence,
                            image_url=image_url,
                            batch_id=request.batch_id,
                            task_type=request.task_type,
                            bbox_coordinates=bbox
                        )
                        neo4j_response = self.neo4j_stub.StoreResult(iter([neo4j_request]))
                        for res in neo4j_response:
                            if not res.success:
                                print("Neo4j StoreResult failed")
                                success = False

                except grpc.RpcError as e:
                    print(f"Neo4j gRPC Error: {str(e)}")
                    yield model_service_pb2.ResultsResponse(success=False, message=f"Neo4j Error: {str(e)}")
                    continue  

                yield model_service_pb2.ResultsResponse(
                    success=success,
                    message="Results and image stored successfully." if success else "Partial success, some issues encountered."
                )

            print("Finished processing all requests successfully.") 

        except Exception as e:
            print(f"Unexpected error in StoreResults: {e}")  
            context.set_code(grpc.StatusCode.UNKNOWN)
            context.set_details(f"Server Error: {str(e)}")
            yield model_service_pb2.ResultsResponse(success=False, message=f"Server error: {str(e)}")

        finally:
            print("StoreResults iterator fully consumed.")  
    
    def StoreMetrics(self, request_iterator, context):
        """Handles a stream of metric results and stores them in Neo4j."""
        try:
            for request in request_iterator:
                print("Received metrics from client.")

                # Prepare and send metrics to Neo4j
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

                neo4j_response = self.neo4j_stub.StoreMetrics(iter([neo4j_metrics_request]))

                for res in neo4j_response:
                    print("Neo4j StoreMetrics response:", res.success)

                yield model_service_pb2.MetricsResponse(success=True, message="Metrics stored successfully.")

        except Exception as e:
            yield model_service_pb2.MetricsResponse(success=False, message=f"Error storing metrics: {str(e)}")


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    model_service_pb2_grpc.add_ModelServiceServicer_to_server(ModelService(), server)
    server.add_insecure_port("[::]:50051")
    print("Server started, listening on [::]:50051")
    server.start()
    server.wait_for_termination()


if __name__ == "__main__":
    serve()
