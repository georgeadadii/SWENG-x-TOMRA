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

    return labels, confs, bboxes, preprocess_times, inference_times, postprocess_times, box_proportions, orig_shape

def calculate_total_images(image_names):
    return len(image_names)

def calculate_total_time(pre_times, inf_times, post_times):
    return round(sum(pre_times) + sum(inf_times) + sum(post_times), 2)

def calculate_avg_confidence(confidence_scores):
    all_confidences = [conf for conf_list in confidence_scores for conf in conf_list]
    return round(mean(all_confidences), 2) if all_confidences else 0

def calculate_label_avg_confidences(detected_labels, confidence_scores):
    label_avg_confidences = {}
    for label in set([label for labels in detected_labels for label in labels]):
        label_confidences = []
        for i, labels in enumerate(detected_labels):
            for j, detected_label in enumerate(labels):
                if detected_label == label:
                    label_confidences.append(confidence_scores[i][j])
        if label_confidences:
            label_avg_confidences[label] = round(mean(label_confidences), 2)
    return label_avg_confidences  

def calculate_confidence_distribution(confidence_scores):
    all_confidences = [conf for conf_list in confidence_scores for conf in conf_list]
    dist = {f"{i/10:.1f}-{(i+1)/10:.1f}":0 for i in range(10)}
    for conf in all_confidences:
        index = min(int(conf*10), 9)
        dist[list(dist.keys())[index]] += 1
    return dist

def calculate_detection_distribution(total_detections):
    if not total_detections:
        return {}
    detection_distribution = {i: 0 for i in range(0, max(total_detections) + 1)}
    for detections in total_detections:
        detection_distribution[detections] += 1
    return detection_distribution  

def calculate_category_distribution(label_counts):
    category_dist = Counter()
    for lc in label_counts:
        category_dist.update(lc)
    return dict(category_dist)

def calculate_category_percentages(category_dist):
    total = sum(category_dist.values())
    return {k: round(v/total*100, 2) for k, v in category_dist.items()} if total else {}

def calculate_total_preprocessing_time(pre_times):
    return round(sum(pre_times), 2)

def calculate_total_inference_time(inf_times):
    return round(sum(inf_times), 2)

def calculate_total_postprocessing_time(post_times):
    return round(sum(post_times), 2)

def calculate_avg_inference_time(inf_times):
    return round(mean(inf_times), 2) if inf_times else 0

def calculate_inference_time_distribution(inference_times):
    if not inference_times:
        return {"0-1ms": 0}
    start = max(0, int(min(inference_times)) - 2)
    end = int(max(inference_times)) + 2
    inference_time_distribution = {f"{i}-{i + 1}ms": 0 for i in range(start, end)}
    for time in inference_times:
        index = int(time)
        key = f"{index}-{index + 1}ms"
        if key not in inference_time_distribution:
            continue
        inference_time_distribution[key] += 1
    return inference_time_distribution

def calculate_avg_box_size(bounding_boxes, orig_shapes):
    box_sizes = []
    for bboxes, (h, w) in zip(bounding_boxes, orig_shapes):
        for x1, y1, x2, y2 in bboxes:
            box_sizes.append((x2-x1) * (y2-y1))
    return round(mean(box_sizes), 2) if box_sizes else 0

def calculate_box_size_distribution(bounding_boxes, orig_shapes):
    box_sizes = []
    for bboxes, (h, w) in zip(bounding_boxes, orig_shapes):
        for x1, y1, x2, y2 in bboxes:
            box_sizes.append((x2 - x1) * (y2 - y1))

    if not box_sizes:
        return {"0-0": 0}

    min_size = min(box_sizes)
    max_size = max(box_sizes)
    num_bins = 5
    bin_width = (max_size - min_size) / num_bins
    distribution = {}
    for i in range(num_bins):
        lower = int(min_size + i * bin_width)
        upper = int(min_size + (i + 1) * bin_width)
        key = f"{lower}-{upper}"
        distribution[key] = 0

    for size in box_sizes:
        index = min(int((size - min_size) // bin_width), num_bins - 1)
        key = list(distribution.keys())[index]
        distribution[key] += 1
    return distribution

def calculate_avg_box_proportion(box_proportions):
    all_props = [p for plist in box_proportions for p in plist]
    return round(mean(all_props), 4) if all_props else 0

def calculate_box_proportion_distribution(box_proportions):
    all_props = [p for plist in box_proportions for p in plist]
    dist = {f"{i/10:.1f}-{(i+1)/10:.1f}": 0 for i in range(10)}
    for prop in all_props:
        index = min(int(prop*10), 9)
        dist[list(dist.keys())[index]] += 1
    return dist

def calculate_avg_preprocess_time(pre_times):
    return round(mean(pre_times), 2) if pre_times else 0

def calculate_avg_postprocess_time(post_times):
    return round(mean(post_times), 2) if post_times else 0

def calculate_preprocess_time_distribution(preprocess_times):
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
    return preprocess_dist

def calculate_postprocess_time_distribution(postprocess_times):
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
    return postprocess_dist
    
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
            labels, confs, bboxes, pre_times, inf_times, post_times, proportions, orig_shape = process_image(image_path)

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

            send_results_to_server(image_url, labels, confs,batch_id)

        stats = {
            "Total images": calculate_total_images(data['image_names']),
            "Total time": calculate_total_time(data['pre_times'], data['inf_times'], data['post_times']),
            "Total preprocessing time": calculate_total_preprocessing_time(data['pre_times']),
            "Total inference time": calculate_total_inference_time(data['inf_times']),
            "Total postprocessing time": calculate_total_postprocessing_time(data['post_times']),
            "Average preprocess time": calculate_avg_preprocess_time(data['pre_times']),
            "Average inference time": calculate_avg_inference_time(data['inf_times']),
            "Average postprocess time": calculate_avg_postprocess_time(data['post_times']),
            "Average confidence score": calculate_avg_confidence(data['confs']),
            "Average confidence for different labels": calculate_label_avg_confidences(data['labels'], data['confs']),
            "Confidence distribution": calculate_confidence_distribution(data['confs']),
            "Detection count distribution": calculate_detection_distribution(data['detections']),
            "Category distribution": calculate_category_distribution(data['label_counts']),
            "Category percentages": calculate_category_percentages(calculate_category_distribution(data['label_counts'])),
            "Inference time distribution": calculate_inference_time_distribution(data['inf_times']),
            "Preprocess time distribution": calculate_preprocess_time_distribution(data['pre_times']),
            "Postprocess time distribution": calculate_postprocess_time_distribution(data['post_times']),
            "Average box size": calculate_avg_box_size(data['bboxes'], data['orig_shapes']),
            "Box size distribution": calculate_box_size_distribution(data['bboxes'], data['orig_shapes']),
            "Average box proportion": calculate_avg_box_proportion(data['box_props']),
            "Box proportion distribution": calculate_box_proportion_distribution(data['box_props'])
        }
        # Send metrics to the server
        send_metrics_to_server(stats, batch_id)

    except Exception as e:
        print(f"Client error: {e}")

if __name__ == "__main__":
    run()
