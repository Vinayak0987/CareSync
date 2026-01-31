# UI/UX Architecture & Screen Specifications

## Overview
This document maps out the specific interface elements, inputs, and outputs for each User Role in **CareSync-Techathon**. It serves as the blueprint for frontend development.

---

## 1. Role: PATIENT

### A. Main Dashboard (Home)
*   **Purpose**: Daily snapshot of health and tasks.
*   **Outputs (Display)**:
    *   **Welcome Banner**: "Good Morning, Ravi".
    *   **Vitals Summary Card**: Last recorded BP, Sugar, Heart Rate (with trend arrow).
    *   **Next Appointment**: "Dr. Priya at 10:30 AM" (or "No upcoming appointments").
*   **Inputs (Actions)**:
    *   **Medicine Checklist**: Checkboxes for "Morning Dose", "Afternoon Dose".
    *   **Quick Vitals Log**: Inputs for `Systolic`, `Diastolic`, `Sugar`. [Submit] button.
*   **Smart Logic**: Submitting high vitals here triggers the **Red Alert Modal** with [Emergency Connect] button.

### B. Tab: Appointments
*   **Purpose**: Booking consultations.
*   **Outputs**:
    *   **Doctor List**: Cards showing Name, Specialty, Experience.
    *   **Calendar Grid**: Dates with color-coded availability (Green=Free, Gray=Full).
*   **Inputs**:
    *   **Select Specialty**: Dropdown (Cardio, General, Ortho).
    *   **Date/Time Picker**: Clickable slots (e.g., "10:00 AM").
    *   **Reason for Visit**: Text area.
*   **Actions**: [Book Appointment], [Cancel].

### C. Tab: My Records (History)
*   **Purpose**: Reviewing medical history and prescriptions.
*   **Outputs**:
    *   **Timeline View**: List of past consults sorted by date.
    *   **Summary Box**: "You have treated 2 infections this year."
    *   **Prescription Cards**: Digital Rx showing Doctor Name, Date, Medicines List.
*   **Actions**: [Download PDF], [Buy Medicines] (Links to Store).

### D. Tab: Consultation Room (Active Call)
*   **Purpose**: Live interaction with Doctor.
*   **Outputs**:
    *   **Video Grid**: Doctor's feed (Main), Self-view (Corner/PiP).
    *   **Chat Stream**: Text messages bubble list.
*   **Inputs**:
    *   **Chat Box**: Text input + [Send].
    *   **Controls**: [Mute Mic], [Video Off], [End Call].

### E. Tab: Medical Store
*   **Purpose**: Buying medicines.
*   **Outputs**:
    *   **Product Grid**: Image, Name, Price, "In Stock" tag.
    *   **Cart Drawer**: List of added items, Total Price.
*   **Inputs**:
    *   **Search Bar**: "Paracetamol...".
    *   **Quantity Selector**: `[+]` `[-]`.
*   **Actions**: [Add to Cart], [Checkout], [Upload Prescription].

### F. Tab: Wellness (Community & Games)
*   **Purpose**: Engagement and mental health.
*   **Outputs**:
    *   **Community Feed**: Anonymous posts from "User_123".
    *   **Game Canvas**: "Breath Pacer" animation.
*   **Inputs**:
    *   **Post Message**: Text input (Anonymous).
    *   **Game Controls**: [Start], [Restart].

---

## 2. Role: DOCTOR

### A. Doctor Dashboard
*   **Purpose**: Managing the daily queue.
*   **Outputs**:
    *   **Today's Schedule**: List of appointments (Patient Name, Time, Reason).
    *   **Stats**: "Patients Seen: 5", "Pending: 3".
*   **Actions**: [Start Call] (Active 5 mins before slot).

### B. Consultation & Prescription Pad (Split Screen)
*   **Purpose**: Treating the patient.
*   **Left Panel (Video/Chat)**: Same as Patient View.
*   **Right Panel (Patient Data & Rx)**:
    *   **Outputs**: Patient's Vitals History (Chart), Past Prescriptions.
    *   **Inputs (Prescription Form)**:
        *   **Diagnosis**: Text input.
        *   **Medicine Rows**: Inputs for `Drug Name`, `Dosage` (500mg), `Freq` (1-0-1), `Duration` (5 days).
        *   **Advice/Notes**: Text area.
*   **Actions**: [Add Record], [Issue Prescription] (Saves to DB & notifies Patient).

---

## 3. Role: ADMIN / PHARMACIST

### A. Inventory Dashboard
*   **Purpose**: Supply chain management.
*   **Outputs**:
    *   **Stock Alerts**: "Low Stock: Insulin (< 10 units)".
    *   **Order Stream**: Live list of recent patient orders.
*   **Inputs**: None (Read-only overview).

### B. Tab: Products Manager
*   **Purpose**: Updating stock details.
*   **Outputs**:
    *   **Inventory Table**: Columns for ID, Name, Category, Price, Stock Count, Status.
*   **Inputs**:
    *   **Edit Stock**: Number input field inside the table row.
    *   **Add Product Form**: Name, Price, Image URL.
*   **Actions**: [Update Stock], [Delete Product].

---

## 4. Shared UI Elements (Global)
*   **Navigation Bar**:
    *   **Logo**: "CareSync".
    *   **Tabs**: Icons for Home, Appts, Store, etc.
    *   **Profile**: Avatar + [Logout].
*   **Alert Modal (Global Overlay)**:
    *   **Red Border**.
    *   **Text**: "CRITICAL HEALTH ALERT".
    *   **Button**: [Connect Doctor Now].
