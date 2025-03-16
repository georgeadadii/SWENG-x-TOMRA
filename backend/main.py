from typing import List, Dict, Any
from fastapi import FastAPI
import strawberry
from datetime import datetime
from strawberry.fastapi import GraphQLRouter
from neo4j import GraphDatabase
from fastapi.middleware.cors import CORSMiddleware
import json

# Define a custom scalar for JSON data
@strawberry.scalar
class JSONScalar:
    @staticmethod
    def serialize(value: Dict[str, Any]) -> str:
        return json.dumps(value)

    @staticmethod
    def parse_value(value: str) -> Dict[str, Any]:
        return json.loads(value)

    @staticmethod
    def parse_literal(ast) -> Dict[str, Any]:
        return json.loads(ast.value)

# Define a GraphQL type that matches Neo4j data with additional image_url field
@strawberry.type
class ResultType:
    class_label: str = strawberry.field(name="classLabel")
    confidence: float
    image_url: str = strawberry.field(name="imageUrl")
    classified: bool
    misclassified: bool
    created_at: datetime

# Define a GraphQL type for the Metrics data
@strawberry.type
class MetricsType:
    metric_id: str
    average_confidence_score: float
    average_inference_time: float
    category_distribution: str  
    category_percentages: str   
    confidence_distribution: str  
    detection_count_distribution: str  
    inference_time_distribution: str  
    label_avg_confidences: str  
    detection_count_distribution: str  
    total_images: int
    total_inference_time: float
    total_postprocessing_time: float
    total_preprocessing_time: float
    total_time: float
    average_box_size: float
    box_size_distribution: str  
    average_box_proportion: float
    box_proportion_distribution: str  
    average_preprocess_time: float
    average_postprocess_time: float
    preprocess_time_distribution: str  
    postprocess_time_distribution: str  

NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "password"

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

def get_results() -> List[ResultType]:
    """
    Queries the Neo4j database for all nodes with label 'Result'
    and returns a list of results including classification status.
    """
    with driver.session() as session:
        result = session.run(
            """
            MATCH (i:Image)-[:HAS_ANNOTATION]->(a:Annotation)
            MATCH (i)-[:HAS_BOUNDING_BOX]->(bb:BoundingBox)-[:HAS_LABEL]->(l:Label)
            RETURN l.name AS class_label, 
                   bb.confidence AS confidence,
                   i.image_url AS image_url,
                   a.classified AS classified,
                   a.misclassified AS misclassified,
                   a.created_at AS created_at
            
            UNION
            
            MATCH (i:Image)-[:HAS_ANNOTATION]->(a:Annotation)
            MATCH (i)-[:HAS_CLASSIFICATION]->(ca:ClassificationAnnotation)-[:HAS_LABEL]->(l:Label)
            RETURN l.name AS class_label, 
                   ca.confidence AS confidence,
                   i.image_url AS image_url,
                   a.classified AS classified,
                   a.misclassified AS misclassified,
                   a.created_at AS created_at
            """
        )
        return [
            ResultType(
                class_label=record["class_label"],
                confidence=record["confidence"],
                image_url=record["image_url"],
                classified=record["classified"],
                misclassified=record["misclassified"],
                created_at=record["created_at"]
            ) 
            for record in result
        ]


def get_metrics() -> List[MetricsType]:
    """
    Queries the Neo4j database for all nodes with label 'Metrics'
    and returns a list of metrics.
    """
    with driver.session() as session:
        result = session.run(
            """
            MATCH (m:Metrics)
            RETURN m
            """
        )
        return [
            MetricsType(
                metric_id=record["m"]["metric_id"],
                average_confidence_score=record["m"]["average_confidence_score"],
                average_inference_time=record["m"]["average_inference_time"],
                category_distribution=record["m"]["category_distribution"],
                category_percentages=record["m"]["category_percentages"],
                confidence_distribution=record["m"]["confidence_distribution"],
                detection_count_distribution=record["m"]["detection_count_distribution"],
                inference_time_distribution=record["m"]["inference_time_distribution"],
                label_avg_confidences=record["m"]["label_avg_confidences"],
                total_images=record["m"]["total_images"],
                total_inference_time=record["m"]["total_inference_time"],
                total_postprocessing_time=record["m"]["total_postprocessing_time"],
                total_preprocessing_time=record["m"]["total_preprocessing_time"],
                total_time=record["m"]["total_time"],
                average_box_size=record["m"]["average_box_size"],
                box_size_distribution=record["m"]["box_size_distribution"],
                average_box_proportion=record["m"]["average_box_proportion"],
                box_proportion_distribution=record["m"]["box_proportion_distribution"],
                average_preprocess_time=record["m"]["average_preprocess_time"],
                average_postprocess_time=record["m"]["average_postprocess_time"],
                preprocess_time_distribution=record["m"]["preprocess_time_distribution"],
                postprocess_time_distribution=record["m"]["postprocess_time_distribution"]
            )
            for record in result
        ]

def store_feedback(image_url: str, reviewed: bool = None, classified: bool = None, misclassified: bool = None) -> str:
    """
    Updates the Annotation node's properties based on feedback.
    
    :param image_url: The URL of the image whose annotation needs updating.
    :param reviewed: Boolean flag to update the 'reviewed' field.
    :param classified: Boolean flag to update the 'classified' field.
    :param misclassified: Boolean flag to update the 'misclassified' field.
    :return: A confirmation message indicating the update status.
    """
    try:
        with driver.session() as session:
            # ✅ First, check if the Image exists and has an Annotation
            check_query = """
            MATCH (i:Image {image_url: $image_url})-[:HAS_ANNOTATION]->(a:Annotation)
            RETURN a
            """
            check_result = session.run(check_query, image_url=image_url)

            if check_result.single() is None:
                return f"⚠️ Image found, but no annotation exists for: {image_url}"

            # ✅ If annotation exists, update it
            query = """
            MATCH (i:Image {image_url: $image_url})-[:HAS_ANNOTATION]->(a:Annotation)
            SET a.reviewed = COALESCE($reviewed, a.reviewed),
                a.classified = COALESCE($classified, a.classified),
                a.misclassified = COALESCE($misclassified, a.misclassified)
            RETURN COUNT(a) AS updatedCount
            """
            result = session.run(query, image_url=image_url, reviewed=reviewed, classified=classified, misclassified=misclassified)
            updated_count = result.single()["updatedCount"]

            if updated_count > 0:
                return f"✅ Successfully updated {updated_count} annotation(s) for image: {image_url}"
            else:
                return f"⚠️ No annotation updated for image URL: {image_url}. Data exists but was unchanged."

    except Exception as e:
        return f"❌ Error updating annotation: {str(e)}"



@strawberry.type
class Query:
    @strawberry.field
    def results(self) -> List[ResultType]:
        return get_results()

    @strawberry.field
    def metrics(self) -> List[MetricsType]:
        return get_metrics()    
    
@strawberry.type
class Mutation:
    @strawberry.mutation
    def store_feedback(
        self, image_url: str, reviewed: bool = None, classified: bool = None, misclassified: bool = None
    ) -> str:
        """
        Updates an annotation node's properties (reviewed, classified, misclassified).
        """
        return store_feedback(image_url, reviewed, classified, misclassified)


schema = strawberry.Schema(query=Query, mutation=Mutation)
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
