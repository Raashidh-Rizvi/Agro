# Project Running Guide - Agro

This guide provides step-by-step instructions on how to set up and run the **Agro** smart farming application locally.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your computer:

- **Node.js** (v18.x or higher)
- **Git** (for managing code)
- **Expo Go** app (download from App Store/Play Store to test on your phone)
- **Docker Desktop** (Required for converting the AI model if using Python 3.14+)

---

## 🚀 Step 1: Backend Setup (Node.js/Express)

1. **Navigate to the backend directory**:

   ```powershell
   cd backend
   ```

2. **Install dependencies**:

   ```powershell
   npm install
   ```

3. **Environment Setup**:
   - Verify there is a `.env` file in the `backend` folder.
   - It should contain your `MONGO_URI`, `JWT_SECRET`, and `ML_SERVICE_URL` (usually `http://localhost:8000`).

4. **Start the server**:
   ```powershell
   npm run dev
   ```
   _The backend will run on `http://localhost:5000`._

---

## 🚀 Step 2: Machine Learning Service (Python/FastAPI)

Due to **Python 3.14** being the latest experimental version, the original AI model (`.h5`) must be converted to **ONNX** format to run real predictions.

1. **Navigate to the ml-service directory**:

   ```powershell
   cd ml-service
   python -m venv venv
   .\venv\Scripts\activate
   ```

2. **Create and Activate a Virtual Environment**:

   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. **Install dependencies**:

   ```powershell
   pip install -r requirements.txt
   ```

4. **Model Conversion (One-time setup for Real AI)**:
   If you see "MOCK MODE" in the logs, it means you need the `.onnx` model file. Run this command while **Docker Desktop** is open:

   ```powershell
   docker run --rm -v "d:/Project/Agro/ml-service/models:/models" python:3.11-slim bash -c "pip install tensorflow==2.15.0 tf2onnx && python -m tf2onnx.convert --keras /models/cnn_efficientnet_2.h5 --output /models/cnn_efficientnet_2.onnx"
   ```

5. **Start the ML Service**:
   ```powershell
   python -m app.main
   ```
   _The service will run on `http://localhost:8000`._

---

## 🚀 Step 3: Mobile Application (React Native/Expo)

1. **Navigate to the mobile directory**:

   ```powershell
   cd mobile
   ```

2. **Install dependencies**:

   ```powershell
   npm install
   ```

3. **Configure your IP Address**:
   - Open `mobile/constants/Config.ts`.
   - Update `API_URL` with your computer's **Local IP Address** so your phone can reach it.
   - _Example:_ `export const API_URL = 'http://192.168.1.10:5000/api';`

4. **Start the Mobile app**:
   ```powershell
   npx expo start
   ```
   _Scan the QR code with your phone's camera (iOS) or the Expo Go app (Android)._

---

## 🛠️ Troubleshooting

- **503 Service Unavailable**: Ensure the `ml-service` is running on port 8000.
- **Network Error (Mobile)**: Double-check that your computer and phone are on the **SAME Wi-Fi network** and your IP address in `Config.ts` is correct.
- **Mock Predictions**: If you see "SIMULATION" in red in results, the `.onnx` model file is missing. Follow Step 2, Point 4 above.

---

_Need help? Please check the logs in your terminal for specific error messages._
