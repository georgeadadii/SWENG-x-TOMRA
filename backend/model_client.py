import traceback
import grpc
import model_service_pb2
import model_service_pb2_grpc
import os
import uuid
import json
from collections import Counter
import metrics
import torch
import time
from torch.quantization import quantize_dynamic
from ultralytics import YOLO
from azure.storage.blob import BlobServiceClient
from models.model_factory import ModelFactory
from PIL import Image
import hashlib

AZURE_CONNECTION_STRING = "DefaultEndpointsProtocol=https;AccountName=sweng25group06;AccountKey=RdRBBOVWeYCd3WQOEmjzLY1nnDGBR7DblkGqnk7UenRP72DqmTtdqarsl15vYjxQRJ2E00Fn14Lo+ASts2WxPA==;EndpointSuffix=core.windows.net"
CONTAINER_NAME = "sweng25group06cont"

def compute_file_hash(file_path, hash_algorithm="sha256"):
    """Compute the hash of a file using the specified algorithm."""

    hash_func = hashlib.new(hash_algorithm)
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_func.update(chunk)
    return hash_func.hexdigest()

def upload_to_azure(image_path):
    """Upload an image to Azure Blob Storage using its hash as the blob name."""

    image_hash = compute_file_hash(image_path)
    blob_name = f"{image_hash}.{image_path.split('.')[-1]}"

    blob_service_client = BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING)
    blob_client = blob_service_client.get_blob_client(container=CONTAINER_NAME, blob=blob_name)

    if blob_client.exists():
        print(f"Image already exists in Azure Blob Storage: {blob_name}")
    else:
        with open(image_path, "rb") as data:
            blob_client.upload_blob(data, overwrite=True)
        print(f"Image uploaded to Azure Blob Storage: {blob_name}")

    """Creates the Blob URL"""
    image_url = f"https://{blob_service_client.account_name}.blob.core.windows.net/{CONTAINER_NAME}/{blob_name}"

    return image_url 

def process_image(image_path, model, quantize=False):
    """Process an image using YOLO and return class labels and confidences."""

    # Open the image to extract metadata
    with Image.open(image_path) as img:
        width, height = img.size
        image_format = img.format

    labels, confs, bboxes, pre_times, inf_times, post_times, proportions, orig_shape, task_type = model.process_image(image_path)

    return labels, confs, bboxes, pre_times, inf_times, post_times, proportions, orig_shape, task_type, width, height, image_format

def send_results_to_server(image_urls, labels_list, confs_list, bboxes_list, batch_id, task_type, pre_times, inf_times, post_times, box_props, widths, heights, formats, retries=3, delay=2):
    """Send a stream of image results to the gRPC server with retry logic."""
    
    # Create a generator to stream multiple requests
    def request_generator():
        for image_url, labels, confs, bboxes, pre_time, inf_time, post_time, box_prop, width, height, format in zip(image_urls, labels_list, confs_list, bboxes_list, pre_times, inf_times, post_times, box_props, widths, heights, formats):
            if task_type == "image_classification":
                bbox_coords = ["0,0,0,0"] 
                box_prop = [0]
            else:
                bbox_coords = [f"{x1},{y1},{x2},{y2}" for x1, y1, x2, y2 in bboxes]
            yield model_service_pb2.ResultsRequest(
                image_url=image_url,
                class_labels=labels,
                confidences=confs,
                batch_id=batch_id,
                task_type=task_type,
                bbox_coordinates=bbox_coords,
                preprocessing_time=pre_time,
                inference_time=inf_time,
                postprocessing_time=post_time,
                box_proportions=box_prop,
                image_width=width,         
                image_height=height,         
                image_format=format  
            )

    with grpc.insecure_channel("localhost:50051") as channel:
        stub = model_service_pb2_grpc.ModelServiceStub(channel)

        # Retry logic
        for attempt in range(retries):
            try:
                response_iterator = stub.StoreResults(request_generator())  # Send as a stream

                for image_name, response in zip(image_urls, response_iterator):
                    print(f"Server response for:\n{image_name}\n- {response.message}")
                return  # Exit the function if everything is successful

            except grpc.RpcError as e:
                print(f"gRPC Error1: {e.code()} - {e.details()}")

                if e.code() == grpc.StatusCode.UNAVAILABLE:  # Socket closed or server not available
                    print(f"gRPC Error: Socket closed, retrying in {delay} seconds...")
                    time.sleep(delay)
                else:
                    # If it's not a transient error, re-raise it
                    raise

            except Exception as e:
                print(f"Unexpected error while sending results: {str(e)}")
                break  # Exit the loop on unexpected error

        print("Max retries reached, operation failed.")

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

def run(model_name, quantize=False):
    try:
        model = ModelFactory.create_model(model_name, quantize)

        # Path to the folder containing unprocessed images
        unprocessed_folder_path = "unprocessed_images"
        image_extensions = (".jpg", ".jpeg", ".png", ".bmp", ".tiff")
        image_files = [f for f in os.listdir(unprocessed_folder_path) if f.lower().endswith(image_extensions)]

        if not image_files:
            print("No images found in the unprocessed_images folder.")
            return

        batch_id = str(uuid.uuid4())
        data = {
            'image_urls': [],
            'pre_times': [],
            'inf_times': [],
            'post_times': [],
            'confs_list': [],
            'labels_list': [],
            'detections': [],
            'label_counts': [],
            'bboxes_list': [],
            'box_props': [],
            'orig_shapes': [],
            'widths': [],  # New field for image widths
            'heights': [], # New field for image heights
            'formats': []  # New field for image formats
        }

        # Process each image and accumulate results for streaming
        for image_name in image_files:
            image_path = os.path.join(unprocessed_folder_path, image_name)
            print(f"Processing image: {image_name}")

            image_url = upload_to_azure(image_path)

            # Process the image using YOLO
            labels, confs, bboxes, pre_times, inf_times, post_times, proportions, orig_shape, task_type, width, height, format  = process_image(image_path, model, quantize)

            data['image_urls'].append(image_url)
            data['pre_times'].extend(pre_times)
            data['inf_times'].extend(inf_times)
            data['post_times'].extend(post_times)
            data['confs_list'].append(confs)
            data['labels_list'].append(labels)
            data['detections'].append(len(labels))
            data['label_counts'].append(Counter(labels))
            data['bboxes_list'].append(bboxes)
            data['box_props'].append(proportions)
            data['orig_shapes'].append(orig_shape)
            data['widths'].append(width)      # Add image width
            data['heights'].append(height)    # Add image height
            data['formats'].append(format)


        # After all images are processed, send the results to the server in a stream
        send_results_to_server(
            data['image_urls'],  
            data['labels_list'],  
            data['confs_list'],  
            data['bboxes_list'], 
            batch_id, 
            task_type,
            data['pre_times'],
            data['inf_times'],
            data['post_times'],
            data['box_props'],
            data['widths'],       # Pass image widths
            data['heights'],     # Pass image heights
            data['formats']      # Pass image formats
        )

        print("pre_times:",data['pre_times'])

        # Now, calculate and send the metrics
        stats = {
            "Total images": metrics.calculate_total_images(data['image_urls']),
            "Total time": metrics.calculate_total_time(data['pre_times'], data['inf_times'], data['post_times']),
            "Total preprocessing time": metrics.calculate_total_preprocessing_time(data['pre_times']),
            "Total inference time": metrics.calculate_total_inference_time(data['inf_times']),
            "Total postprocessing time": metrics.calculate_total_postprocessing_time(data['post_times']),
            "Average preprocess time": metrics.calculate_avg_preprocess_time(data['pre_times']),
            "Average inference time": metrics.calculate_avg_inference_time(data['inf_times']),
            "Average postprocess time": metrics.calculate_avg_postprocess_time(data['post_times']),
            "Average confidence score": metrics.calculate_avg_confidence(data['confs_list']),
            "Average confidence for different labels": metrics.calculate_label_avg_confidences(data['labels_list'], data['confs_list']),
            "Confidence distribution": metrics.calculate_confidence_distribution(data['confs_list']),
            "Detection count distribution": metrics.calculate_detection_distribution(data['detections']),
            "Category distribution": metrics.calculate_category_distribution(data['label_counts']),
            "Category percentages": metrics.calculate_category_percentages(metrics.calculate_category_distribution(data['label_counts'])),
            "Inference time distribution": metrics.calculate_inference_time_distribution(data['inf_times']),
            "Preprocess time distribution": metrics.calculate_preprocess_time_distribution(data['pre_times']),
            "Postprocess time distribution": metrics.calculate_postprocess_time_distribution(data['post_times']),
            "Average box size": metrics.calculate_avg_box_size(data['bboxes_list'], data['orig_shapes']),
            "Box size distribution": metrics.calculate_box_size_distribution(data['bboxes_list'], data['orig_shapes']),
            "Average box proportion": metrics.calculate_avg_box_proportion(data['box_props']),
            "Box proportion distribution": metrics.calculate_box_proportion_distribution(data['box_props'])
        }

        # Send metrics to the server
        send_metrics_to_server(stats, batch_id)

    except Exception as e:
        print(f"Client error: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Run the model client.")
    parser.add_argument("--model", type=str, choices=["yolo", "efficientnet"], default="yolo", help="Select the model to use.")
    parser.add_argument("--quantize", action="store_true", help="Quantize the model for lower energy consumption.")
    args = parser.parse_args()

    run(args.model, args.quantize)
