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

    def StoreResult(self, request_iterator, context):
        """Handles a stream of classification results and stores them in Neo4j."""
        try:
            for request in request_iterator:
                x1, y1, x2, y2 = map(float, request.bbox_coordinates.split(','))

                with self.driver.session() as session:
                    # Batch Node
                    session.run(
                        "MERGE (b:BatchNode {batch_id: $batch_id})",
                        batch_id=request.batch_id
                    )

                    # Image Node
                    session.run(
                        """
                        MERGE (i:Image {image_url: $image_url})
                        MERGE (b:BatchNode {batch_id: $batch_id})
                        MERGE (i)-[:BELONGS_TO]->(b)
                        """,
                        image_url=request.image_url,
                        batch_id=request.batch_id
                    )

                    # Annotation Node
                    session.run(
                        """
                        MATCH (i:Image {image_url: $image_url})
                        MERGE (i)-[:HAS_ANNOTATION]->(a:Annotation {
                            task_type: $task_type
                        })
                        ON CREATE SET
                            a.reviewed = false,
                            a.classified = false,
                            a.misclassified = false,
                            a.created_at = datetime()
                        """,
                        image_url=request.image_url,
                        task_type=request.task_type
                    )

                    # Bounding Box for Object Detection
                    if request.task_type == "object_detection":
                        session.run(
                            """
                            MATCH (i:Image {image_url: $image_url})
                            MERGE (bb:BoundingBox {
                                x1: $x1, y1: $y1, x2: $x2, y2: $y2, confidence: $confidence
                            })
                            MERGE (l:Label {name: $class_label})
                            MERGE (i)-[:HAS_BOUNDING_BOX]->(bb)
                            MERGE (bb)-[:HAS_LABEL]->(l)
                            """,
                            image_url=request.image_url,
                            x1=x1, y1=y1, x2=x2, y2=y2,
                            confidence=request.confidence,
                            class_label=request.class_label
                        )

                    # Classification Annotation for Image Classification
                    if request.task_type == "image_classification":
                        session.run(
                            """
                            MATCH (i:Image {image_url: $image_url})
                            MERGE (ca:ClassificationAnnotation {confidence: $confidence})
                            MERGE (l:Label {name: $class_label})
                            MERGE (i)-[:HAS_CLASSIFICATION]->(ca)
                            MERGE (ca)-[:HAS_LABEL]->(l)
                            """,
                            image_url=request.image_url,
                            confidence=request.confidence,
                            class_label=request.class_label
                        )

                yield neo4j_service_pb2.StoreResultResponse(success=True)

        except Exception as e:
            yield neo4j_service_pb2.StoreResultResponse(success=False)

    def StoreMetrics(self, request_iterator, context):
        """Handles a stream of metric results and stores them in Neo4j."""
        try:
            for request in request_iterator:
                metric_id = str(uuid.uuid4())

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
                            detection_count_distribution: $detection_count_distribution_json,
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
                        batch_id=request.batch_id,
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
                        detection_count_distribution_json=request.detection_count_distribution,
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

                yield neo4j_service_pb2.StoreResultResponse(success=True)

        except Exception as e:
            yield neo4j_service_pb2.StoreResultResponse(success=False)


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    neo4j_service_pb2_grpc.add_Neo4jServiceServicer_to_server(Neo4jService(), server)
    server.add_insecure_port("[::]:50052")
    print("Server started, listening on [::]:50052")
    server.start()
    server.wait_for_termination()


if __name__ == "__main__":
    serve()
