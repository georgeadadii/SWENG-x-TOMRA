import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import pytest
from unittest.mock import patch, MagicMock

sys.modules["torch"] = MagicMock()
sys.modules["torchvision"] = MagicMock()
sys.modules["ultralytics"] = MagicMock()
sys.modules["torch.quantization"] = MagicMock()
sys.modules["efficientnet_pytorch"] = MagicMock()
sys.modules["PIL"] = MagicMock()
sys.modules["kaggle"] = MagicMock()
sys.modules["kaggle.api"] = MagicMock()
sys.modules["kaggle.api.kaggle_api_extended"] = MagicMock()

from model_client import upload_to_azure, process_image, send_results_to_server, compute_file_hash

# Mocking the Azure BlobServiceClient and YOLO model
@patch('model_client.BlobServiceClient')
@patch('model_client.YOLO')
def test_upload_to_azure(mock_yolo, mock_blob_service_client):
    """Test uploading an image to Azure Blob Storage with hashing."""

    # Mock the BlobClient
    mock_blob_client = MagicMock()
    mock_blob_service_client.from_connection_string.return_value.get_blob_client.return_value = mock_blob_client

    # Path to the test image
    test_image_path = os.path.join(os.path.dirname(__file__), "test_images", "test_image.jpg")

    # Compute the expected hash of the test image
    expected_hash = compute_file_hash(test_image_path)
    expected_blob_name = f"{expected_hash}.jpg"  # Hash + file extension

    # Mock the blob client's `exists` method to return False (blob does not exist)
    mock_blob_client.exists.return_value = False

    # Test uploading the image
    image_url = upload_to_azure(test_image_path)

    # Verify the blob name is based on the hash
    mock_blob_service_client.from_connection_string.return_value.get_blob_client.assert_called_with(
        container="sweng25group06cont", blob=expected_blob_name
    )

    # Verify the image URL is correctly formatted
    assert image_url.startswith("https://")
    assert expected_blob_name in image_url

    # Verify the blob was uploaded
    mock_blob_client.upload_blob.assert_called_once()

@patch('model_client.BlobServiceClient')
@patch('model_client.YOLO')
def test_upload_to_azure_duplicate(mock_yolo, mock_blob_service_client):
    """Test uploading a duplicate image to Azure Blob Storage."""

    mock_blob_client = MagicMock()
    mock_blob_service_client.from_connection_string.return_value.get_blob_client.return_value = mock_blob_client

    test_image_path = os.path.join(os.path.dirname(__file__), "test_images", "test_image.jpg")

    expected_hash = compute_file_hash(test_image_path)
    expected_blob_name = f"{expected_hash}.jpg"  # Hash + file extension

    mock_blob_client.exists.return_value = True

    image_url = upload_to_azure(test_image_path)

    mock_blob_service_client.from_connection_string.return_value.get_blob_client.assert_called_with(
        container="sweng25group06cont", blob=expected_blob_name
    )

    assert image_url.startswith("https://")
    assert expected_blob_name in image_url

    mock_blob_client.upload_blob.assert_not_called()

if __name__ == "__main__":
    pytest.main()