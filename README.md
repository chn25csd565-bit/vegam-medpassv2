# VEGAM

## വികസിത ഇ-ഗോവ് ആരോഗ്യ മേധ

**VEGAM** is a bilingual, AI voice-first government-hospital appointment and patient assistance platform designed to make healthcare access simpler, faster, and more accessible.

The core idea is simple:

> **Speak → Verify → Book → Get Pass → Check In**

Instead of making patients stand in registration queues, remember long hospital identifiers, or navigate complicated hospital processes, VEGAM brings appointment booking and essential patient services into one accessible digital experience.

---

## 🏆 Hackathon Overview

VEGAM is built as a **frontend demo with strong backend functionality** for a hackathon presentation. The platform demonstrates how AI-powered voice interaction can simplify government-hospital appointment booking while a patient portal provides useful services before, during, and after a hospital visit.

### Primary Focus

**Bilingual AI voice appointment booking**

The voice-first experience is designed for:

- Elderly patients
- People with low digital literacy
- Users who find complex apps difficult to navigate
- Visually impaired users
- Patients who prefer speaking instead of typing
- Users who need a simple English/Malayalam experience

---

## 💡 The Problem

Government-hospital visits can involve multiple steps:

- Long registration queues
- Difficulty remembering or entering hospital identifiers
- Confusing department and doctor selection
- Difficulty finding the correct room or floor
- Separate processes for appointment booking and hospital check-in
- Digital services that may be difficult for elderly or low-literacy users

VEGAM addresses these problems through a conversational, patient-friendly experience.

---

## 🚀 Our Solution

VEGAM combines an AI voice appointment experience with a patient portal.

### Voice-first appointment journey

```text
PHONE / VOICE INTERACTION
        ↓
MOBILE VERIFICATION
        ↓
PATIENT IDENTIFICATION
        ↓
CHOOSE PATIENT
        ↓
CHOOSE DEPARTMENT
        ↓
CHOOSE DOCTOR
        ↓
CHOOSE AVAILABLE SLOT
        ↓
CONFIRM APPOINTMENT
        ↓
DIGITAL OP TICKET + QR CODE
        ↓
HOSPITAL CHECK-IN
        ↓
DOCTOR ROOM NAVIGATION
```

The system is designed to keep technical information in the background so that patients can focus on what they actually need to do.

---

## ✨ Key Features

### 🗣️ 1. Bilingual AI Voice Appointment Booking

The primary feature of VEGAM is an AI voice-based appointment experience that can be structured for **English and Malayalam**.

A patient can communicate naturally instead of navigating a complicated booking form.

The voice flow can guide the patient through:

- Mobile verification
- OTP verification
- Patient identification
- Self/dependent selection
- Department selection
- Doctor selection
- Available date and time selection
- Final booking confirmation

The voice layer is designed to work with an AI voice provider, but the current project should be treated as **provider-agnostic** unless a specific production provider is configured.

---

### 🔐 2. Secure Verification Flow

The system separates the concepts of identity and authentication:

- **Phone number** → identifies the patient account
- **OTP** → verifies access to the registered number
- **UHID** → hospital record identifier
- **QR token** → appointment/pass identifier

The prototype uses demo/mock data and should not be treated as a production identity-verification system.

---

### 👨‍👩‍👧 3. Dependent / Child Booking

VEGAM can support guardian-based booking for dependents.

A verified guardian can select a linked child/dependent without manually entering the child's long hospital identifier.

Example:

```text
Guardian
   ↓
Linked Dependents
   ├── Child 1
   └── Child 2
```

---

### 🎫 4. Printable Digital OP Ticket

After an appointment is booked, VEGAM generates a digital OP ticket containing appointment information and a QR code.

The pass can display:

- Patient name
- Department
- Doctor
- Date
- Time
- Room
- Floor
- Appointment reference
- QR code

The QR code is intended to contain a **random appointment/pass token**, not sensitive medical information.

The ticket can be displayed digitally or printed for use at the hospital.

---

### 📷 5. QR-based Hospital Check-in

Hospital staff can use the appointment QR code to verify the booking and check the patient in.

Example flow:

```text
SCAN / ENTER APPOINTMENT CODE
             ↓
      APPOINTMENT VERIFIED
             ↓
         PATIENT DETAILS
             ↓
         CHECK IN PATIENT
```

The prototype demonstrates how this can reduce manual verification at the hospital entry/check-in point.

---

### 📅 6. Recent / Previous Appointments

The patient portal allows users to view appointment information and recent bookings.

This gives patients a quick way to review upcoming and previous hospital visits without repeating the booking process.

---

### 🧭 7. Doctor Room Navigation

After booking, VEGAM can show the patient where to go inside the hospital.

Example:

```text
MAIN BLOCK
    ↓
RECEPTION
    ↓
LIFT / STAIRS
    ↓
2ND FLOOR
    ↓
ROOM 204
```

The goal is to reduce confusion in large hospital buildings, especially for first-time visitors and elderly patients.

---

### 🚨 8. SOS / Emergency Assistance

The patient portal includes a simple emergency assistance feature.

Patients can:

- Call a configured emergency number
- Call an ambulance/emergency contact
- Share their live/current location

The prototype does not automatically place emergency calls without user action. Emergency actions are initiated through the device after the required user interaction.

---

### 🔗 9. Kerala Government e-Health Redirection

For patients who need the official Kerala Government e-Health booking service, VEGAM can provide a direct redirection to the **official external system**.

VEGAM does **not** create or imitate the government booking system.

> This project does not claim an official Kerala e-Health API integration.

---

### 🌐 10. Bilingual and Accessible Design

The platform is designed around accessibility and simple interaction.

Key principles:

- English + Malayalam language support structure
- Large readable text
- Clear buttons and labels
- High-contrast interface
- Simple wording
- Voice-first interaction
- Minimal technical terminology

---

## 🖥️ Website Pages / Screens

The demo includes the major screens required to communicate the full product journey.

### Patient-facing

- Landing / Home
- Login / Verification
- OTP Verification
- Patient Dashboard
- Patient Profile
- Appointment Booking
- Department Selection
- Doctor Selection
- Slot Selection
- Booking Confirmation
- Digital OP Ticket
- Recent Appointments
- Navigation / Directions
- SOS / Emergency Assistance
- Language Selection
- Demo Mode

### Hospital / operational

- Hospital Staff Dashboard
- QR / Appointment Check-in
- Appointment Details
- Room / Floor information

### Demonstration / technical

- Live Demo Flow
- How It Works
- Architecture
- Security by Design
- Admin / configuration views where applicable

---

## 🎬 Hackathon Demo Flow

The recommended live demonstration is:

```text
1. Open VEGAM
      ↓
2. Start Voice Appointment Demo
      ↓
3. Verify mobile number using OTP
      ↓
4. Identify patient
      ↓
5. Select self / dependent
      ↓
6. Select department
      ↓
7. Select doctor
      ↓
8. Select date and time
      ↓
9. Confirm appointment
      ↓
10. Generate printable OP ticket
      ↓
11. Display QR code
      ↓
12. Simulate hospital QR check-in
      ↓
13. Show floor / room navigation
      ↓
14. Demonstrate SOS/location sharing
```

### Demo Mode

A demo mode can use predefined synthetic patient and appointment data so the presentation does not depend on real SMS, telephony, government systems, or real patient information.

**All demonstration data should be treated as synthetic/demo data.**

---

## 🧱 System Architecture

```text
                    ┌─────────────────────┐
                    │      Patient        │
                    └──────────┬──────────┘
                               │
                         Voice / Web UI
                               │
             ┌─────────────────┴─────────────────┐
             │                                   │
             ▼                                   ▼
     ┌───────────────┐                   ┌───────────────┐
     │ AI Voice Flow │                   │ React + Vite  │
     └───────┬───────┘                   └───────┬───────┘
             │                                   │
             └─────────────────┬─────────────────┘
                               ▼
                      ┌─────────────────┐
                      │  Python Backend │
                      │     FastAPI     │
                      └────────┬────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        ┌──────────┐     ┌───────────┐    ┌────────────┐
        │ Patients │     │Appointments│    │ Emergency  │
        └──────────┘     └───────────┘    └────────────┘
              │                │                │
              └────────────────┼────────────────┘
                               ▼
                         ┌───────────┐
                         │  SQLite   │
                         └───────────┘
```

---

## 🛠️ Technology Stack

### Frontend

- **React.js** — component-based UI
- **Vite** — frontend development/build tooling
- **JavaScript**
- **HTML + CSS**
- **Node.js / npm** — dependency and project management

### Backend

- **Python**
- **FastAPI** — API/backend framework
- `main.py` — application logic
- `database.py` — database operations
- `schemas.py` — data/schema definitions

### Database

- **SQLite** via `sqlite3`
- JSON-based demo/supporting data files:
  - `patients.json`
  - `appointments.json`
  - `departments.json`

### Voice Layer

The project is designed for AI voice-agent integration. The current README intentionally does not claim a specific provider integration because the implementation/provider was not finalized.

### QR / Digital Pass

The system generates a QR-based appointment/pass representation for hospital check-in.

---

## 📂 Project Structure

A simplified project structure is:

```text
VEGAM/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── ...
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── ...
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── schemas.py
│   ├── patients.json
│   ├── appointments.json
│   ├── departments.json
│   └── ...
│
├── README.md
└── ...
```

> The exact folder structure may vary depending on the current implementation.

---

## ⚙️ Getting Started

### Prerequisites

Install:

- Node.js and npm
- Python 3.x
- pip

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_PROJECT_FOLDER>
```

### 2. Start the backend

Create/activate a Python virtual environment if required:

```bash
python -m venv venv
```

#### Windows

```bash
venv\Scripts\activate
```

#### macOS / Linux

```bash
source venv/bin/activate
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI application:

```bash
uvicorn main:app --reload
```

The API documentation should then be available at:

```text
http://127.0.0.1:8000/docs
```

---

### 3. Start the frontend

From the frontend directory:

```bash
npm install
npm run dev
```

Vite will provide the local development URL in the terminal, typically:

```text
http://localhost:5173
```

---

## 🔌 Backend / API Responsibilities

The backend supports the core prototype flows such as:

- Patient verification
- OTP verification
- Patient/profile retrieval
- Dependent lookup
- Department search
- Doctor availability
- Appointment slot retrieval
- Appointment booking
- Digital pass generation
- Recent appointment retrieval
- Emergency actions
- Location sharing
- Hospital check-in support

The exact endpoint names can follow the current implementation. The original design includes endpoints such as:

```http
POST /check_uhid
POST /verify_otp
GET  /dependents/{patient_id}
GET  /search_dept
GET  /doctors/{department}
GET  /slots
POST /book
GET  /appointment/{appointment_id}
POST /generate_pass
```

For the patient-portal portion, the backend design also supports concepts such as:

```http
GET /api/patients/appointments
GET /api/patients/profile
GET /api/patients/uhid
POST /api/emergency/location
POST /api/emergency/ambulance
POST /api/emergency/emergency-department
```

---

## 🔐 Security and Privacy Principles

VEGAM is a hackathon prototype and should **not** be considered production-ready healthcare software.

The prototype follows these design principles:

1. Do not store real Aadhaar numbers in demo data.
2. Use synthetic patient data for demonstrations.
3. Verify the user before exposing patient information.
4. Keep UHID and authentication credentials conceptually separate.
5. Do not put sensitive medical information inside QR codes.
6. Do not expose unnecessary internal database IDs to patients.
7. Do not hard-code secret API keys.
8. Emergency actions require user interaction.
9. Location sharing requires user permission.
10. Do not claim integration with government databases or services unless an authorized integration actually exists.

---

## 🚨 Emergency Flow

The SOS feature is intentionally simple for the prototype.

```text
             SOS
              ↓
      ┌───────┴────────┐
      │                │
      ▼                ▼
CALL EMERGENCY     SHARE LIVE /
NUMBER             CURRENT LOCATION
```

The device/user initiates the emergency call, while location sharing can be sent to the configured destination after permission is granted.

---

## ♿ Accessibility

VEGAM is designed around the idea that healthcare technology should work for people with different levels of digital confidence.

The interface emphasizes:

- Voice-first interaction
- English + Malayalam support structure
- Large, readable typography
- High-contrast UI
- Simple language
- Clear actions
- Reduced typing
- Straightforward navigation

---

## 🌍 Government Service Integration

VEGAM can provide access to official external government services through **redirection**.

For Kerala Government e-Health booking, the application should open the official service rather than reproducing it inside VEGAM.

This project does **not** claim:

- Official Kerala e-Health API integration
- Aadhaar API integration
- Digi Yatra integration
- ABHA integration
- Direct government database access

unless such integrations are separately authorized and configured.

---

## 🧪 Demo Data

The project should use synthetic data for the hackathon demonstration.

Example data can include:

```text
Patient:
Name: Ananya
Phone: 9876543210

Dependent:
Name: Aarav

Department:
Ophthalmology

Doctor:
Dr. Sharma

Appointment:
10:00 AM
Room: 204
Floor: 2
```

These examples are for demonstration purposes only.

---

## 📊 Expected Hackathon Impact

VEGAM aims to communicate three simple outcomes:

### Less Queue

Patients can initiate appointment booking without beginning the process at a registration counter.

### Less Confusion

Appointment details, QR check-in, and room/floor directions are brought together.

### More Accessible Healthcare

Voice-first interaction and bilingual design make the system easier to use for elderly users, low-literacy users, visually impaired users, and people who struggle with traditional digital forms.

---

## 🎯 Why VEGAM?

The platform is built around a public-service principle:

> **Government hospital booking without the headache.**

The technology should stay in the background. The patient should simply feel that they called, explained what they needed, received an appointment, and knew exactly where to go.

---

## 👥 Team — Area 51

**Team Name:** Area 51

### Members

- Alona
- Ananya
- Athulya
- Meghananda

---

## 🔮 Future Scope

Potential future improvements include:

- Full production-grade bilingual AI voice integration
- Real-time hospital appointment availability
- Multilingual voice recognition and response
- Hospital-wide indoor navigation
- Automated SMS/WhatsApp appointment notifications
- Secure production authentication
- Role-based hospital staff access
- Advanced analytics for hospital administrators
- Integration with authorized government and hospital systems
- Accessibility improvements for additional disabilities

---

## ⚠️ Prototype Disclaimer

VEGAM is a **hackathon prototype/demo**.

It uses mock/synthetic data and demonstrates the concept of an AI voice-first hospital appointment and patient assistance platform.

It should not be used as a replacement for an actual hospital information system, emergency response system, or government healthcare service.

Real-world deployment would require appropriate security, privacy, accessibility, reliability, healthcare compliance, authorized integrations, and institutional approval.

---

## ❤️ The Vision

```text
CALL
  ↓
VERIFY
  ↓
IDENTIFY
  ↓
BOOK
  ↓
GET OP TICKET
  ↓
SCAN QR
  ↓
FIND YOUR ROOM
  ↓
GET THE CARE YOU NEED
```

### **VEGAM — വികസിത ഇ-ഗോവ് ആരോഗ്യ മേധ**

**Less Queue. Less Confusion. More Accessible Healthcare.**
