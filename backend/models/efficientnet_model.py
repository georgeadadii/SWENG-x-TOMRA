import torch
from efficientnet_pytorch import EfficientNet
from torchvision import transforms
from PIL import Image
from .base_model import BaseModel
import os
import json
import torch
import time
from torch.quantization import quantize_dynamic

class EfficientNetClassifier(BaseModel):
    def __init__(self):
        self.model = EfficientNet.from_pretrained('efficientnet-b0')
        self.model.eval()
        self.task_type = "image_classification"

        self.preprocess = transforms.Compose([
            transforms.Resize(224),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

        current_dir = os.path.dirname(os.path.abspath(__file__)) 
        json_path = os.path.join(current_dir, "imagenet_class_index.json")
        with open(json_path, "r") as f:
            self.label_map = json.load(f)

    def get_task_type(self):
        return self.task_type

    def process_image(self, image_path):
        """Classify an image and return the top label and confidence."""
        start_preprocess = time.time()
        image = Image.open(image_path).convert("RGB")
        input_tensor = self.preprocess(image)
        input_batch = input_tensor.unsqueeze(0)
        preprocess_time = time.time() - start_preprocess 

        start_inference = time.time()
        with torch.no_grad():
            output = self.model(input_batch)
        inference_time = time.time() - start_inference

        start_postprocess = time.time()
        probabilities = torch.nn.functional.softmax(output[0], dim=0)
        confidence, class_id = torch.max(probabilities, 0)
        postprocess_time = time.time() - start_postprocess

        class_label = self.label_map[str(class_id.item())][1]

        return (
        [class_label],              # labels (human-readable)
        [confidence.item()],         # confidences
        [""],                          # bboxes (empty for classification)
        [preprocess_time],           # preprocess_times
        [inference_time],            # inference_times
        [postprocess_time],          # postprocess_times
        self.get_task_type()         # task_type
    )

    def quantize_model(self):
        """Quantize the EfficientNet model."""
        print("Quantizing EfficientNet model...")
        self.model = quantize_dynamic(self.model, {torch.nn.Linear}, dtype=torch.qint8)