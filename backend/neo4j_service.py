import grpc
from concurrent import futures
import neo4j_service_pb2
import neo4j_service_pb2_grpc
from neo4j import GraphDatabase
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

        with self.driver.session() as session:
            session.run(
                "MERGE (b:BatchNode {batch_id: $batch_id})",
                batch_id=request.batch_id
            )

        # Create or match an image node
        with self.driver.session() as session:
            session.run(
                    """MERGE (i:Image {image_url: $image_url})
                    MERGE (b:BatchNode {batch_id: $batch_id})
                    MERGE (i)-[:BELONGS_TO]->(b)
                """,
                image_url=request.image_url,
                batch_id=request.batch_id
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
        metric_id = str(uuid.uuid4())
        batch_id = request.batch_id

        with self.driver.session() as session:
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
                    category_percentages: $category_percentages_json,
                    box_size_distribution: $box_size_distribution_json,
                    average_box_size: $average_box_size,
                    box_proportion_distribution: $box_proportion_distribution_json,
                    average_box_proportion: $average_box_proportion,
                    average_preprocess_time: $average_preprocess_time,
                    average_postprocess_time: $average_postprocess_time,
                    preprocess_time_distribution: $preprocess_distribution_json,
                    postprocess_time_distribution: $postprocess_distribution_json
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
                confidence_distribution_json=request.confidence_distribution,
                inference_time_distribution_json=request.inference_time_distribution,
                label_avg_confidences_json=request.average_confidence_for_labels,
                num_of_labels_detection_distribution_json=request.detection_count_distribution,
                category_distribution_json=request.category_distribution,
                category_percentages_json=request.category_percentages,
                box_size_distribution_json=request.box_size_distribution,
                average_box_size=request.average_box_size,
                box_proportion_distribution_json=request.box_proportion_distribution,
                average_box_proportion=request.average_box_proportion,
                average_preprocess_time=request.average_preprocess_time,
                average_postprocess_time=request.average_postprocess_time,
                preprocess_distribution_json=request.preprocess_time_distribution,
                postprocess_distribution_json=request.postprocess_time_distribution,
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