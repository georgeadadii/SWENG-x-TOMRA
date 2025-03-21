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
from azure.cosmos import CosmosClient


@pytest.fixture
def model_service():
    """Fixture to create a ModelService instance with a mocked Neo4jService."""
    model_service = ModelService()
    model_service.neo4j_stub = MagicMock()
    
    model_service.cosmos_client = MagicMock(spec=CosmosClient)
    model_service.cosmos_db = MagicMock()
    model_service.cosmos_container = MagicMock()
    
    model_service.cosmos_client.get_database_client.return_value = model_service.cosmos_db
    model_service.cosmos_db.get_container_client.return_value = model_service.cosmos_container
    
    return model_service


@patch("requests.get")
def test_store_results(mock_get, model_service):
    """Test storing results in the ModelService with a mocked Neo4jService."""

    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.content = b"fake image data"
    mock_get.return_value = mock_response

    def mock_neo4j_stream(request_iterator):
        for request in request_iterator:
            yield ResultsResponse(success=True, message="Neo4j stored successfully.")

    model_service.neo4j_stub.StoreResult.side_effect = mock_neo4j_stream

    request = ResultsRequest(
        image_url="https://youraccount.blob.core.windows.net/container/yourimage.jpg",
        class_labels=["label1", "label2"],
        confidences=[0.9, 0.8],
        batch_id="5432",
        task_type="object_detection",
        bbox_coordinates=["0.2,0.2,0.2,0.2", "0.3,0.3,0.3,0.3"]
    )

    response_stream = model_service.StoreResults(iter([request]), None)

    for response in response_stream:
        assert response.success
        assert response.message in ["Results and image stored successfully.", "Partial success, some issues encountered.", "Results stored successfully."]

    assert model_service.neo4j_stub.StoreResult.call_count == 2  


def test_store_metrics_in_cosmos(model_service):
    """Test storing metrics in Cosmos DB."""

    metrics_data = {
        "image_url": "https://youraccount.blob.core.windows.net/container/yourimage.jpg",
        "top_label": "label1",
        "labels": ["label1", "label2"],
        "confidences": [0.9, 0.8],
        "preprocessing_time": 0.1,
        "inference_time": 0.2,
        "postprocessing_time": 0.3,
        "bbox_coordinates": ["0.2,0.2,0.2,0.2", "0.3,0.3,0.3,0.3"],
        "box_proportions": [0.5, 0.6]
    }
    batch_id = "1234"
    task_type = "object_detection"

    model_service.cosmos_container.create_item.return_value = {"id": "1234"}

    result = model_service.store_metrics_in_cosmos(metrics_data, batch_id, task_type)

    assert result is True

    model_service.cosmos_container.create_item.assert_called_once()
    call_args = model_service.cosmos_container.create_item.call_args[0][0]
    assert call_args["image_url"] == metrics_data["image_url"]
    assert call_args["top_label"] == metrics_data["top_label"]
    assert call_args["labels"] == metrics_data["labels"]
    assert call_args["confidences"] == metrics_data["confidences"]
    assert call_args["preprocessing_time"] == metrics_data["preprocessing_time"]
    assert call_args["inference_time"] == metrics_data["inference_time"]
    assert call_args["postprocessing_time"] == metrics_data["postprocessing_time"]
    assert call_args["bbox_coordinates"] == metrics_data["bbox_coordinates"]
    assert call_args["box_proportions"] == metrics_data["box_proportions"]


def test_store_metrics_in_cosmos_missing_field(model_service):
    """Test storing metrics in Cosmos DB with missing required fields."""

    metrics_data = {
        "image_url": "https://youraccount.blob.core.windows.net/container/yourimage.jpg",
        "top_label": "label1",
        "labels": ["label1", "label2"]
    }

    model_service.cosmos_container.create_item.return_value = {"id": "0001"}

    with pytest.raises(ValueError) as exc_info:
        model_service.store_metrics_in_cosmos(metrics_data)

    assert "Missing required field" in str(exc_info.value)


def test_store_metrics_in_cosmos_error(model_service):
    """Test storing metrics in Cosmos DB when an error occurs."""

    metrics_data = {
        "image_url": "https://youraccount.blob.core.windows.net/container/yourimage.jpg",
        "top_label": "label1",
        "labels": ["label1", "label2"],
        "confidences": [0.9, 0.8],
        "preprocessing_time": 0.1,
        "inference_time": 0.2,
        "postprocessing_time": 0.3,
        "bbox_coordinates": ["0.2,0.2,0.2,0.2", "0.3,0.3,0.3,0.3"],
        "box_proportions": [0.5, 0.6]
    }

    model_service.cosmos_container.create_item.side_effect = Exception("Cosmos DB error")

    result = model_service.store_metrics_in_cosmos(metrics_data)

    assert result is False