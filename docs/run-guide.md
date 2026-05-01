# Agro Run Guide

This guide explains how to run the project locally for review or development.

## Prerequisites

- Node.js 18 or newer
- npm
- Expo Go or an emulator
- MongoDB Atlas connection string

## Backend

1. Open a terminal in `backend/`
2. Install packages:

```powershell
npm install
```

3. Create `backend/.env` with:

```text
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

4. Start the backend:

```powershell
npm run dev
```

The API should be available at `http://localhost:5000`.

## Mobile

1. Open a terminal in `mobile/`
2. Install packages:

```powershell
npm install
```

3. Open `mobile/constants/Config.ts` and set `API_URL` to your backend URL, for example:

```ts
export const API_URL = 'http://192.168.1.10:5000/api';
```

4. Start Expo:

```powershell
npx expo start
```

5. Run the app with Expo Go or an emulator.

## Useful Checks

### Backend tests

```powershell
cd backend
npm test
```

### Mobile type check

```powershell
cd mobile
npx tsc --noEmit
```

### Mobile lint

```powershell
cd mobile
npx eslint "features/alerts/AlertsScreen.tsx" "features/alerts/alertSupport.ts" "app/(tabs)/index.tsx"
```

## Implemented Module to Review First

The clearest end-to-end module in the current branch is:

- `AdvisoryAlert`
- Backend CRUD in `backend/src/controllers/alert.controller.js`
- Routes in `backend/src/routes/alert.routes.js`
- Mobile UI in `mobile/features/alerts/AlertsScreen.tsx`

## Troubleshooting

- If MongoDB fails, verify `MONGO_URI` and Atlas IP access
- If the mobile app cannot reach the backend, use your machine's local IP instead of `localhost`
- If dependencies are missing, rerun `npm install` in the relevant folder
