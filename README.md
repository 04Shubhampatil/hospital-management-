# MediFlow — Hospital Management System

A full-stack hospital management platform where patients upload medical reports for AI-powered analysis and automatic assignment to the appropriate specialist doctor.

## Features

**For Patients:**
- Register and log in securely
- Upload medical reports (PDF or images) for analysis
- Describe symptoms alongside the report
- AI automatically extracts text (OCR), categorizes the condition, and assigns a matching doctor
- Track report status: PENDING → ANALYZING → ASSIGNED → REVIEWED
- View detailed analysis results with category, confidence, and AI reasoning

**For Doctors:**
- View all cases assigned to you
- Read patient symptoms and extracted report text
- Mark cases as reviewed once handled

**For Admins:**
- Dashboard of all patient reports across the system
- Manually assign doctors to reports
- Trigger re-analysis on any report
- Add and manage doctor profiles (name, email, category, specialization, experience)

**AI-Powered:**
- Google Gemini analyzes report text and predicts the required medical specialty
- Automatic fallback to keyword-based matching if the AI is unavailable
- Auto-assigns the nearest available specialist (or falls back to General Physician)

---

## Tech Stack

- **Frontend:** React 19, Vite 6, Tailwind CSS 3, Zustand, React Router 7, Lucide Icons
- **Backend:** Node.js, Express 4, MongoDB + Mongoose, JWT auth, Multer
- **AI:** Google Gemini 1.5 Flash API + rule-based fallback
- **OCR:** Tesseract.js (images), pdf-parse (PDFs)

---

## Prerequisites

- Node.js v18 or later
- MongoDB instance (local or Atlas)
- Google Gemini API key (free from [Google AI Studio](https://aistudio.google.com/))

---

## Installation

### 1. Clone and set up backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` (or copy from `.env.example`):

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.xxxxx.mongodb.net/hospital-mgmt
JWT_SECRET=your-secret-key-change-in-production
GEMINI_API_KEY=your-gemini-api-key
```

### 2. Set up frontend

```bash
cd frontend
npm install
```

---

## Running Locally

### Start the backend

```bash
cd backend
npm run dev
```

Server starts at `http://localhost:5000`.

### Start the frontend (in a separate terminal)

```bash
cd frontend
npm run dev
```

App starts at `http://localhost:5173`. The Vite dev server proxies `/api` requests to `localhost:5000`.

---

## User Walkthrough

### 1. Registration
- Open `http://localhost:5173/register`
- Enter name, email, password
- Choose **Patient** or **Doctor** role
- If Doctor, select your category (e.g. Cardiologist) and optionally add specialization/experience
- Click "Create Account" — you're automatically logged in

> Note: Admin accounts can only be created directly in the database (not through the UI for security).

### 2. Login
- Existing users sign in at `/login`
- After login, you're redirected based on your role:
  - **Patient** → Upload Report page
  - **Doctor** → Assigned Cases page
  - **Admin** → All Reports page

### 3. Patient: Upload a Report
- On `/upload`, click the upload area and select a medical report file (PDF, PNG, JPG — up to 10MB)
- Optionally type your symptoms
- Click "Upload & Analyze"
- The system processes the file: runs OCR to extract text, sends it to Gemini AI for categorization, and auto-assigns a matching doctor
- Results appear instantly showing:
  - **Status** — whether a doctor was assigned
  - **Predicted Category** — e.g. "Cardiologist"
  - **Confidence** — High/Medium/Low
  - **Method** — "gemini" or "rule-based"
  - **Reasoning** — brief explanation from the AI

### 4. Patient: View Reports
- Navigate to "My Reports" to see all your uploaded reports
- Each card shows the date, a text preview, the AI-predicted category, and the current status
- Click any report to see full details including extracted text and AI analysis

### 5. Doctor: Review Assigned Cases
- Your assigned cases appear on the "Assigned Cases" page
- Each case shows the patient name, predicted category, symptoms, and extracted text
- Click **"Mark Reviewed"** after handling the case
- Status updates to "REVIEWED" immediately

### 6. Admin: Manage Reports
- The "All Reports" page shows every patient report in a table
- For unassigned reports, use the dropdown to select a doctor and click to assign
- Click **"Re-analyze"** to re-run AI analysis (clears previous assignment)

### 7. Admin: Manage Doctors
- The "Doctors" page lists all registered doctors
- Click **"Add Doctor"** to fill in name, email, password, category, specialization, experience
- The table shows availability status at a glance

---

## Report Lifecycle

```
[UPLOAD] → [OCR EXTRACT] → [AI ANALYZE] → [AUTO-ASSIGN] → [DOCTOR REVIEWS]
                                                                    ↓
                                                             [REVIEWED]
```

| Status | Meaning |
|--------|---------|
| PENDING | Uploaded, waiting for processing |
| ANALYZING | OCR or AI analysis in progress |
| ASSIGNED | A doctor has been assigned (auto or manual) |
| REVIEWED | The assigned doctor has marked the case as reviewed |

---

## API Overview

| Endpoint | Purpose |
|----------|---------|
| `POST /api/auth/register` | Create account |
| `POST /api/auth/login` | Sign in (returns JWT token) |
| `POST /api/reports/upload` | Upload a report file |
| `POST /api/reports/:id/extract-text` | Run OCR + AI analysis on a report |
| `PATCH /api/doctor/reports/:id/mark-reviewed` | Doctor marks case as reviewed |
| `GET /api/admin/reports` | List all reports (admin) |
| `PATCH /api/admin/reports/:id/assign-doctor` | Assign a doctor (admin) |

Full API documentation available in `brain.readme`.

---

## Project Structure

```
hospitam-managment/
├── backend/           # Express API server
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API route definitions
│   │   ├── middlewares/    # Auth, file upload
│   │   └── services/       # OCR, AI analysis
│   └── uploads/            # Stored report files
├── frontend/          # React SPA
│   └── src/
│       ├── pages/          # Route pages
│       ├── components/     # Layout, route guards
│       ├── store/          # Zustand auth store
│       └── lib/            # Axios config, utilities
└── sample_cardiology_report.html  # Demo report
```
