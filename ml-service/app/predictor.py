import onnxruntime as ort
import numpy as np
import joblib
import os
from PIL import Image

class Predictor:
    def __init__(self, model_path: str, class_path: str):
        self.img_size = (160, 160)
        self.session = None
        self.class_names = []
        
        # Replace .h5 with .onnx string if present
        onnx_path = model_path.replace(".h5", ".onnx")
        
        try:
            if not os.path.exists(onnx_path):
                print(f"Warning: ONNX Model file not found at {onnx_path}. Entering MOCK MODE.")
                if os.path.exists(class_path):
                    self.class_names = joblib.load(class_path)
                else:
                    self.class_names = ["Healthy", "Paddy Blast", "Brown Spot", "Leaf Smut"]
                return

            if not os.path.exists(class_path):
                raise FileNotFoundError(f"Class names file not found at {class_path}")
                
            self.session = ort.InferenceSession(onnx_path)
            self.class_names = joblib.load(class_path)
            
            # Dynamically discover inputs
            self.inputs = self.session.get_inputs()
            self.input_names = [i.name for i in self.inputs]
            # Assume the first large input is the image
            self.main_input_name = self.input_names[0]
            
            print(f"ONNX Model loaded from {onnx_path}")
            print(f"Detected Inputs: {self.input_names}")
        except Exception as e:
            print(f"Error loading model: {e}. Entering MOCK MODE.")
            self.class_names = ["Healthy", "Paddy Blast", "Brown Spot", "Leaf Smut"]

    def _preprocess(self, img):
        """Standard EfficientNetB0 preprocessing (160x160)."""
        img = img.resize(self.img_size)
        x = np.array(img).astype(np.float32)
        # We do NOT normalize to [0,1] here because Keras EfficientNet models 
        # converted to ONNX usually expect the [0, 255] range if the 
        # Normalization layer is part of the graph (which it is here).
        return x

    def predict(self, image_path: str):
        if self.session is None:
            # MOCK MODE: Return a random result
            import random
            predicted_class = random.choice(self.class_names)
            confidence = round(random.uniform(0.85, 0.99), 4)
            print(f"MOCK PREDICTION: {predicted_class} ({confidence})")
            return {
                "predicted_class": predicted_class,
                "confidence": confidence,
                "is_mock": True
            }

        try:
            # 1. Load and preprocess the image
            img = Image.open(image_path).convert("RGB")
            arr = self._preprocess(img)
            
            # 2. Add batch dimension [1, 160, 160, 3]
            arr = np.expand_dims(arr, axis=0)

            # 3. Build input dictionary dynamically to satisfy extra model inputs
            input_feed = {}
            for inp in self.inputs:
                if inp.name == self.main_input_name:
                    input_feed[inp.name] = arr
                elif "normalization" in inp.name or "Sub" in inp.name:
                    # Satisfy Mean requirement (Default 0)
                    input_feed[inp.name] = np.zeros(inp.shape, dtype=np.float32)
                elif "Sqrt" in inp.name or "Div" in inp.name:
                    # Satisfy Variance/Std requirement (Default 1)
                    input_feed[inp.name] = np.ones(inp.shape, dtype=np.float32)
                else:
                    # Generic fallback for other missing inputs
                    input_feed[inp.name] = np.zeros(inp.shape, dtype=np.float32)

            # 4. Predict class probabilities
            pred_prob = self.session.run(None, input_feed)[0][0]
            pred_idx = np.argmax(pred_prob)
            
            predicted_class = self.class_names[pred_idx]
            confidence = float(pred_prob[pred_idx])

            return {
                "predicted_class": predicted_class,
                "confidence": round(confidence, 4),
                "is_mock": False
            }
        except Exception as e:
            print(f"Prediction error: {e}")
            return {
                "predicted_class": "Error during prediction",
                "confidence": 0.0,
                "is_mock": True
            }
