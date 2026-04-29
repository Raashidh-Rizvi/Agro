# AgriSense Lanka – Phase 3: Project Setup and Environment Configuration

## Objective
The goal of this phase is to establish the technical foundation for the **AgriSense Lanka** application, including the initialization of the backend server, the mobile application, and the database connection logic.

## 1. Project Infrastructure
The following directory structure has been created:
- `/backend`: Node.js/Express server and centralized API logic.
- `/mobile`: React Native (Expo) application for the frontend.
- `/docs`: Project documentation and requirement tracking.

## 2. Backend Configuration (Express & MongoDB)
The backend has been initialized with the following core dependencies:
- **Express**: REST API framework.
- **Mongoose**: MongoDB object modeling.
- **Dotenv**: Environment variable management.
- **CORS**: Cross-Origin Resource Sharing.
- **JWT & BcryptJS**: Authentication and security foundation.

### Key Files Created:
- `backend/src/server.js`: Initial entry point with a health check route and MongoDB connection logic.
- `backend/.env`: Configuration file for environment variables (Port, MongoDB URI, Secrets).

## 3. Mobile Configuration (Expo)
The mobile application has been initialized using the **Expo** framework, providing a high-performance, cross-platform environment for development.

- **Status**: Initialization in progress using `create-expo-app`.
- **Primary Tech**: React Native with functional components.

## 4. Environment Variables
A `.env` file has been prepared with placeholders for the following sensitive data:
- `MONGO_URI`: The connection string for your MongoDB Atlas cluster.
- `JWT_SECRET`: The security key for signing tokens.

---

## Next Steps (Phase 4)
- **Authentication System**: Build the registration and login APIs.
- **User Models**: Implement Mongoose schemas for role-based access.
- **Mobile Auth Context**: Connect the frontend registration and login forms.

> [!IMPORTANT]
> **Action Required**: Please update the `MONGO_URI` in `backend/.env` with your actual MongoDB Atlas cluster connection string to enable full database functionality.
