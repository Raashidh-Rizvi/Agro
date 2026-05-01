# Agro Progress Tracker

This document reflects the current state of the branch in a simple, evaluator-friendly way.

## Completed

### Shared Authentication

- User model created
- Registration API created
- Login API created
- Password hashing implemented
- JWT generation implemented
- Protected route middleware implemented
- Mobile login and registration flow connected

### Advisory Alert Management

- `AdvisoryAlert` model created
- Advisory alert CRUD backend created
- Role-based create/update/delete restrictions added
- Ownership/admin checks added
- Mobile alert management screen connected to backend
- Dashboard recent alerts now read live alert data
- Backend tests added for the alert module

## Partially Implemented

### User Management

- Current logged-in user profile is available
- Full user CRUD is not complete yet

## Planned / Not Yet Complete

- Crop management CRUD
- Diagnosis CRUD and AI upload flow
- Produce listing CRUD
- Expert query CRUD
- Market price CRUD

## Current Strongest Demo Path

For a clean branch demo, the strongest flow is:

1. Register or log in
2. Open the Alerts tab
3. View live advisory alerts
4. Create an alert as `Expert` or `Admin`
5. Edit the same alert
6. Delete the same alert

## Recommended Evaluator Focus

If an evaluator wants the clearest implemented module, direct them to:

- `README.md`
- `docs/advisory-alert-management.md`
- `backend/src/controllers/alert.controller.js`
- `mobile/features/alerts/AlertsScreen.tsx`
