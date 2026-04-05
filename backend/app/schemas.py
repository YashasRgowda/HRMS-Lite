from datetime import datetime
from datetime import date as Date
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models import AttendanceStatus


# ── Employee ───────────────────────────────────────────────────────────────────

class EmployeeCreate(BaseModel):
    """Payload for registering a new employee."""

    employee_id: str = Field(
        ...,
        description="Unique HR code for this employee (e.g. EMP001). Assigned by the admin.",
        examples=["EMP001"],
    )
    full_name: str = Field(
        ...,
        description="Full legal name of the employee.",
        examples=["Yashas R"],
    )
    email: EmailStr = Field(
        ...,
        description="Unique work email address of the employee.",
        examples=["yashas@company.com"],
    )
    department: str = Field(
        ...,
        description="Department the employee belongs to (e.g. Engineering, HR, Sales).",
        examples=["Engineering"],
    )

    @field_validator("employee_id")
    @classmethod
    def employee_id_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Employee ID cannot be blank.")
        return v

    @field_validator("full_name", "department")
    @classmethod
    def not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("This field cannot be blank.")
        return v


class EmployeeOut(BaseModel):
    """Employee record returned by the API."""

    id: int = Field(
        description="Auto-generated database primary key. Used in API URLs like /employees/{id}.",
        examples=[1],
    )
    employee_id: str = Field(
        description="Human-readable HR code assigned by the admin (e.g. EMP001).",
        examples=["EMP001"],
    )
    full_name: str = Field(description="Full name of the employee.", examples=["Yashas R"])
    email: str = Field(description="Work email address.", examples=["yashas@company.com"])
    department: str = Field(description="Department name.", examples=["Engineering"])
    created_at: datetime = Field(description="Timestamp when the employee record was created.")

    model_config = {"from_attributes": True}


class EmployeeWithStats(EmployeeOut):
    """Employee record enriched with attendance statistics."""

    total_present: int = Field(0, description="Total number of days marked Present.")
    total_absent: int = Field(0, description="Total number of days marked Absent.")


# ── Attendance ─────────────────────────────────────────────────────────────────

class AttendanceCreate(BaseModel):
    """Payload for marking attendance for an employee."""

    employee_id: int = Field(
        ...,
        description=(
            "Database primary key (`id`) of the employee. "
            "This is the integer `id` from the GET /employees response — "
            "NOT the HR code string like 'EMP001'."
        ),
        examples=[1],
    )
    date: Date = Field(
        ...,
        description="Date of attendance in YYYY-MM-DD format.",
        examples=["2026-04-05"],
    )
    status: AttendanceStatus = Field(
        ...,
        description="Attendance status. Allowed values: `present` or `absent`.",
        examples=["present"],
    )


class AttendanceOut(BaseModel):
    """Attendance record returned by the API."""

    id: int = Field(description="Auto-generated database primary key of this attendance record.", examples=[1])
    employee_id: int = Field(
        description="Database primary key (`id`) of the employee this record belongs to.",
        examples=[1],
    )
    date: Date = Field(description="Date of this attendance record.", examples=["2026-04-05"])
    status: AttendanceStatus = Field(description="Attendance status: `present` or `absent`.")
    created_at: datetime = Field(description="Timestamp when this record was created.")
    employee_name: Optional[str] = Field(None, description="Full name of the employee (populated automatically).")
    employee_code: Optional[str] = Field(None, description="HR employee code of the employee (e.g. EMP001).")

    model_config = {"from_attributes": True}


# ── Dashboard ──────────────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    """Aggregated statistics for the HR dashboard."""

    total_employees: int = Field(description="Total number of employees registered in the system.")
    present_today: int = Field(description="Number of employees marked Present today.")
    absent_today: int = Field(description="Number of employees marked Absent today.")
    not_marked_today: int = Field(description="Number of employees whose attendance has not been marked today.")


# ── Attendance update ──────────────────────────────────────────────────────────

class AttendanceStatusUpdate(BaseModel):
    """Payload for updating the status of an existing attendance record."""

    status: AttendanceStatus = Field(
        ...,
        description="New attendance status. Allowed values: `present` or `absent`.",
        examples=["present"],
    )


# ── Generic responses ──────────────────────────────────────────────────────────

class MessageResponse(BaseModel):
    """Generic success response."""

    success: bool = Field(description="Whether the operation was successful.")
    message: str = Field(description="Human-readable confirmation message.")
