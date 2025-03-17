import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from unittest.mock import MagicMock, patch
with patch.dict('sys.modules', {'azure.cosmos': MagicMock()}):
    from model_service import ModelService

import pytest
import grpc
from model_service_pb2 import ResultsRequest, ResultsResponse
import requests


@pytest.fixture
def model_service():
    """Fixture to create a ModelService instance with a mocked Neo4jService."""
    model_service = ModelService()
    model_service.neo4j_stub = MagicMock()
    return model_service

@patch("requests.get")
def test_store_results(mock_get, model_service):
    """Test storing results in the ModelService with a mocked Neo4jService."""

    # Mock the HTTP response
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.content = b"fake image data"
    mock_get.return_value = mock_response

    # Mock the Neo4jService response as a generator (to simulate streaming)
    def mock_neo4j_stream(request_iterator):
        for request in request_iterator:
            yield ResultsResponse(success=True, message="Neo4j stored successfully.")

    model_service.neo4j_stub.StoreResult.side_effect = mock_neo4j_stream

    # Create a mock request
    request = ResultsRequest(
        image_url="https://youraccount.blob.core.windows.net/container/yourimage.jpg",
        class_labels=["label1", "label2"],
        confidences=[0.9, 0.8],
        batch_id="5432",
        task_type="object_detection",
        bbox_coordinates=["0.2,0.2,0.2,0.2", "0.3,0.3,0.3,0.3"]
    )

    # Call StoreResults (which is now a generator)
    response_stream = model_service.StoreResults(iter([request]), None)

    # Iterate over the responses to assert correctness
    for response in response_stream:
        assert response.success
        assert response.message in ["Results and image stored successfully.", "Partial success, some issues encountered.", "Results stored successfully."]

    # Verify the Neo4jService is called
    assert model_service.neo4j_stub.StoreResult.call_count == 2  # Should be called once per request batch
