import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import pytest
from unittest.mock import MagicMock
import grpc
from model_service_pb2 import ResultsRequest
from model_service import ModelService

@pytest.fixture
def model_service():
    """Fixture to create a ModelService instance with a mocked Neo4jService."""
    # Mock the Neo4jService client
    model_service = ModelService()
    model_service.neo4j_stub = MagicMock()
    return model_service

def test_store_results(model_service):
    """Test storing results in the ModelService with a mocked Neo4jService."""
    # Mock the Neo4jService response
    model_service.neo4j_stub.StoreResult.return_value = MagicMock(success=True)

    # Create a mock request
    request = ResultsRequest(
        image_url="http://example.com/image.jpg",
        class_labels=["label1", "label2"],
        confidences=[0.9, 0.8]
    )

    # Test storing results
    response = model_service.StoreResults(request, None)
    assert response.success
    assert response.message == "Results and image stored successfully"

    # Verify the Neo4jService is called
    assert model_service.neo4j_stub.StoreResult.call_count == 2  # Called for each label