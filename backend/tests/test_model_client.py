import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import pytest
from model_client import load_image_data, process_image

def test_load_image_data():
    """Test loading image data from a file."""
    # Create a temporary image file
    test_image_path = "test_image.jpg"
    with open(test_image_path, "wb") as f:
        f.write(b"fake image data")

    # Test loading the image
    image_data = load_image_data(test_image_path)
    assert isinstance(image_data, bytes)
    assert len(image_data) > 0

    os.remove(test_image_path)

def test_process_image():
    """Test processing an image using YOLO."""
    # Use a sample image (you can add a small test image to your repo)
    test_image_path = "backend/tests/test_images/test_image.jpg"
    if not os.path.exists(test_image_path):
        pytest.skip("Test image not found")

    # Test processing the image
    labels, confs = process_image(test_image_path)
    assert isinstance(labels, list)
    assert isinstance(confs, list)
    assert len(labels) == len(confs)