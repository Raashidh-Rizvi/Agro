import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from tempfile import NamedTemporaryFile
from app.predictor import Predictor
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Agro ML Service")

# Model and class paths (relative to root of ml-service)
MODEL_PATH = os.path.join("models", "cnn_efficientnet_2.h5")
CLASS_PATH = os.path.join("models", "cnn_class_names_2.joblib")

predictor = None

try:
    if os.path.exists(MODEL_PATH) and os.path.exists(CLASS_PATH):
        predictor = Predictor(MODEL_PATH, CLASS_PATH)
    else:
        print(f"Warning: Model files not found at {MODEL_PATH} or {CLASS_PATH}")
except Exception as e:
    print(f"Error loading model: {e}")

@app.get("/health")
def health():
    return {
        "status": "ok", 
        "model_loaded": predictor is not None,
        "model_path": MODEL_PATH,
        "classes_path": CLASS_PATH
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if predictor is None:
        raise HTTPException(
            status_code=503, 
            detail="Model not loaded. Please ensure cnn_efficientnet_2.h5 and cnn_class_names_2.joblib are in the models/ directory."
        )
    
    suffix = "." + file.filename.split(".")[-1] if "." in file.filename else ".jpg"

    with NamedTemporaryFile(delete=False, suffix=suffix) as temp:
        content = await file.read()
        temp.write(content)
        temp_path = temp.name

    try:
        result = predictor.predict(temp_path)
        return result
    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
