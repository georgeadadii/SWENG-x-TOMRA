import grpc
import model_service_pb2
import model_service_pb2_grpc
import os
from ultralytics import YOLO

def load_image_data(image_path):
    """Load image data from a file as bytes."""
    with open(image_path, "rb") as f:
        return f.read()

def process_image(image_path):
    """Process an image using YOLO and return class labels and confidences."""
    model = YOLO("yolo11n.pt")

    results = model(image_path, verbose=False)
    boxes = results[0].boxes

    confs = boxes.conf.tolist() if boxes.conf is not None else []
    class_ids = boxes.cls.tolist() if boxes.cls is not None else []
    labels = [results[0].names[int(cls)] for cls in class_ids]

    return labels, confs

def send_results_to_server(image_data, labels, confs):
    """Send image data and results to the gRPC server."""
    with grpc.insecure_channel("localhost:50051") as channel:
        stub = model_service_pb2_grpc.ModelServiceStub(channel)
        request = model_service_pb2.ResultsRequest(
            image_data=image_data,
            class_labels=labels,
            confidences=confs
        )
        response = stub.StoreResults(request)
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

        # Process each image and send results to the server
        for image_name in image_files:
            image_path = os.path.join(unprocessed_folder_path, image_name)
            print(f"Processing image: {image_name}")

            image_data = load_image_data(image_path)

            # Process the image using YOLO
            labels, confs = process_image(image_path)

            # Send the image and results to the server
            send_results_to_server(image_data, labels, confs)

    except Exception as e:
        print(f"Client error: {e}")

if __name__ == "__main__":
    run()
