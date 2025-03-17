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

from model_client import upload_to_azure, process_image, send_results_to_server

# Mocking the Azure BlobServiceClient and YOLO model
@patch('model_client.BlobServiceClient')
@patch('model_client.YOLO')
def test_upload_to_azure(mock_yolo, mock_blob_service_client):
    """Test uploading an image to Azure Blob Storage."""

    mock_blob_client = MagicMock()
    mock_blob_service_client.from_connection_string.return_value.get_blob_client.return_value = mock_blob_client

    test_image_path = os.path.join(os.path.dirname(__file__), "test_images", "test_image.jpg")


    # Test uploading the image
    image_url = upload_to_azure(test_image_path)
    assert image_url.startswith("https://")
    assert "test_image.jpg" in image_url

if __name__ == "__main__":
    pytest.main()