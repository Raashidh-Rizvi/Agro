# Agro Progress Tracker

This document reflects the current state of the `Dinithi` branch after cleanup and teammate sync.

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
- Mobile TypeScript, lint, and web export checks pass for the synced branch

## Synced Into This Branch

- User management routes and admin/profile screens
- Crop management routes and screens
- Diagnosis routes, screens, and ML service files
- Produce listing routes and services
- Expert query routes and screens
- Stats route and dashboard/profile integrations

## Still Needs Deeper QA

- Full user CRUD verification
- Crop workflow verification
- Diagnosis CRUD and AI upload verification
- Produce listing CRUD verification
- Expert query CRUD verification
- Market price CRUD implementation

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
- Note that additional teammate modules are now present on this branch, but Advisory Alert remains the most fully verified path
