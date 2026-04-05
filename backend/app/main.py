from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.routes import employees, attendance, dashboard

import app.models  # noqa: F401 — ensures all ORM models are registered before create_all


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create all database tables on startup."""
    Base.metadata.create_all(bind=engine)
    yield


# ── OpenAPI metadata ───────────────────────────────────────────────────────────

DESCRIPTION = """
A lightweight RESTful backend for managing employee records and daily attendance tracking.

---

## Understanding the Two ID Fields

Every employee in this system has **two different identifiers**. This is the most important concept to understand before using the API.

**`id`** — *Database Primary Key*
- Auto-generated integer assigned by the database (e.g. `1`, `2`, `3`)
- Used in all API URL paths: `/employees/{id}`, `/attendance/{id}`
- You cannot choose or change this value

**`employee_id`** — *HR Employee Code*
- A string code manually assigned by the admin (e.g. `EMP001`, `HR-42`)
- Shown in the employee list as a human-readable identifier
- Used for display purposes only — **never used in URL paths**

> **Important:** When marking attendance or filtering records by employee, always pass the integer `id` — not the `employee_id` string.

---

## Modules

**Employees**
Register new employees, view the full employee list, or delete an employee record.
Deleting an employee also removes all their attendance records automatically.

**Attendance**
Mark daily attendance as `present` or `absent` for any registered employee.
Each employee can have only one attendance entry per day.
Filter records by employee or by date.

**Dashboard**
View a live summary of today's attendance — how many employees are present, absent, or not yet marked.

---

## HTTP Status Codes Used

| Code | Meaning |
|------|---------|
| `200` | Success — returns data or a confirmation message |
| `201` | Created — a new record was successfully created |
| `404` | Not Found — the requested employee or record does not exist |
| `409` | Conflict — duplicate entry (e.g. same HR code, email, or attendance date) |
| `422` | Validation Error — request body has missing or invalid fields |
"""

tags_metadata = [
    {
        "name": "Employees",
        "description": (
            "Create, list, and delete employee records. "
            "Each employee has an auto-generated integer `id` (used in URLs) "
            "and a manually assigned HR code `employee_id` like `EMP001` (used for display)."
        ),
    },
    {
        "name": "Attendance",
        "description": (
            "Mark and retrieve daily attendance records. "
            "Pass the integer `id` from GET /employees when identifying an employee — "
            "not the HR code string. "
            "Only one attendance record is allowed per employee per calendar day."
        ),
    },
    {
        "name": "Dashboard",
        "description": (
            "Real-time HR statistics for today: "
            "total employees registered, how many are present, absent, and not yet marked."
        ),
    },
    {
        "name": "Health",
        "description": "Simple health check to verify the API server is running.",
    },
]

# ── App instance ───────────────────────────────────────────────────────────────

app = FastAPI(
    title=settings.APP_TITLE,
    description=DESCRIPTION,
    version=settings.APP_VERSION,
    openapi_tags=tags_metadata,
    contact={
        "name": "HRMS Lite",
        "url": "https://github.com/your-username/HRMS-Lite",
    },
    lifespan=lifespan,
)

# ── Middleware ─────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────────

app.include_router(employees.router)
app.include_router(attendance.router)
app.include_router(dashboard.router)


# ── Health check ───────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"], summary="API Health Check")
def root():
    return {"status": "ok", "message": f"{settings.APP_TITLE} is running"}
