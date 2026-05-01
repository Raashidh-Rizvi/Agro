# Advisory Alert Management

## Owner

- **Member 5** owns the `AdvisoryAlert` module.

## Entity

- **Entity:** `AdvisoryAlert`
- **Purpose:** publish crop- and district-specific advisory information for farmers

## Fields

- `title`
- `cropType`
- `district`
- `season`
- `message`
- `alertType`
- `createdBy`
- `createdAt`
- `updatedAt`

## CRUD Coverage

- **Create:** experts/admins can publish a new alert
- **Read all:** authenticated users can view all alerts
- **Read one:** authenticated users can view a single alert by ID
- **Update:** experts/admins can update alerts, with ownership/admin checks enforced
- **Delete:** experts/admins can delete alerts, with ownership/admin checks enforced

## API Endpoints

```text
POST   /api/alerts
GET    /api/alerts
GET    /api/alerts/:id
PUT    /api/alerts/:id
DELETE /api/alerts/:id
```

## Authorization Rules

- All alert routes require authentication.
- `POST /api/alerts` is restricted to `Expert` and `Admin`.
- `PUT /api/alerts/:id` is restricted to `Expert` and `Admin`.
- `DELETE /api/alerts/:id` is restricted to `Expert` and `Admin`.
- Admins can modify any alert.
- Experts can modify only the alerts they created.

## Query Support

`GET /api/alerts` supports:

- `alertType`
- `cropType`
- `district`
- `season`
- `search`
- `limit`

## Mobile Integration

- The mobile CRUD screen is implemented in `mobile/features/alerts/AlertsScreen.tsx`.
- The home dashboard also surfaces recent live alerts from the same backend module.
- Experts/admins can create alerts from the app.
- Owners/admins can edit and delete alerts from the app.
- Farmers can read alerts but do not see create/edit/delete actions.

## Demo Flow

1. Log in as an `Expert` or `Admin`
2. Open the **Alerts** tab
3. Create an alert with crop, district, season, and message
4. Confirm it appears in the alert list
5. Edit the same alert
6. Delete the same alert
7. Log in as a `Farmer` and confirm alerts are readable but not manageable
