# Agro

Agro is a full-stack mobile application for smart farming in Sri Lanka. The repository name is **Agro**, while parts of the mobile UI still use the product label **AgriSense Lanka**. This README reflects the current state of the `Dinithi` branch after cleanup.

## Overview

The app is intended to bring several farming workflows into one mobile-first platform:

- authentication and role-based access
- crop tracking
- advisory alert publishing
- diagnosis support
- produce listing and market visibility
- expert support

## Current Branch Status

### Implemented and demo-ready

- Shared authentication foundation
  - user registration
  - login
  - password hashing
  - JWT generation
  - protected routes
  - current-user profile endpoint
- Advisory Alert Management (**Member 5 - Dinithi**)
  - backend CRUD
  - filter support
  - role-based create/update/delete restrictions
  - ownership and admin checks
  - mobile alert management screen
  - dashboard recent-alert feed
  - focused backend tests

### Present but not yet complete

- full user CRUD
- crop management CRUD
- diagnosis CRUD and AI flow
- produce listing CRUD
- expert query CRUD
- market price CRUD

For the clearest evaluation path, review the advisory alert module first.

## Technology Stack

### Mobile

- React Native
- Expo
- Expo Router
- Axios

### Backend

- Node.js
- Express
- MongoDB Atlas
- Mongoose

### Authentication and utilities

- JWT
- bcryptjs
- Multer

## Implemented API Surface

### Health and base routes

```text
GET /           - backend status message
GET /api/health - health check
```

### Authentication routes

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Advisory alert routes

```text
GET    /api/alerts
GET    /api/alerts/:id
POST   /api/alerts
PUT    /api/alerts/:id
DELETE /api/alerts/:id
```

Alert rules:

- all alert routes require JWT authentication
- `POST`, `PUT`, and `DELETE` are restricted to `Expert` and `Admin`
- `Admin` can manage any alert
- `Expert` can manage only alerts they created

Alert filters:

- `alertType`
- `cropType`
- `district`
- `season`
- `search`
- `limit`

## Project Structure

```text
backend/
  src/
    controllers/
    middleware/
    models/
    routes/
  test/
docs/
  advisory-alert-management.md
  phase-3-setup.md
  progress.md
  run-guide.md
mobile/
  app/
  assets/
  components/
  constants/
  context/
  features/
  hooks/
  utils/
README.md
```

## Team Modules

| Member | Module |
| --- | --- |
| All members | Shared authentication foundation |
| Member 1 | Crop Management |
| Member 2 | Diagnosis Management |
| Member 3 | Produce Listing Management |
| Member 4 | Expert Query Management |
| Member 5 (IT24104198 - Dinithi) | Advisory Alert Management |
| Member 6 | Market Price Management |

## Run Locally

Detailed setup instructions are in `docs/run-guide.md`.

### Backend

```bash
cd backend
npm install
npm run dev
```

Required environment variables:

```text
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### Mobile

```bash
cd mobile
npm install
npx expo start
```

Before starting the mobile app, set `API_URL` in `mobile/constants/Config.ts` to the correct backend address for your machine or deployed backend.

## Recommended Demo Flow

1. Register or log in
2. Open the Alerts tab
3. View live advisory alerts
4. Log in as an `Expert` or `Admin`
5. Create, edit, and delete an alert
6. Confirm recent alerts also appear on the dashboard

## Evaluator Notes

- `docs/advisory-alert-management.md` gives the cleanest module-level breakdown
- `docs/progress.md` summarizes what is complete vs still pending
- `backend/test/alert.module.test.js` contains focused verification for the strongest implemented module

## Repository

[GitHub Repository](https://github.com/Raashidh-Rizvi/Agro)
