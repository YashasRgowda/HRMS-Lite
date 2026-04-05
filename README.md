# HRMS Lite — Lightweight HR Management System

A full-stack web application for managing employee records and tracking daily attendance.

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | Next.js 16 (App Router, JavaScript) |
| UI        | Tailwind CSS v4, shadcn/ui, Radix   |
| Backend   | FastAPI (Python 3.13)               |
| Database  | PostgreSQL + SQLAlchemy ORM         |
| Deployment| Vercel (frontend) · Render (backend)|

---

## Features

- **Employee Management** — Add, view, and delete employee records (Employee ID, Name, Email, Department)
- **Attendance Tracking** — Mark daily attendance (Present / Absent), view all records with filters
- **Dashboard** — Live summary of total employees, today's present/absent/not-marked counts, recent attendance log
- **Attendance Summary** — Total present and absent days per employee
- **Filters** — Filter attendance by employee and/or date

---

## Local Setup

### Prerequisites

- Node.js ≥ 18
- Python ≥ 3.11
- PostgreSQL running locally

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd HRMS-Lite
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create the database
psql postgres -c "CREATE DATABASE hrms_db;"

# Configure environment
cp .env.example .env
# Edit .env and set your DATABASE_URL:
# DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/hrms_db

# Start the server
uvicorn app.main:app --reload
```

Backend runs at: http://127.0.0.1:8000  
API docs at: http://127.0.0.1:8000/docs

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local   # or create manually:
echo "NEXT_PUBLIC_API_URL=http://127.0.0.1:8000" > .env.local

# Start the dev server
npm run dev
```

Frontend runs at: http://localhost:3000

---

## API Endpoints

| Method | Endpoint                 | Description                        |
|--------|--------------------------|------------------------------------|
| GET    | `/employees`             | List all employees (with stats)    |
| POST   | `/employees`             | Create a new employee              |
| GET    | `/employees/{id}`        | Get a single employee              |
| DELETE | `/employees/{id}`        | Delete an employee                 |
| GET    | `/attendance`            | List attendance (filterable)       |
| POST   | `/attendance`            | Mark attendance                    |
| PUT    | `/attendance/{id}`       | Update an attendance record        |
| DELETE | `/attendance/{id}`       | Delete an attendance record        |
| GET    | `/dashboard`             | Dashboard statistics               |

---

## Assumptions & Limitations

- Single admin user — no authentication is implemented (as per assignment scope)
- Leave management, payroll, and advanced HR features are out of scope
- Attendance is unique per employee per date (one record per day)
- Deleting an employee cascades and removes all their attendance records

---

## Deployment

- **Frontend**: Deployed on [Vercel](https://vercel.com) — set `NEXT_PUBLIC_API_URL` to your backend URL
- **Backend**: Deployed on [Render](https://render.com) — set `DATABASE_URL` environment variable in the Render dashboard

---

## Project Structure

```
HRMS-Lite/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, lifespan
│   │   ├── database.py      # SQLAlchemy engine & session
│   │   ├── models.py        # ORM models (Employee, Attendance)
│   │   ├── schemas.py       # Pydantic request/response schemas
│   │   └── routers/
│   │       ├── employees.py
│   │       ├── attendance.py
│   │       └── dashboard.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    └── src/
        ├── app/
        │   ├── dashboard/page.js
        │   ├── employees/page.js
        │   └── attendance/page.js
        ├── components/
        │   ├── layout/
        │   │   ├── Sidebar.jsx
        │   │   └── AppLayout.jsx
        │   └── ui/           # shadcn components
        └── lib/
            ├── api.js        # API client
            └── utils.js
```
