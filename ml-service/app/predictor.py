import tensorflow as tf
import numpy as np
import joblib
import os
from PIL import Image
from tensorflow.keras.applications.efficientnet import preprocess_input

class Predictor:
    def __init__(self, model_path: str, class_path: str):
        self.img_size = (160, 160)
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at {model_path}")
        if not os.path.exists(class_path):
            raise FileNotFoundError(f"Class names file not found at {class_path}")
            
        self.model = tf.keras.models.load_model(model_path)
        self.class_names = joblib.load(class_path)
        print(f"Model loaded from {model_path}")
        print(f"Classes loaded: {self.class_names}")

    def predict(self, image_path: str):
        # 1. Load and preprocess the image
        img = Image.open(image_path).convert("RGB").resize(self.img_size)
        arr = np.array(img)
        
        # 2. Add batch dimension and preprocess
        # Based on notebook: arr = np.expand_dims(preprocess_input(arr), axis=0)
        arr = preprocess_input(arr)
        arr = np.expand_dims(arr, axis=0)

        # 3. Predict class probabilities
        pred_prob = self.model.predict(arr, verbose=0)[0]
        pred_idx = np.argmax(pred_prob)
        
        predicted_class = self.class_names[pred_idx]
        confidence = float(pred_prob[pred_idx])

        return {
            "predicted_class": predicted_class,
            "confidence": round(confidence, 4)
        }
