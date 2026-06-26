# MediFlow — Hospital Management System — Technical Overview

## Architecture

Monorepo with two independent Node.js applications communicating via REST API:

```
hospitam-managment/
├── backend/          # Express.js API server (port 5000)
├── frontend/         # React SPA (Vite, port 5173)
└── sample_cardiology_report.html   # Demo report for testing
```

**Data flow:** Frontend (React) → Axios HTTP → Vite dev proxy (/api → localhost:5000) → Express routes → Controllers → Mongoose/MongoDB

---

## Backend (`backend/`)

### Tech Stack
- **Runtime:** Node.js (ES Modules, `"type": "module"`)
- **Framework:** Express 4.x
- **Database:** MongoDB via Mongoose 8.x
- **Auth:** JWT (jsonwebtoken) + bcryptjs
- **File uploads:** Multer (disk storage to `uploads/`)
- **OCR:** Tesseract.js (images) + pdf-parse (PDFs)
- **AI:** Google Gemini 1.5 Flash (via `@google/generative-ai`) with rule-based fallback

### File Tree
```
backend/
├── .env / .env.example          # Environment variables
├── package.json
├── uploads/                     # Uploaded medical reports (PDFs/images)
└── src/
    ├── index.js                 # Entry point — Express app + MongoDB connect
    ├── controllers/
    │   ├── authController.js    # register, login, getMe
    │   ├── adminController.js   # getAllReports, assignDoctor, reanalyzeReport
    │   ├── doctorController.js  # createDoctor, listDoctors, getDoctor, updateDoctor
    │   ├── reportController.js  # uploadReport, getMyReports, getReport, extractTextFromReport, analyzeReport
    │   └── doctorReportController.js  # getAssignedReports, markReviewed
    ├── middlewares/
    │   ├── auth.js              # authenticate (JWT verify), authorize (role check)
    │   └── upload.js            # Multer config (10MB limit, images + PDFs)
    ├── models/
    │   ├── User.js              # name, email, passwordHash, role (PATIENT|ADMIN|DOCTOR)
    │   ├── PatientProfile.js    # userId, age, gender, phone
    │   ├── DoctorProfile.js     # userId, category (enum 12 specialities), specialization, experienceYears, isAvailable
    │   └── PatientReport.js     # patientId, filePath, symptoms, extractedText, aiAnalysis (Mixed), status, assignedDoctorId
    ├── routes/
    │   ├── auth.js              # /api/auth/*
    │   ├── doctors.js           # /api/doctors/*
    │   ├── reports.js           # /api/reports/*
    │   ├── admin.js             # /api/admin/*
    │   └── doctorReports.js     # /api/doctor/*
    └── services/
        ├── ocr.js               # extractText (image via Tesseract, PDF via pdf-parse)
        └── ai.js                # analyzeText (Gemini API with keyword-based fallback)
```

### Database Schemas

**User** — Central identity. All users (patients, doctors, admins) are `User` documents.
| Field | Type | Notes |
|-------|------|-------|
| `name` | String | required |
| `email` | String | unique, lowercase, required |
| `passwordHash` | String | bcrypt(10) |
| `role` | String | enum: PATIENT, ADMIN, DOCTOR |

**DoctorProfile** — Linked 1:1 to User via `userId`.
| Field | Type | Notes |
|-------|------|-------|
| `userId` | ObjectId → User | unique, required |
| `category` | String | enum of 12 medical specialities |
| `specialization` | String | free-text (e.g. "Interventional Cardiology") |
| `experienceYears` | Number | default 0 |
| `isAvailable` | Boolean | default true |

**PatientProfile** — Linked 1:1 to User via `userId`. Optional fields for age, gender, phone.

**PatientReport** — Uploaded medical report with processing pipeline state.
| Field | Type | Notes |
|-------|------|-------|
| `patientId` | ObjectId → User | required |
| `filePath` | String | server file path |
| `symptoms` | String | user-provided text |
| `extractedText` | String | OCR output |
| `aiAnalysis` | Mixed | `{category, confidence, reasoning, method}` |
| `status` | String | PENDING → ANALYZING → ASSIGNED → REVIEWED |
| `assignedDoctorId` | ObjectId → User | nullable |

### API Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/api/auth/register` | — | — | Register patient/doctor |
| POST | `/api/auth/login` | — | — | Login, returns JWT |
| GET | `/api/auth/me` | Yes | * | Current user info |
| POST | `/api/doctors` | Yes | ADMIN | Create doctor profile |
| GET | `/api/doctors` | — | — | List doctors (optional ?category, ?isAvailable) |
| GET | `/api/doctors/:id` | — | — | Single doctor |
| PATCH | `/api/doctors/:id` | Yes | ADMIN | Update doctor |
| POST | `/api/reports/upload` | Yes | PATIENT | Upload report file |
| GET | `/api/reports/my` | Yes | PATIENT | My uploaded reports |
| GET | `/api/reports/:id` | Yes | PATIENT/ADMIN | Single report details |
| POST | `/api/reports/:id/extract-text` | Yes | PATIENT | OCR + AI analysis + auto-assign |
| POST | `/api/reports/:id/analyze` | Yes | PATIENT | Re-run AI analysis |
| GET | `/api/admin/reports` | Yes | ADMIN | All reports |
| PATCH | `/api/admin/reports/:id/assign-doctor` | Yes | ADMIN | Manually assign a doctor |
| POST | `/api/admin/reports/:id/reanalyze` | Yes | ADMIN | Re-run AI analysis (admin) |
| GET | `/api/doctor/reports` | Yes | DOCTOR | Reports assigned to current doctor |
| PATCH | `/api/doctor/reports/:id/mark-reviewed` | Yes | DOCTOR | Mark report as reviewed |

### Services

**OCR (`services/ocr.js`)** — Dispatches based on file extension:
- `.pdf` → `pdf-parse` (extracts text from PDF buffer)
- Images (png, jpg, etc.) → `tesseract.js` (runs Tesseract OCR worker in "eng")

**AI Analysis (`services/ai.js`)** — Two-tier approach:
1. **Primary:** Google Gemini 1.5 Flash — receives a system prompt instructing JSON-only medical triage response (`{category, confidence, reasoning}`)
2. **Fallback:** Keyword-based rule matching — 40+ medical keywords mapped to 12 categories. Returns low-confidence result.
3. **Empty text fallback:** Returns "General Physician" with "low" confidence.

### Auto-Assignment Logic (`reportController.js:assignDoctorByCategory`)
1. Find an available doctor matching the AI-predicted category
2. If none found and category isn't "General Physician", fallback to available General Physician
3. If still none, pick any available doctor

---

## Frontend (`frontend/`)

### Tech Stack
- **Framework:** React 19
- **Build tool:** Vite 6
- **Routing:** react-router-dom v7
- **State management:** Zustand 5 (auth store only)
- **HTTP client:** Axios 1.x with interceptors (JWT injection + 401 redirect)
- **CSS:** Tailwind CSS 3.4 + custom component classes
- **Icons:** Lucide React

### File Tree
```
frontend/
├── index.html                      # HTML shell with Google Fonts (Inter)
├── vite.config.js                  # Dev proxy /api → localhost:5000
├── tailwind.config.js              # Custom animations + Inter font
├── postcss.config.js
├── package.json
└── src/
    ├── main.jsx                    # ReactDOM entry + BrowserRouter
    ├── App.jsx                     # Route definitions + HomeRedirect
    ├── index.css                   # Tailwind directives + .card, .btn-primary, etc.
    ├── store/
    │   └── authStore.js            # Zustand: user, token, login, register, logout
    ├── lib/
    │   ├── api.js                  # Axios instance with interceptors
    │   └── utils.js                # cn() helper (clsx + tailwind-merge)
    ├── components/
    │   ├── DashboardLayout.jsx     # Sidebar nav + user menu shell
    │   └── ProtectedRoute.jsx      # Auth + role guard wrapper
    └── pages/
        ├── Login.jsx               # Email + password form
        ├── Register.jsx            # Name, email, password, role + doctor fields
        ├── UploadReport.jsx        # File upload + symptoms + auto analysis result
        ├── MyReports.jsx           # Patient's report list with status badges
        ├── ReportDetails.jsx       # Full report with extracted text + AI analysis
        ├── AssignedCases.jsx       # Doctor's assigned reports + mark-reviewed
        ├── AllReports.jsx          # Admin: table of all reports + assign/reanalyze
        └── DoctorManagement.jsx    # Admin: add/view doctors table
```

### State Management
- **Global state:** `authStore.js` (Zustand) — persists `user` and `token` to localStorage
- **Local state:** Each page manages its own data via `useState` + `useEffect` API calls
- **No caching library** (React Query, SWR) — all data fetching is manual with `useEffect`

### Routing & Role-Based Access
| Route | Roles | Component |
|-------|-------|-----------|
| `/login` | — | Login |
| `/register` | — | Register |
| `/upload` | PATIENT | UploadReport |
| `/reports` | PATIENT | MyReports |
| `/reports/:id` | PATIENT, ADMIN, DOCTOR | ReportDetails |
| `/doctor/reports` | DOCTOR | AssignedCases |
| `/admin/reports` | ADMIN | AllReports |
| `/admin/doctors` | ADMIN | DoctorManagement |
| `/` | * | HomeRedirect (role-based redirect) |

`ProtectedRoute` checks `user` from Zustand store and optionally validates `roles` array. Unauthorized users redirect to `/login`.

### DashboardLayout Component
- Persistent sidebar with role-specific navigation (Lucide icons)
- Header with app branding ("MediFlow") and role badge
- User avatar (first letter initial) + logout button
- Main content area with max-width container and fade-in animation

### CSS Architecture
- Tailwind utility classes for layout and spacing
- Custom component layer (`@layer components`) defining reusable classes:
  - `.card` / `.card-solid` — glassmorphism/white card variants
  - `.input-field` — styled inputs with focus rings
  - `.btn-primary` / `.btn-secondary` — gradient/text buttons
  - `.badge-{color}` — status badges for report states
- Custom animations: `fade-in`, `slide-up`, `slide-in-right` with staggered delays via `style={{ animationDelay }}`

### Key UI Flows

**Report Upload Flow:**
1. User selects file (PDF/image) and optional symptoms
2. POST `/reports/upload` → creates report document
3. POST `/reports/:id/extract-text` → OCR + AI analysis + auto-assignment
4. Frontend displays analysis result with category, confidence, method, reasoning
5. If auto-assigned, shows green success banner; otherwise amber warning for manual admin assignment

**Doctor Review Flow:**
1. Doctor logs in → redirected to `/doctor/reports`
2. Sees assigned cases list with patient name, category, symptoms, extracted text preview
3. Clicks "Mark Reviewed" → PATCH `/doctor/reports/:id/mark-reviewed`
4. Button replaced with "Reviewed" badge (gray)

**Admin Management Flow:**
1. Admin logs in → redirected to `/admin/reports`
2. Table of all reports with patient, category, status, assigned doctor
3. Dropdown to select doctor from list → PATCH assign-doctor
4. "Re-analyze" button → POST reanalyze (clears assignment, re-runs AI)
5. `/admin/doctors` to add/view doctor profiles

---

## Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default 5000) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | JWT signing secret |
| `GEMINI_API_KEY` | Yes | Google Gemini API key (for AI analysis) |

---

## Known Non-Bug Issues
- No unit or integration tests
- No input sanitization on extracted text display (XSS possible if report text contains HTML/script)
- PDF-parse runs synchronously via `readFileSync` — consider streaming for large files
- No rate limiting on auth endpoints
- Gemini API key exposed in `.env` (should be rotated regularly)
