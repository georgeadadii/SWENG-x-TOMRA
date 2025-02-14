# import grpc
# import neo4j_service_pb2
# import neo4j_service_pb2_grpc

# def run():
#     with grpc.insecure_channel("localhost:50052") as channel:
#         stub = neo4j_service_pb2_grpc.Neo4jServiceStub(channel)
#         print("Store result success:", response.success)

# if __name__ == "__main__":
#     run()