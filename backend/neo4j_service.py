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

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    neo4j_service_pb2_grpc.add_Neo4jServiceServicer_to_server(Neo4jService(), server)
    server.add_insecure_port("[::]:50052")
    print("Server started, listening on [::]:50052")
    server.start()
    server.wait_for_termination()

if __name__ == "__main__":
    serve()