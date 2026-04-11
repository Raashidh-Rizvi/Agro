# Agro ML Service - Plant Disease Diagnosis

This service provides a Machine Learning API for automated plant disease diagnosis. It is built using FastAPI and TensorFlow, designed to perform inference on leaf images.

## 📂 Folder Structure

```text
ml-service/
├── app/
│   ├── main.py        # FastAPI application (entry point)
│   ├── predictor.py   # Inference logic & preprocessing
├── models/            # Directory for trained models
│   ├── cnn_efficientnet_2.h5
│   └── cnn_class_names_2.joblib
├── requirements.txt   # Python dependencies
└── README.md          # You are here
```

## 🛠️ Prerequisites

### 1. Model Files

Ensure the following files are placed in the `models/` directory:

- `cnn_efficientnet_2.h5` (The trained Keras model)
- `cnn_class_names_2.joblib` (The list of labels)

### 2. Python Environment

- Python 3.14 or higher.
- A virtual environment is recommended.

## 🚀 Setup & Running

1. **Install Dependencies**:

   ```bash
   cd ml-service
   pip install -r requirements.txt
   ```

2. **Start the Service**:
   ```bash
   python -m app.main
   ```
   The service will start at `http://localhost:8000`.

## 📡 API Endpoints

### Health Check

- **GET** `/health`
- **Description**: Verifies if the service is running and if the model is loaded.

### Predict Disease

- **POST** `/predict`
- **Body**: `multipart/form-data` with a `file` field containing the image.
- **Returns**: JSON with `predicted_class` and `confidence`.

## 🔗 Connection Pipeline

### Step 1: Mobile App -> Node Backend

The mobile app (React Native) sends an image to the Node.js backend at `POST /api/diagnosis/predict`.

### Step 2: Node Backend -> ML Service

The Node.js backend (Express) forwards the image to this ML service. It uses the `ML_SERVICE_URL` defined in its `.env` file.

### Step 3: Result Persistence

The backend receives the prediction from this service, saves it to the **MongoDB Diagnosis collection**, and returns the result to the mobile app.

---

## ⚙️ Preprocessing Details

- **Image Size**: 160x160 pixels.
- **Normalization**: EfficientNetB0 `preprocess_input` standard.
- **Model**: EfficientNetB0 base with custom classification head.
