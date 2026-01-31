# Product Requirements Document (PRD)

## 1. Document Header
| Key | Value |
| :--- | :--- |
| **Product Name** | CareSync-Techathon |
| **Version** | 2.2 (Integrated/Full-Detail) |
| **Author(s)** | Antigravity (AI Agent) |
| **Date** | 2026-01-31 |
| **Stakeholders** | Hackathon Judges, Users (Patients/Doctors) |
| **Status** | **Approved** |

## 2. Executive Summary
CareSync-Techathon is a digital health ecosystem designed to democratize healthcare access. By bridging the gap between remote patients and urban specialists through a Next.js-powered web platform, it offers end-to-end care: from "Smart" preventive alerts and video consultations to digital prescription delivery and automated e-commerce fulfillment.

## 3. Problem Statement
*   **Context**: Rural populations often travel ~50km+ for basic specialist care.
*   **Pain Points**: High travel costs, long waiting times, lack of medical history tracking, and poor medication adherence.
*   **Gap**: Existing solutions are often fragmented (just chat or just pharmacy). CareSync unifies them.

## 4. Goals & Objectives
*   **Primary Goal**: functioning MVP of a "Doctor-to-Doorstep" loop.
*   **Key Success Metric**: A user can simulate a full flow (Alert -> Consult -> Prescribe -> Buy -> Delivery) in < 5 minutes.

## 5. Non-Goals
*   Real payments (Simulated only).
*   Live WebRTC P2P streaming (Simulated UI).
*   Legal/HIPAA Compliance (Not a priority for Hackathon).

## 6. User Personas
*   **Ravi (Patient)**: 50, Farmer. Diabetic. Needs regular insulin/sugar checks. Uses a cheap Android phone.
*   **Dr. Tara (Doctor)**: 34, Endocrinologist. Wants efficient tools to handle remote cases quickly.
*   **Admin**: Manages the platform's drug inventory.

## 7. User Stories (High Level)
*   "As Ravi, I want my phone to warn me if my sugar is too high so I don't faint."
*   "As Ravi, I want to show the pharmacist a clean digital slip, not my doctor's bad handwriting."
*   "As Admin, I want the inventory to auto-update when Ravi buys insulin."

## 8. Functional Requirements (Detailed Feature Specs)

### Module A: Core Telemedicine

#### F1: Appointment Scheduling
*   **Description**: Interactive calendar system.
*   **Functionality**:
    *   Fetch available slots from `appointments` collection.
    *   Prevent double-booking (Server-side check).
*   **UI Flow**: Home -> "Book Now" -> Select Specialty -> Pick Date/Time -> "Confirmed".

#### F2: Chat & Video Call (Simulation)
*   **Description**: A professional consultation interface.
*   **Functionality**:
    *   **Video**: Split-screen grid. "Doctor" video is a visual placeholder. "Patient" video uses browser webcam API.
    *   **Chat**: Persistent chat history stored in MongoDB (`ChatSession`). User can send text/images.
    *   **Controls**: Mute, Camera Off, End Call (redirects to Rx).

#### F3: Digital Prescription
*   **Description**: Generation of a branded, legible PDF-style card.
*   **Functionality**:
    *   **Doctor Input**: standardized form (Drug Name, Dosage, Frequency, Duration).
    *   **Output**: Saves to `Prescriptions` collection.
    *   **Patient View**: Renders as a styled "Card" with a "Buy Medicines" CTA.

### Module B: Smart Health & Prevention

#### F4: Chronic Disease Alerts + Direct Scheduling
*   **Description**: Proactive life-saving logic.
*   **Functionality**:
    *   Patient logs vitals (BP, SpO2, Sugar).
    *   **Server Logic**: IF `BP_Systolic > 160`:
        *   Return `status: CRITICAL`.
        *   Trigger **Red Alert Modal** on UI.
        *   Enable **"Emergency Connect"** button (bypasses calendar, hits `API/emergency-book`).

#### F5: History Summarization
*   **Description**: At-a-glance medical history.
*   **Functionality**:
    *   Aggregation Query: Count total visits, active prescriptions, and last 3 vital readings.
    *   Display: "Patient Summary Card" on Doctor's Dashboard.

#### F6: Daily Reports & Reminders
*   **Description**: Adherence tools.
*   **Functionality**:
    *   **Reports**: Visual Line Charts (Recharts) fetching `VitalsLog`.
    *   **Reminders**: Daily checklist. Checking an item (`POST /api/reminders/check`) updates streak.

### Module C: Engagement & Community

#### F7: Anonymous Community Chat
*   **Description**: Safe space for peer support.
*   **Functionality**:
    *   Users post messages to global topics (Heart Health, Anxiety).
    *   **Privacy**: System replaces real name with `User_HASH` or random handle (e.g., "PeacefulLion").

#### F8: Wellness Games
*   **Description**: Stress management tools.
*   **Functionality**:
    *   **Breath Pacer**: CSS Animation (4s expand / 4s contract).
    *   **Memory Match**: interactive JS game.

### Module D: Commerce

#### F9: Online Medical Store
*   **Description**: Integrated Pharmacy.
*   **Functionality**:
    *   Catalog fetched from `Products`.
    *   **Cart Logic**: Add items -> Calculate Total.
    *   **Smart Link**: "Add Prescribed Items" button on Prescription Card automates cart population.

#### F10: Medical Inventory System
*   **Description**: Supply chain management.
*   **Functionality**:
    *   Admin Dashboard displaying Stock Levels.
    *   **Atomic Sync**: On `Checkout`:
        *   `db.products.updateOne({_id: itemId}, {$inc: {stock: -qty}})`

## 9. Non-Functional Requirements
*   **Reliability**: Data must persist to MongoDB (no data loss on refresh).
*   **Performance**: Core Vitals Dashboard should load in < 1s (Critical info).
*   **Usability**: Accessibility controls (Large Text toggle) for elderly patients.

## 10. User Flow / Workflow
1.  **Patient Logs In**.
2.  **Home**: Dash shows "Morning Pill: Pending". Patient checks it off.
3.  **Vitals**: Patient feels dizzy -> Types BP: 170/110.
4.  **System**: **ALERT! High BP!** -> Shows "Emergency Call".
5.  **Consult**: Patient joins simulated call. Doctor discusses.
6.  **Rx**: Doctor issues Rx for "Amlodipine".
7.  **Store**: Patient sees Rx -> Clicks "Buy".
8.  **Complete**: Order Placed -> Inventory Updated.

## 11. UI/UX Requirements
*   **Framework**: React/Next.js UI.
*   **Theme**: "Health Teal" (#0EA5E9) & "Clean White".
*   **Elements**: Rounded cards, shadow-sm for depth, Glassmorphism for Alerts.

## 12. Data Requirements
*   **Schema 1: User**: `name, email, role, vitals_history[]`
*   **Schema 2: Appointment**: `doctor_id, patient_id, date, status`
*   **Schema 3: Product**: `name, category, price, stock, image_url`
*   **Schema 4: Order**: `user_id, items[{id, qty}], status`

## 13. Technical Considerations
*   **Stack**: Next.js 14, MongoDB Atlas, Tailwind/CSS Modules.
*   **Validation**: Zod for form validation.
*   **Icons**: Lucide-React.

## 14. Assumptions & Dependencies
*   User has internet.
*   MongoDB Cluster is accessible.

## 15. Success Metrics
*   Successful complete flow execution.
*   Inventory count accuracy test (Order 5 items -> Stock drops by 5).

## 16. Risks & Mitigation
*   **Complexity**: Next.js App Router learning curve.
    *   *Mitigation*: Structure folders clearly (`/app/dashboard`, `/app/api`).
*   **Time**: 10 Features is a lot.
    *   *Mitigation*: Focus on "Happy Path" (Feature 3, 5, 10 are P0).

## 17. Timeline & Milestones
*   **Ph 1**: Setup & Auth.
*   **Ph 2**: Telemedicine Flow.
*   **Ph 3**: Dashboard & Alerts.
*   **Ph 4**: Store & Admin.
*   **Ph 5**: Polish.

## 18. Open Questions
*   None. Plan is locked.
