from abc import ABC, abstractmethod

class BaseModel(ABC):
    @abstractmethod
    def get_task_type(self):
        """Return the task type (e.g., object_detection, image_classification)."""
        pass

    @abstractmethod
    def process_image(self, image_path):
        """Process an image and return results."""
        pass

    def quantize_model(self):
        """Quantize the model if supported."""
        raise NotImplementedError("Quantization not supported for this model.")