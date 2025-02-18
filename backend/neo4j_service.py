import grpc
from concurrent import futures
import neo4j_service_pb2
import neo4j_service_pb2_grpc
from neo4j import GraphDatabase
import json
import uuid

class Neo4jService(neo4j_service_pb2_grpc.Neo4jServiceServicer):
    def __init__(self):
        # Initializing Neo4j
        self.driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "password"))

    def StoreResult(self, request, context):
        # Log the received data
        print("Received StoreResult request:")
        print("Class Label:", request.class_label)
        print("Confidence:", request.confidence)
        print("URL:", request.image_url)

        # Create or match an image node
        with self.driver.session() as session:
            session.run(
                "MERGE (i:Image {image_url: $image_url})",
                image_url=request.image_url
            )

        # Store the result in Neo4j
        with self.driver.session() as session:
            session.run(
                """
                MATCH (i:Image {image_url: $image_url})
                CREATE (r:Result {class_label: $class_label, confidence: $confidence})
                CREATE (r)-[:CLASSIFIED_FROM]->(i)
                """,
                class_label=request.class_label,
                confidence=request.confidence,
                image_url=request.image_url
            )

        return neo4j_service_pb2.StoreResultResponse(success=True)

    def StoreMetrics(self, request, context):
        # Log the received metrics data
        print("Received StoreMetrics request:")

        batch_id = str(uuid.uuid4())
        metric_id = str(uuid.uuid4())

        confidence_distribution_dict = dict(request.confidence_distribution)
        confidence_distribution_json = json.dumps(confidence_distribution_dict)
        inference_time_distribution_dict = dict(request.inference_time_distribution)
        inference_time_distribution_json = json.dumps(inference_time_distribution_dict)
        label_avg_confidences_dict = dict(request.average_confidence_for_labels)
        label_avg_confidences_json = json.dumps(label_avg_confidences_dict)
        num_of_labels_detection_distribution_dict = dict(request.detection_count_distribution)
        num_of_labels_detection_distribution_json = json.dumps(num_of_labels_detection_distribution_dict)
        category_distribution_dict = dict(request.category_distribution)
        category_distribution_json = json.dumps(category_distribution_dict)
        category_percentages_dict = dict(request.category_percentages)
        category_percentages_json = json.dumps(category_percentages_dict)

        # Store the metrics in Neo4j
        with self.driver.session() as session:
            # Create a BatchNode with batch_id
            session.run(
                """
                CREATE (b:BatchNode {batch_id: $batch_id})
                """,
                batch_id=batch_id
            )

            # Create a node for the metrics
            session.run(
                """
                MATCH (b:BatchNode {batch_id: $batch_id})
                CREATE (m:Metrics {
                    metric_id: $metric_id,
                    total_images: $total_images, 
                    total_time: $total_time, 
                    average_confidence_score: $average_confidence_score,
                    total_preprocessing_time: $total_preprocessing_time,
                    total_inference_time: $total_inference_time,
                    total_postprocessing_time: $total_postprocessing_time,
                    average_inference_time: $average_inference_time,
                    confidence_distribution: $confidence_distribution_json,
                    inference_time_distribution: $inference_time_distribution_json,
                    label_avg_confidences: $label_avg_confidences_json,
                    num_of_labels_detection_distribution: $num_of_labels_detection_distribution_json,
                    category_distribution: $category_distribution_json,
                    category_percentages: $category_percentages_json
                })
                CREATE (m)-[:BELONGS_TO]->(b)
                """,

                batch_id=batch_id,
                metric_id=metric_id,
                total_images=request.total_images,
                total_time=request.total_time,
                average_confidence_score=request.average_confidence_score,
                total_preprocessing_time=request.total_preprocessing_time,
                total_inference_time=request.total_inference_time,
                total_postprocessing_time=request.total_postprocessing_time,
                average_inference_time=request.average_inference_time,
                confidence_distribution_json=confidence_distribution_json,
                inference_time_distribution_json=inference_time_distribution_json,
                label_avg_confidences_json=label_avg_confidences_json,
                num_of_labels_detection_distribution_json=num_of_labels_detection_distribution_json,
                category_distribution_json=category_distribution_json,
                category_percentages_json=category_percentages_json

            )

        return neo4j_service_pb2.StoreResultResponse(success=True)

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    neo4j_service_pb2_grpc.add_Neo4jServiceServicer_to_server(Neo4jService(), server)
    server.add_insecure_port("[::]:50052")
    print("Server started, listening on [::]:50052")
    server.start()
    server.wait_for_termination()

if __name__ == "__main__":
    serve()