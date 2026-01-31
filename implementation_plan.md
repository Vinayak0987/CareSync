# Implementation Plan - CareSync-Techathon (Full Stack)

## Goal Description
Build **CareSync-Techathon** using **Next.js** and **MongoDB**. This moves the project from a client-side prototype to a functional full-stack application with real data persistence.

## User Review Required
> [!IMPORTANT]
> **Database Setup**: You will need a MongoDB connection string (e.g., from MongoDB Atlas or a local instance). I will set up the app to read this from an `.env` file.
> **Deployment**: Next.js requires a Node.js environment to run the server-side API routes.

## Proposed Features (Full Stack)

### 1. Telemedicine (API + UI)
- **Appointments**: `GET/POST /api/appointments`. MongoDB stores real slots.
- **Consultation**: Simulation UI backed by message history in DB.
- **Prescriptions**: Stored permanently in MongoDB.

### 2. Smart Health
- **Alerts**: Server-side logic checks vitals sent via API.
- **History**: Aggregation queries (`$sum`, `$count`) to summarize patient history.
- **Daily Reports**: Persistent storage of health trends.

### 3. Community & Wellness
- **Chat**: Messages saved to DB, allowing async communication.
- **Games**: Scores saved to User Profile.

### 4. Marketplace & Admin
- **Store**: Products fetched from MongoDB `products` collection.
- **Inventory**: Real-time stock updates. Orders decrement stock (`$inc: { stock: -1 }`).

## Proposed Changes

### Tech Stack
- **Frontend**: Next.js 14+ (App Router).
- **Backend**: Next.js API Routes.
- **Database**: MongoDB + Mongoose.
- **Styling**: CSS Modules (Vanilla CSS).

### Directory Structure (`src/`)
```
src/
├── app/
│   ├── api/              # Backend Routes
│   │   ├── auth/
│   │   ├── appointments/
│   │   └── products/
│   ├── (dashboard)/      # Protected Routes
│   │   ├── patient/
│   │   └── doctor/
│   └── page.js           # Landing
├── models/               # Mongoose Schemas (User, Appt, Product)
├── lib/                  # DB Connection helper
├── components/           # React Components
└── styles/               # CSS Modules
```

## Verification Plan
1.  **DB Connection**: Verify app connects to MongoDB.
2.  **API Test**: Use tool/curl to check `POST /api/appointments`.
3.  **End-to-End**: Create User -> Book Appt -> Check DB for record.
