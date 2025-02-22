import grpc
import model_service_pb2
import model_service_pb2_grpc
import os
from collections import Counter
from statistics import mean
import uuid
import json

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
    preprocess_times = []
    inference_times = []
    postprocess_times = []

    results = model(image_path, verbose=False)
    boxes = results[0].boxes
    speed_info = results[0].speed
    height, width = results[0].orig_shape

    bboxes = boxes.xyxy.tolist() if boxes.xyxy is not None else []
    box_proportions = []
    for bbox in bboxes:
        x1, y1, x2, y2 = bbox
        box_area = (x2 - x1) * (y2 - y1)
        image_area = width * height
        proportion = box_area / image_area
        box_proportions.append(round(proportion, 4))

    preprocess_times.append(speed_info["preprocess"])
    inference_times.append(speed_info["inference"])
    postprocess_times.append(speed_info["postprocess"])

    confs = boxes.conf.tolist() if boxes.conf is not None else []
    class_ids = boxes.cls.tolist() if boxes.cls is not None else []
    labels = [results[0].names[int(cls)] for cls in class_ids]

    bboxes = boxes.xyxy.tolist() if boxes.xyxy is not None else []

    return labels, confs, bboxes, preprocess_times, inference_times, postprocess_times, box_proportions

def calculate_metrics(image_names, preprocess_times, inference_times, postprocess_times, confidence_scores, total_detections, detected_labels, label_counts, bounding_boxes, box_proportions):
    total_images = len(image_names)
    total_time = sum(preprocess_times) + sum(inference_times) + sum(postprocess_times)
    all_confidences = [conf for conf_list in confidence_scores for conf in conf_list]
    average_confidence = round(mean(all_confidences), 2)

    box_proportions = [p for proportions in box_proportions for p in proportions]
    average_proportion = round(mean(box_proportions), 4) if box_proportions else 0

    average_preprocess = round(mean(preprocess_times), 2) if preprocess_times else 0
    average_postprocess = round(mean(postprocess_times), 2) if postprocess_times else 0

    proportion_distribution = {f"{i / 10:.1f}-{(i + 1) / 10:.1f}": 0 for i in range(10)}
    for prop in box_proportions:
        index = int(prop * 10)
        proportion_range = f"{index / 10:.1f}-{(index + 1) / 10:.1f}"
        proportion_distribution[proportion_range] += 1

    box_sizes = []
    for bboxes in bounding_boxes:
        for bbox in bboxes:
            x1, y1, x2, y2 = bbox
            width = x2 - x1
            height = y2 - y1
            area = width * height
            box_sizes.append(int(area))

    average_box_size = round(mean(box_sizes), 2) if box_sizes else 0

    if box_sizes:
        min_box = min(box_sizes)
        max_box = max(box_sizes)
        num_bins = 5
        step = (max_box - min_box) / num_bins
        box_size_distribution = {f"{int(min_box + i * step)}-{int(min_box + (i + 1) * step)}": 0 for i in range(num_bins)}
        last_key = list(box_size_distribution.keys())[-1]
        box_size_distribution[f"{int(min_box + (num_bins - 1) * step)}-{int(max_box)+1}"] = box_size_distribution.pop(last_key)
        for size in box_sizes:
            index = min(int((size - min_box) // step), num_bins - 1)
            key = list(box_size_distribution.keys())[index]
            box_size_distribution[key] += 1
    else:
        box_size_distribution = {"0.0-0.0": 0}

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

    start = max(0, int(min(inference_times)) - 2)
    end = int(max(inference_times)) + 2
    inference_time_distribution = {f"{i}-{i + 1}ms": 0 for i in range(start, end)}
    for time in inference_times:
        index = int(time)
        inference_time_distribution[f"{index}-{index+1}ms"] += 1

    preprocess_dist = {}
    if preprocess_times:
        min_pre = min(preprocess_times)
        max_pre = max(preprocess_times)
        bin_width = (max_pre - min_pre) / 10
        for i in range(10):
            lower = round(min_pre + i * bin_width, 2)
            upper = round(min_pre + (i + 1) * bin_width, 2)
            preprocess_dist[f"{lower:.2f}-{upper:.2f}"] = 0
        for time in preprocess_times:
            index = min(int((time - min_pre) // bin_width), 9)
            key = list(preprocess_dist.keys())[index]
            preprocess_dist[key] += 1

    postprocess_dist = {}
    if postprocess_times:
        min_post = min(postprocess_times)
        max_post = max(postprocess_times)
        bin_width = (max_post - min_post) / 10
        for i in range(10):
            lower = round(min_post + i * bin_width, 2)
            upper = round(min_post + (i + 1) * bin_width, 2)
            postprocess_dist[f"{lower:.2f}-{upper:.2f}"] = 0
        for time in postprocess_times:
            index = min(int((time - min_post) // bin_width), 9)
            key = list(postprocess_dist.keys())[index]
            postprocess_dist[key] += 1

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
        "Inference time distribution": inference_time_distribution,
        "Average box size": average_box_size,
        "Box size distribution": box_size_distribution,
        "Average box proportion": average_proportion,
        "Box proportion distribution": proportion_distribution,
        "Average preprocess time": average_preprocess,
        "Average postprocess time": average_postprocess,
        "Preprocess time distribution": preprocess_dist,
        "Postprocess time distribution": postprocess_dist,
    }
    return stats


def send_results_to_server(image_url, labels, confs,batch_id):
    """Send image data and results to the gRPC server."""
    with grpc.insecure_channel("localhost:50051") as channel:
        stub = model_service_pb2_grpc.ModelServiceStub(channel)
        request = model_service_pb2.ResultsRequest(
            image_url=image_url,
            class_labels=labels,
            confidences=confs,
            batch_id=batch_id
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


def run():
    try:
        # Path to the folder containing unprocessed images
        unprocessed_folder_path = "unprocessed_images"
        image_extensions = (".jpg", ".jpeg", ".png", ".bmp", ".tiff")
        image_files = [f for f in os.listdir(unprocessed_folder_path) if f.lower().endswith(image_extensions)]

        if not image_files:
            print("No images found in the unprocessed_images folder.")
            return

        batch_id = str(uuid.uuid4())
        image_names = []
        preprocess_times = []
        inference_times = []
        postprocess_times = []
        confidence_scores = []
        total_detections = []
        detected_labels = []
        label_counts = []
        bounding_boxes = []
        box_proportions = []

        # Process each image and send results to the server
        for image_name in image_files:
            image_path = os.path.join(unprocessed_folder_path, image_name)
            print(f"Processing image: {image_name}")

            image_url = upload_to_azure(image_path)

            # Process the image using YOLO
            labels, confs, bboxes, pre_times, inf_times, post_times, proportions = process_image(image_path)

            preprocess_times.extend(pre_times)
            inference_times.extend(inf_times)
            postprocess_times.extend(post_times)

            image_names.append(image_name)
            confidence_scores.append(confs)
            total_detections.append(len(labels))
            detected_labels.append(labels)
            label_counts.append(Counter(labels))
            bounding_boxes.append(bboxes)
            box_proportions.append(proportions)

            # Send the image and results to the server
            send_results_to_server(image_url, labels, confs,batch_id)

        # Calculate metrics
        metrics = calculate_metrics(image_names, preprocess_times, inference_times, postprocess_times,confidence_scores, total_detections, detected_labels, label_counts, bounding_boxes, box_proportions)

        # Send metrics to the server
        send_metrics_to_server(metrics,batch_id)

    except Exception as e:
        print(f"Client error: {e}")

if __name__ == "__main__":
    run()
