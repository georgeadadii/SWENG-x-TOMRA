import grpc
from concurrent import futures
import neo4j_service_pb2
import neo4j_service_pb2_grpc
from neo4j import GraphDatabase

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

        # Store the result in Neo4j
        with self.driver.session() as session:
            session.run(
                "CREATE (r:Result {class_label: $class_label, confidence: $confidence, image_url: $image_url})",
                class_label=request.class_label,
                confidence=request.confidence,
                image_url=request.image_url
            )

        return neo4j_service_pb2.StoreResultResponse(success=True)

    def StoreMetrics(self, request, context):
        # Log the received metrics data
        print("Received StoreMetrics request:")

        # Store the metrics in Neo4j
        with self.driver.session() as session:
            # Create a node for the metrics
            session.run(
                "CREATE (m:Metrics {total_images: $total_images, total_time: $total_time, average_confidence_score: $average_confidence_score})",
                total_images=request.total_images,
                total_time=request.total_time,
                average_confidence_score=request.average_confidence_score
            )

            # Store average confidence for labels as relationships (example)
            for label, confidence in request.average_confidence_for_labels.items():
                session.run(
                    "MATCH (m:Metrics) WHERE m.total_images = $total_images CREATE (m)-[:HAS_AVERAGE_CONFIDENCE]->(l:Label {name: $label, confidence: $confidence})",
                    total_images=request.total_images,
                    label=label,
                    confidence=confidence
                )

            # Store confidence distribution (example)
            for label, count in request.confidence_distribution.items():
                session.run(
                    "MATCH (m:Metrics) WHERE m.total_images = $total_images CREATE (m)-[:HAS_CONFIDENCE_DISTRIBUTION]->(c:ConfidenceDistribution {label: $label, count: $count})",
                    total_images=request.total_images,
                    label=label,
                    count=count
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