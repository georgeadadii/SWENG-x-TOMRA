from .yolo_model import YOLOv11
from .efficientnet_model import EfficientNetClassifier

class ModelFactory:
    @staticmethod
    def create_model(model_name, quantize=False):
        """
        Factory method to create and return the selected model.
        Args:
            model_name (str): Name of the model to create (e.g., "yolo", "efficientnet").
            quantize (bool): Whether to quantize the model.
        Returns:
            BaseModel: An instance of the selected model.
        """
        if model_name == "yolo":
            model = YOLOv11("yolo11n.pt")
        elif model_name == "efficientnet":
            model = EfficientNetClassifier()
        else:
            raise ValueError(f"Unsupported model: {model_name}")

        # Quantize the model if requested and supported
        if quantize and hasattr(model, "quantize_model"):
            model.quantize_model()

        return model