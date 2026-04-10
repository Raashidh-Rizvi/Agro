# Agro – AI-Powered Smart Farming Mobile Application

---

## 1. Project Title

**Agro – AI-Powered Mobile Application for Smart Farming in Sri Lanka**

---

## 2. Project Overview

Agro is a full‑stack mobile application developed to assist Sri Lankan smallholder farmers by providing intelligent, real‑time agricultural support. The system integrates crop management, disease detection, advisory services, market insights, and expert support into a single mobile platform. It offers a practical, mobile‑first solution that is accessible, easy to use, and scalable.

---

## 3. Problem Statement

Smallholder farmers in Sri Lanka often face difficulties accessing timely, accurate, and localized agricultural information such as crop disease identification, weather‑based farming advice, fertilizer usage, and market pricing. Existing digital solutions are fragmented and do not provide a unified platform, leading to inefficient decision‑making, reduced productivity, and financial losses. An integrated, mobile‑based system is needed to combine multiple agricultural services into a single, user‑friendly application.

---

## 4. Solution

Agro provides an integrated platform with the following capabilities:

- **User authentication and role‑based access**
- **Crop management system**
- **AI‑based crop disease detection (image upload)**
- **Produce listing and marketplace functionality**
- **Market price management system**
- **Expert consultation module**
- **Advisory alert and notification system**

---

## 5. Technology Stack

### Frontend (Mobile Application)

- **React Native (Expo)** – functional components & hooks
- **Axios** – API communication

### Backend

- **Node.js**
- **Express.js** – RESTful API architecture

### Database

- **MongoDB Atlas** – Cloud‑hosted
- **Mongoose ODM**

### Authentication

- **JWT (JSON Web Token)**
- **bcrypt** – password hashing

### Other Tools & Services

- **Multer / Cloudinary** – image upload
- **Postman** – API testing
- **GitHub** – version control
- **Render / Railway** – backend hosting
- **Weather API** – advisory suggestions
- **FastAPI / TensorFlow** – ML inference service

---

## 6. System Architecture

```
Mobile Application (React Native)
    |
    v
Backend API (Node.js + Express)
    |
    v
MongoDB Atlas Database
```

**External Integrations**

- Image upload service (Cloudinary)
- Weather API
- AI disease detection API/model

---

## 7. Core Features

1. **User Authentication (Shared Module)**
   - Registration, login, JWT‑based authentication
   - Role‑based access (Farmer, Expert, Admin)
   - Protected routes
2. **Crop Management**
   - Add, view, update, delete crop records
3. **Diagnosis Management (AI Module)**
   - Upload crop images
   - Detect diseases using AI
   - Store and view diagnosis history
4. **Produce Listing Management**
   - Create, view, update, delete produce listings
5. **Expert Query System**
   - Farmers ask questions, experts respond, track status
6. **Advisory Alert System**
   - Weather alerts, farming recommendations, irrigation & fertilizer guidance
7. **Market Price Management**
   - Add, view, update, delete crop price data

---

## 8. Database Entities (7 CRUD Modules)

| Entity             | Description                          |
| ------------------ | ------------------------------------ |
| **User**           | Shared by all members (auth, roles)  |
| **Crop**           | Crop details and lifecycle           |
| **Diagnosis**      | Image + AI result + timestamp        |
| **ProduceListing** | Marketplace items for sale           |
| **ExpertQuery**    | Farmer questions and expert answers  |
| **AdvisoryAlert**  | Weather & advisory notifications     |
| **MarketPrice**    | Historical and current market prices |

---

## 9. Team Responsibility

| Member                   | Role                       | Module                           |
| ------------------------ | -------------------------- | -------------------------------- |
| **All Members**          | Shared Module              | User Management & Authentication |
| Member 1 (ITXXXX – Name) | Crop Management            |
| Member 2 (ITXXXX – Name) | Diagnosis Management       |
| Member 3 (ITXXXX – Name) | Produce Listing Management |
| Member 4 (ITXXXX – Name) | Expert Query Management    |
| Member 5 (ITXXXX – Name) | Advisory Alert Management  |
| Member 6 (ITXXXX – Name) | Market Price Management    |

---

## 10. API Endpoint Structure

### Authentication

```
POST   /api/auth/register
POST   /api/auth/login
```

### User

```
GET    /api/users
PUT    /api/users/:id
DELETE /api/users/:id
```

### Crop

```
POST   /api/crops
GET    /api/crops
GET    /api/crops/:id
PUT    /api/crops/:id
DELETE /api/crops/:id
```

### Diagnosis

```
POST   /api/diagnosis
GET    /api/diagnosis
DELETE /api/diagnosis/:id
```

### Produce Listing

```
POST   /api/produce
GET    /api/produce
PUT    /api/produce/:id
DELETE /api/produce/:id
```

### Expert Query

```
POST   /api/queries
GET    /api/queries
PUT    /api/queries/:id
DELETE /api/queries/:id
```

### Advisory Alert

```
POST   /api/alerts
GET    /api/alerts
PUT    /api/alerts/:id
DELETE /api/alerts/:id
```

### Market Price

```
POST   /api/market-prices
GET    /api/market-prices
GET    /api/market-prices/:id
PUT    /api/market-prices/:id
DELETE /api/market-prices/:id
```

---

## 11. Project Structure

```
AgriSense-Lanka/
├─ backend/
│   └─ src/ ...
├─ mobile/
│   └─ src/ ...
├─ ml-service/          # Python ML Service
│   ├─ app/
│   ├─ models/
│   └─ README.md
├─ docs/
└─ README.md
```

---

## 12. How to Run the Project

For a detailed, step-by-step guide on how to set up and run the project locally, please refer to the **[RUN_GUIDE.md](RUN_GUIDE.md)**.

### Quick Start:

#### Backend Setup

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```text
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
4. Start the server:
   ```bash
   npm start
   ```

#### ML Service Setup

1. Open a terminal and navigate to the `ml-service` folder:
   ```bash
   cd ml-service
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the FastAPI server:
   ```bash
   python -m app.main
   ```

### Mobile Setup

1. Open a terminal and navigate to the `mobile` folder:
   ```bash
   cd mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the Expo development server:
   ```bash
   npx expo start
   ```
4. Use an emulator or a physical device (via Expo Go) to run the app.

---

## 13. Deployment Details

- **Backend URL**: `https://your-backend-url.com`
- **Database**: MongoDB Atlas (cloud‑hosted)
- **Mobile App**: Configured to communicate with the deployed backend API.

---

## 14. GitHub Repository

[https://github.com/your-repo-link](https://github.com/Raashidh-Rizvi/Agro)

---

## 15. Important Submission Notes

- Only documentation files are included in the ZIP submission.
- Source code resides in the GitHub repository linked above.
- The backend is deployed and publicly accessible.
- The mobile application is connected to the hosted backend API.

---

_End of README_
