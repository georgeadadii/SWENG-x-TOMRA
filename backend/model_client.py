import grpc
import model_service_pb2
import model_service_pb2_grpc
import neo4j_service_pb2
import os
from collections import Counter
from statistics import mean

if os.getenv("CI") != "true":
    from ultralytics import YOLO
else:
    class YOLO:
        def __init__(self, *args, **kwargs):
            pass
        def predict(self, *args, **kwargs):
            return "Mocked prediction for CI"

from azure.storage.blob import BlobServiceClient

# def load_image_data(image_path):
#     """Load image data from a file as bytes."""
#     with open(image_path, "rb") as f:
#         return f.read()

AZURE_CONNECTION_STRING = "DefaultEndpointsProtocol=https;AccountName=sweng25group06;AccountKey=RdRBBOVWeYCd3WQOEmjzLY1nnDGBR7DblkGqnk7UenRP72DqmTtdqarsl15vYjxQRJ2E00Fn14Lo+ASts2WxPA==;EndpointSuffix=core.windows.net"
CONTAINER_NAME = "sweng25group06cont"

def upload_to_azure(image_path):
    blob_service_client = BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING)
    blob_client = blob_service_client.get_blob_client(container=CONTAINER_NAME, blob=os.path.basename(image_path))

    with open(image_path, "rb") as data:
        blob_client.upload_blob(data, overwrite=True)

    """Creates the Blob URL"""
    image_url = f"https://{blob_service_client.account_name}.blob.core.windows.net/{CONTAINER_NAME}/{os.path.basename(image_path)}"
    print(image_url)

    return image_url  

def process_image(image_path):
    """Process an image using YOLO and return class labels and confidences."""
    model = YOLO("yolo11n.pt")

    results = model(image_path, verbose=False)
    boxes = results[0].boxes

    confs = boxes.conf.tolist() if boxes.conf is not None else []
    class_ids = boxes.cls.tolist() if boxes.cls is not None else []
    labels = [results[0].names[int(cls)] for cls in class_ids]

    return labels, confs

def calculate_metrics(image_names, preprocess_times, inference_times, postprocess_times, confidence_scores, total_detections, detected_labels, label_counts):
    # 统计计算
    total_images = len(image_names)
    total_time = sum(preprocess_times) + sum(inference_times) + sum(postprocess_times)
    all_confidences = [conf for conf_list in confidence_scores for conf in conf_list]
    average_confidence = round(mean(all_confidences), 2)

    label_avg_confidences = {}
    for label in set([label for labels in detected_labels for label in labels]):
        label_confidences = []
        for i, labels in enumerate(detected_labels):
            for j, detected_label in enumerate(labels):
                if detected_label == label:
                    label_confidences.append(confidence_scores[i][j])
        if label_confidences:
            label_avg_confidences[label] = round(mean(label_confidences), 2)

    confidence_distribution = {f"{i/10:.1f}-{(i+1)/10:.1f}": 0 for i in range(10)}
    for conf in all_confidences:
        index = int(conf * 10)
        confidence_range = f"{index/10:.1f}-{(index+1)/10:.1f}"
        confidence_distribution[confidence_range] += 1

    detection_distribution = {i: 0 for i in range(0, max(total_detections) + 1)}
    for detections in total_detections:
        detection_distribution[detections] += 1

    category_distribution = Counter()
    for label_count in label_counts:
        for label, count in label_count.items():
            category_distribution[label] += count

    total_labels_count = sum(category_distribution.values())
    category_percentages = {label: round((count / total_labels_count) * 100, 2) for label, count in category_distribution.items()}

    total_preprocess_time = sum(preprocess_times)
    total_inference_time = sum(inference_times)
    total_postprocess_time = sum(postprocess_times)

    average_inference_time = round(mean(inference_times), 2)

    inference_time_distribution = {f"{i}-{i+1}ms": 0 for i in range(0, int(max(inference_times)) + 2)}
    for time in inference_times:
        index = int(time)
        inference_time_distribution[f"{index}-{index+1}ms"] += 1
    stats = {
        "Total images": total_images,
        "Total time": round(total_time, 2),
        "Average confidence score": average_confidence,
        "Average confidence for different labels": label_avg_confidences,
        "Confidence distribution": confidence_distribution,
        "Detection count distribution": detection_distribution,
        "Category distribution": category_distribution,
        "Category percentages": category_percentages,
        "Total preprocessing time": round(total_preprocess_time, 2),
        "Total inference time": round(total_inference_time, 2),
        "Total postprocessing time": round(total_postprocess_time, 2),
        "Average inference time": average_inference_time,
        "Inference time distribution": inference_time_distribution
    }
    return stats


def send_results_to_server(image_url, labels, confs):
    """Send image data and results to the gRPC server."""
    with grpc.insecure_channel("localhost:50051") as channel:
        stub = model_service_pb2_grpc.ModelServiceStub(channel)
        request = model_service_pb2.ResultsRequest(
            image_url=image_url,
            class_labels=labels,
            confidences=confs
        )
        response = stub.StoreResults(request)
        print(f"Server response: {response.message}")

def send_metrics_to_server(metrics):
    """Send computed metrics to the gRPC server."""
    with grpc.insecure_channel("localhost:50051") as channel:
        stub = model_service_pb2_grpc.ModelServiceStub(channel)
        request = model_service_pb2.MetricsRequest(
            total_images=metrics["Total images"],
            total_time=metrics["Total time"],
            average_confidence_score=metrics["Average confidence score"],
            average_confidence_for_labels=metrics["Average confidence for different labels"],
            confidence_distribution=metrics["Confidence distribution"],
            detection_count_distribution=metrics["Detection count distribution"],
            category_distribution=metrics["Category distribution"],
            category_percentages=metrics["Category percentages"],
            total_preprocessing_time=metrics["Total preprocessing time"],
            total_inference_time=metrics["Total inference time"],
            total_postprocessing_time=metrics["Total postprocessing time"],
            average_inference_time=metrics["Average inference time"],
            inference_time_distribution=metrics["Inference time distribution"]
        )
        response = stub.StoreMetrics(request)
        print(f"Server response: {response.message}")


def run():
    try:
        # Path to the folder containing unprocessed images
        unprocessed_folder_path = "unprocessed_images"
        image_extensions = (".jpg", ".jpeg", ".png", ".bmp", ".tiff")
        image_files = [f for f in os.listdir(unprocessed_folder_path) if f.lower().endswith(image_extensions)]

        if not image_files:
            print("No images found in the unprocessed_images folder.")
            return
        image_names = []
        preprocess_times = []
        inference_times = []
        postprocess_times = []
        confidence_scores = []
        total_detections = []
        detected_labels = []
        label_counts = []

        # Process each image and send results to the server
        for image_name in image_files:
            image_path = os.path.join(unprocessed_folder_path, image_name)
            print(f"Processing image: {image_name}")

            image_url = upload_to_azure(image_path)

            # Process the image using YOLO
            labels, confs = process_image(image_path)

            # Send the image and results to the server
            send_results_to_server(image_url, labels, confs)

            image_names.append(image_name)
            preprocess_times.append(0)  # Replace with actual preprocess time if available
            inference_times.append(0)  # Replace with actual inference time if available
            postprocess_times.append(0)  # Replace with actual postprocess time if available
            confidence_scores.append(confs)
            total_detections.append(len(labels))
            detected_labels.append(labels)
            label_counts.append(Counter(labels))

            # Calculate metrics
            metrics = calculate_metrics(image_names, preprocess_times, inference_times, postprocess_times,
                                        confidence_scores, total_detections, detected_labels, label_counts)

            # Send metrics to the server
            send_metrics_to_server(metrics)

    except Exception as e:
        print(f"Client error: {e}")

if __name__ == "__main__":
    run()
