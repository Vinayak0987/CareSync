# Detailed Task Checklist - CareSync-Techathon (Full Stack)

## Phase 1: Project Setup & Backend Foundation
- [ ] **Initialize Next.js Project**: `npx create-next-app@latest CareSync-Techathon` <!-- id: 0 -->
- [ ] **Install Backend Deps**: `mongoose`, `next-auth` (optional/custom), `dotenv`. <!-- id: 1 -->
- [ ] **Setup DB Connection**: Create `lib/db.js` for MongoDB connection. <!-- id: 2 -->
- [ ] **Define Mongoose Models**:
    - [ ] `User.js` (Patient/Doctor/Admin) <!-- id: 3 -->
    - [ ] `Appointment.js` <!-- id: 4 -->
    - [ ] `Prescription.js` <!-- id: 5 -->
    - [ ] `Product.js` (Inventory) <!-- id: 6 -->

## Phase 2: Core Telemedicine (API + Frontend)
- [ ] **Appointment Module**:
    - [ ] API: `POST /api/appointments/book`, `GET /api/appointments/available` <!-- id: 7 -->
    - [ ] UI: Calendar Page fetching data from API. <!-- id: 8 -->
- [ ] **Consultation & Prescriptions**:
    - [ ] API: `POST /api/prescriptions` <!-- id: 9 -->
    - [ ] UI: Doctor Dashboard & Prescription Form. <!-- id: 10 -->

## Phase 3: Smart Health Dashboard
- [ ] **Vitals & Alerts**:
    - [ ] API: `POST /api/vitals` (Includes Alert Logic trigger) <!-- id: 11 -->
    - [ ] UI: Vitals Log Form & Alert Modal. <!-- id: 12 -->
- [ ] **Reports**:
    - [ ] API: `GET /api/reports/history` <!-- id: 13 -->
    - [ ] UI: Charts (Recharts) visualizing DB data. <!-- id: 14 -->

## Phase 4: Commerce & Inventory
- [ ] **Store & Inventory**:
    - [ ] API: `GET /api/products`, `POST /api/order` (Transactional stock update) <!-- id: 15 -->
    - [ ] UI: Product Grid & Admin Inventory Table. <!-- id: 16 -->

## Phase 5: Engagement & Polish
- [ ] **Community**: API (`POST /api/chat`) and Chat UI. <!-- id: 17 -->
- [ ] **Games**: Client-side implementation (Breath/Memory). <!-- id: 18 -->
- [ ] **UI Polish**: Global CSS, Animations, Mobile Responsiveness. <!-- id: 19 -->
