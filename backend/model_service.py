import grpc
from concurrent import futures
import model_service_pb2
import model_service_pb2_grpc
import neo4j_service_pb2
import neo4j_service_pb2_grpc
import logging
import os

class ModelService(model_service_pb2_grpc.ModelServiceServicer):
    def __init__(self):
        # Initialize the Neo4j Service client
        self.neo4j_channel = grpc.insecure_channel("localhost:50052")
        self.neo4j_stub = neo4j_service_pb2_grpc.Neo4jServiceStub(self.neo4j_channel)

    def StoreResults(self, request, context):
        try:
            print("Received image and results from client.")
            for label, confidence in zip(request.class_labels, request.confidences):
                print(f"Class: {label}, Confidence: {confidence}")

            image_path = "received_image.jpg"
            with open(image_path, "wb") as f:
                f.write(request.image_data)
            print(f"Image saved to {image_path}")

            for label, confidence in zip(request.class_labels, request.confidences):
                neo4j_request = neo4j_service_pb2.ClassificationResult(
                class_label=label,
                confidence=confidence
                )
                neo4j_response = self.neo4j_stub.StoreResult(neo4j_request)
                print("Neo4j StoreResult response:", neo4j_response.success)

            # Return a success response
            return model_service_pb2.ResultsResponse(success=True, message="Results and image stored successfully")

        except Exception as e:
            # Return an error response
            return model_service_pb2.ResultsResponse(success=False, message=f"Error: {str(e)}")

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    model_service_pb2_grpc.add_ModelServiceServicer_to_server(ModelService(), server)
    server.add_insecure_port("[::]:50051")
    print("Server started, listening on [::]:50051")
    server.start()
    server.wait_for_termination()

if __name__ == "__main__":
    serve()
