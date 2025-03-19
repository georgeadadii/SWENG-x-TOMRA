import torch
from ultralytics import YOLO
from .base_model import BaseModel
import torch
from torch.quantization import quantize_dynamic

class YOLOv11(BaseModel):
    def __init__(self, model_path):
        self.model = YOLO(model_path)
        self.task_type = "object_detection"

    def get_task_type(self):
        return self.task_type

    def process_image(self, image_path):
        """Process an image using YOLO and return results."""
        preprocess_times = []
        inference_times = []
        postprocess_times = []

        results = self.model(image_path, verbose=False)
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


        return labels, confs, bboxes, preprocess_times, inference_times, postprocess_times, box_proportions, orig_shape, self.get_task_type()

    def quantize_model(self):
        """Quantize the YOLO model."""
        print("Quantizing YOLO model...")
        self.model = quantize_dynamic(self.model, {torch.nn.Linear}, dtype=torch.qint8)