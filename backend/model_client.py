import grpc
import model_service_pb2
import model_service_pb2_grpc
import os

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

            image_url = upload_to_azure(image_path)

            # Process the image using YOLO
            labels, confs = process_image(image_path)

            # Send the image and results to the server
            send_results_to_server(image_url, labels, confs)

    except Exception as e:
        print(f"Client error: {e}")

if __name__ == "__main__":
    run()
