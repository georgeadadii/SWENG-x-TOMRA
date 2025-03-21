import grpc
import model_service_pb2
import model_service_pb2_grpc
import os
import uuid
import json
from collections import Counter
import metrics
import torch
from torch.quantization import quantize_dynamic
from ultralytics import YOLO
from azure.storage.blob import BlobServiceClient
from models.model_factory import ModelFactory
from PIL import Image
import hashlib
from azure.identity import ClientSecretCredential
from azure.keyvault.secrets import SecretClient
from pathlib import Path
from dotenv import load_dotenv

env_path = Path("..") / ".env"  
load_dotenv(dotenv_path=env_path)

TENANT_ID = os.getenv("AZURE_TENANT_ID")
CLIENT_ID = os.getenv("AZURE_CLIENT_ID")
CLIENT_SECRET = os.getenv("AZURE_CLIENT_SECRET")

if not all([TENANT_ID, CLIENT_ID, CLIENT_SECRET]):
    raise ValueError("Missing one or more required environment variables: AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET")

print(TENANT_ID)

KEY_VAULT_URL = "https://sweng25group06keyvault.vault.azure.net/"
credential = ClientSecretCredential(TENANT_ID, CLIENT_ID, CLIENT_SECRET)
secret_client = SecretClient(vault_url=KEY_VAULT_URL, credential=credential)

secret = secret_client.get_secret("AZURE-CONNECTION-STRING")
AZURE_CONNECTION_STRING = secret.value
secret = secret_client.get_secret("CONTAINER-NAME")
CONTAINER_NAME = secret.value

def compute_file_hash(file_path, hash_algorithm="sha256"):
    """Compute the hash of a file using the specified algorithm."""

    hash_func = hashlib.new(hash_algorithm)
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_func.update(chunk)
    return hash_func.hexdigest()

def upload_to_azure(image_path):
    blob_service_client = BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING)
    blob_client = blob_service_client.get_blob_client(container=CONTAINER_NAME, blob=os.path.basename(image_path))

    with open(image_path, "rb") as data:
        blob_client.upload_blob(data, overwrite=True)

    """Creates the Blob URL"""
    image_url = f"https://{blob_service_client.account_name}.blob.core.windows.net/{CONTAINER_NAME}/{os.path.basename(image_path)}"
    print(image_url)

    return image_url 

def quantize_model(model):
    """Quantize the YOLO model for lower energy consumption."""
    print("Quantizing model...")
    # Quantize the model dynamically (weights only)
    quantized_model = quantize_dynamic(model, {torch.nn.Linear}, dtype=torch.qint8)
    return quantized_model 

def process_image(image_path, model, quantize=False):
    """Process an image using YOLO and return class labels and confidences."""

    preprocess_times = []
    inference_times = []
    postprocess_times = []

    results = model.model(image_path, verbose=False)
    boxes = results[0].boxes
    speed_info = results[0].speed
    orig_shape = results[0].orig_shape

    preprocess_times.append(speed_info["preprocess"])
    inference_times.append(speed_info["inference"])
    postprocess_times.append(speed_info["postprocess"])

    bboxes = boxes.xyxy.tolist() if boxes.xyxy is not None else []
    confs = boxes.conf.tolist() if boxes.conf is not None else []
    class_ids = boxes.cls.tolist() if boxes.cls is not None else []
    labels = [results[0].names[int(cls)] for cls in class_ids] if class_ids else []

    width, height = orig_shape[1], orig_shape[0]
    box_proportions = []
    for x1, y1, x2, y2 in bboxes:
        box_area = (x2 - x1) * (y2 - y1)
        proportion = box_area / (width * height)
        box_proportions.append(round(proportion, 4))
    return labels, confs, bboxes, preprocess_times, inference_times, postprocess_times, box_proportions, orig_shape, model.get_task_type()

def send_results_to_server(image_url, labels, confs, batch_id, task_type):
    """Send image data and results to the gRPC server."""
    with grpc.insecure_channel("localhost:50051") as channel:
        stub = model_service_pb2_grpc.ModelServiceStub(channel)
        request = model_service_pb2.ResultsRequest(
            image_url=image_url,
            class_labels=labels,
            confidences=confs,
            batch_id=batch_id,
            task_type=task_type
        )
        response = stub.StoreResults(request)
        print(f"Server response: {response.message}")

def send_metrics_to_server(metrics, batch_id):
    """Send computed metrics to the gRPC server."""
    with grpc.insecure_channel("localhost:50051") as channel:
        stub = model_service_pb2_grpc.ModelServiceStub(channel)
        request = model_service_pb2.MetricsRequest(
            total_images=metrics["Total images"],
            total_time=metrics["Total time"],
            average_confidence_score=metrics["Average confidence score"],
            average_confidence_for_labels=json.dumps(metrics["Average confidence for different labels"]),
            confidence_distribution=json.dumps(metrics["Confidence distribution"]),
            detection_count_distribution=json.dumps(metrics["Detection count distribution"]),
            category_distribution=json.dumps(metrics["Category distribution"]),
            category_percentages=json.dumps(metrics["Category percentages"]),
            total_preprocessing_time=metrics["Total preprocessing time"],
            total_inference_time=metrics["Total inference time"],
            total_postprocessing_time=metrics["Total postprocessing time"],
            average_inference_time=metrics["Average inference time"],
            inference_time_distribution=json.dumps(metrics["Inference time distribution"]),
            average_box_size=metrics["Average box size"],
            box_size_distribution=json.dumps(metrics["Box size distribution"]),
            average_box_proportion=metrics["Average box proportion"],
            box_proportion_distribution=json.dumps(metrics["Box proportion distribution"]),
            average_preprocess_time=metrics["Average preprocess time"],
            average_postprocess_time=metrics["Average postprocess time"],
            preprocess_time_distribution=json.dumps(metrics["Preprocess time distribution"]),
            postprocess_time_distribution=json.dumps(metrics["Postprocess time distribution"]),
            batch_id=batch_id
        )
        response = stub.StoreMetrics(request)
        print(f"Server response: {response.message}")

def run(quantize=False):
    try:
        # Initialize the model
        model = YOLOv11("yolo11n.pt")  

        # Quantize the model if requested
        if quantize:
            model.model = quantize_model(model.model)

        # Path to the folder containing unprocessed images
        unprocessed_folder_path = "unprocessed_images"
        image_extensions = (".jpg", ".jpeg", ".png", ".bmp", ".tiff")
        image_files = [f for f in os.listdir(unprocessed_folder_path) if f.lower().endswith(image_extensions)]

        if not image_files:
            print("No images found in the unprocessed_images folder.")
            return

        batch_id = str(uuid.uuid4())
        data = {
            'image_names': [],
            'pre_times': [],
            'inf_times': [],
            'post_times': [],
            'confs': [],
            'labels': [],
            'detections': [],
            'label_counts': [],
            'bboxes': [],
            'box_props': [],
            'orig_shapes': []
        }

        # Process each image and send results to the server
        for image_name in image_files:
            image_path = os.path.join(unprocessed_folder_path, image_name)
            print(f"Processing image: {image_name}")

            image_url = upload_to_azure(image_path)

            # Process the image using YOLO
            labels, confs, bboxes, pre_times, inf_times, post_times, proportions, orig_shape, task_type  = process_image(image_path, model, quantize)

            data['image_names'].append(image_name)
            data['pre_times'].extend(pre_times)
            data['inf_times'].extend(inf_times)
            data['post_times'].extend(post_times)
            data['confs'].append(confs)
            data['labels'].append(labels)
            data['detections'].append(len(labels))
            data['label_counts'].append(Counter(labels))
            data['bboxes'].append(bboxes)
            data['box_props'].append(proportions)
            data['orig_shapes'].append(orig_shape)

            send_results_to_server(image_url, labels, confs, batch_id, task_type)

        stats = {
            "Total images": metrics.calculate_total_images(data['image_names']),
            "Total time": metrics.calculate_total_time(data['pre_times'], data['inf_times'], data['post_times']),
            "Total preprocessing time": metrics.calculate_total_preprocessing_time(data['pre_times']),
            "Total inference time": metrics.calculate_total_inference_time(data['inf_times']),
            "Total postprocessing time": metrics.calculate_total_postprocessing_time(data['post_times']),
            "Average preprocess time": metrics.calculate_avg_preprocess_time(data['pre_times']),
            "Average inference time": metrics.calculate_avg_inference_time(data['inf_times']),
            "Average postprocess time": metrics.calculate_avg_postprocess_time(data['post_times']),
            "Average confidence score": metrics.calculate_avg_confidence(data['confs']),
            "Average confidence for different labels": metrics.calculate_label_avg_confidences(data['labels'], data['confs']),
            "Confidence distribution": metrics.calculate_confidence_distribution(data['confs']),
            "Detection count distribution": metrics.calculate_detection_distribution(data['detections']),
            "Category distribution": metrics.calculate_category_distribution(data['label_counts']),
            "Category percentages": metrics.calculate_category_percentages(metrics.calculate_category_distribution(data['label_counts'])),
            "Inference time distribution": metrics.calculate_inference_time_distribution(data['inf_times']),
            "Preprocess time distribution": metrics.calculate_preprocess_time_distribution(data['pre_times']),
            "Postprocess time distribution": metrics.calculate_postprocess_time_distribution(data['post_times']),
            "Average box size": metrics.calculate_avg_box_size(data['bboxes'], data['orig_shapes']),
            "Box size distribution": metrics.calculate_box_size_distribution(data['bboxes'], data['orig_shapes']),
            "Average box proportion": metrics.calculate_avg_box_proportion(data['box_props']),
            "Box proportion distribution": metrics.calculate_box_proportion_distribution(data['box_props'])
        }
        # Send metrics to the server
        send_metrics_to_server(stats, batch_id)

    except Exception as e:
        print(f"Client error: {e}")

if __name__ == "__main__":
    import argparse

    # Add command-line argument for quantization
    parser = argparse.ArgumentParser(description="Run the model client with optional quantization.")
    parser.add_argument("--quantize", action="store_true", help="Quantize the model for lower energy consumption.")
    args = parser.parse_args()

    run(quantize=args.quantize)
