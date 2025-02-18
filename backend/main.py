from typing import List
from fastapi import FastAPI
import strawberry
from strawberry.fastapi import GraphQLRouter
from neo4j import GraphDatabase
from fastapi.middleware.cors import CORSMiddleware

# Define a GraphQL type that matches Neo4j data with additional image_url field
@strawberry.type
class ResultType:
    class_label: str = strawberry.field(name="classLabel")
    confidence: float
    image_url: str = strawberry.field(name="imageUrl")

NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "password"

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

def get_results() -> List[ResultType]:
    """
    Queries the Neo4j database for all nodes with label 'Result'
    and returns a list of results including image_url from their related image node.
    """
    with driver.session() as session:
        result = session.run(
            """
            MATCH (r:Result)-[:CLASSIFIED_FROM]->(i:Image)
            RETURN r.class_label AS class_label, 
                   r.confidence AS confidence,
                   i.image_url AS image_url
            """
        )
        return [
            ResultType(
                class_label=record["class_label"],
                confidence=record["confidence"],
                image_url=record["image_url"]
            ) 
            for record in result
        ]

@strawberry.type
class Query:
    @strawberry.field
    def results(self) -> List[ResultType]:
        return get_results()

schema = strawberry.Schema(query=Query)
graphql_app = GraphQLRouter(schema, graphiql=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],  # This allows OPTIONS, GET, POST, etc.
    allow_headers=["*"],
)

app.include_router(graphql_app, prefix="/graphql")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
