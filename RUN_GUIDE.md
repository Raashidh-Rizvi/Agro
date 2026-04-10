# Project Running Guide - Agro

This guide provides step-by-step instructions on how to set up and run the **Agro** smart farming application locally.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your computer:

- **Node.js** (v18.x or higher)
- **npm** (comes with Node.js)
- **Expo Go** application (on your mobile device for testing)
- **Git** (optional, for cloning the repository)
- A **MongoDB Atlas** account (or a local MongoDB instance)

---

## 🚀 Getting Started

### 1. Backend Setup

The backend is built with Node.js, Express, and MongoDB.

1.  **Navigate to the backend directory:**

    ````powershell
    cd backend


    - Create a `.env` file in the `backend` folder (if it doesn't exist).
    - Add the following variables (replacing placeholders with your actual credentials):
      ```env
      PORT=5000
      MONGO_URI=your_mongodb_atlas_connection_string
      JWT_SECRET=your_super_secret_jwt_key
      NODE_ENV=development
    ````

2.  **Start the Backend Server:**
    - For development (with auto-reload):
      ```powershell
      npm run dev
      ```
    - For production/normal start:
      ```powershell
      npm start
      ```
    - The server should now be running on `http://localhost:5000`.

---

### 2. Mobile Setup

The mobile application is built using React Native and Expo.

1.  **Navigate to the mobile directory:**

    ```powershell
    cd mobile

        npx expo start


    ```

2.  **Install dependencies:**

    ```powershell
    npm install
    ```

3.  **Backend API Configuration:**
    - Open `mobile/constants/Config.ts`.
    - Update `API_URL` with your **computer's local IP address**. This is necessary for Expo Go to connect to your local backend.
    - Example: `export const API_URL = 'http://203.94.92.133:5000/api';`
    - _Tip: Run `ipconfig` (Windows) or `ifconfig` (macOS/Linux) in your terminal to find your local IP address._

4.  **Start the Expo Development Server:**

    ```powershell
    npx expo start
    ```

5.  **Run on Device/Emulator:**
    - **Physical Device:** Open the Expo Go app and scan the QR code displayed in the terminal.
    - **iOS Device:** Open the Expo Go app on your iPhone and scan the QR code (iOS Simulator requires macOS).
    - **Android Emulator:** Press `a` in the terminal (requires Android Studio).

---

### 3. Machine Learning Service Setup

The ML service handles automated plant disease diagnosis using TensorFlow.

> [!IMPORTANT]
> **Python Version**: TensorFlow currently supports **Python 3.10, 3.11, and 3.12**. Python 3.14 (the latest) is not yet supported.

1.  **Navigate to the ml-service directory:**

    ```powershell
    cd ml-service
    ```

2.  **Create a Virtual Environment (Recommended):**
    Using a supported Python version (e.g., 3.12):

    ```powershell
    py -3.14 -m venv venv
    .\venv\Scripts\activate
    ```

3.  **Install dependencies:**

    ```powershell
    pip install -r requirements.txt
    ```

4.  **Verify Model Files:**
    Ensure `models/cnn_efficientnet_2.h5` and `models/cnn_class_names_2.joblib` are present.

5.  **Start the ML Service:**

    ```powershell
    python -m app.main
    ```

    The service will run on `http://localhost:8000`.

---

## 🛠️ Common Troubleshooting

### 1. Backend Connection Issues

- **Error:** `MongoDB connection error`
- **Solution:** Ensure your `MONGO_URI` is correct and your IP address is whitelisted in MongoDB Atlas.

### 2. Mobile cannot connect to Backend

- **Error:** `Network Error` or `Connection Timeout`
- **Solution:**
  - Ensure both your computer and mobile device are on the **same Wi-Fi network**.
  - Check that the `API_URL` in `Config.ts` uses your computer's **local IP address**, not `localhost`.
  - Disable any firewalls that might be blocking port `5000`.

### 3. Missing Dependencies

- **Error:** `Module not found`
- **Solution:** Run `npm install` in the respective directory (`backend` or `mobile`).

---

## 📁 Project Structure Summary

- `/backend`: Node.js/Express API server.
- `/mobile`: React Native (Expo) mobile application.
- `/docs`: Project documentation and diagrams.
- `README.md`: General project information.

---

_Need help? Contact the development team or check the project documentation in the `/docs` folder._
