from datetime import datetime, date
from typing import Optional, List

from pydantic import BaseModel, EmailStr, field_validator

from app.models import AttendanceStatus


# ── Employee ──────────────────────────────────────────────────────────────────

class EmployeeCreate(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    department: str

    @field_validator("employee_id")
    @classmethod
    def employee_id_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Employee ID cannot be blank")
        return v

    @field_validator("full_name", "department")
    @classmethod
    def not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Field cannot be blank")
        return v


class EmployeeOut(BaseModel):
    id: int
    employee_id: str
    full_name: str
    email: str
    department: str
    created_at: datetime

    model_config = {"from_attributes": True}


class EmployeeWithStats(EmployeeOut):
    total_present: int = 0
    total_absent: int = 0


# ── Attendance ─────────────────────────────────────────────────────────────────

class AttendanceCreate(BaseModel):
    employee_id: int
    date: date
    status: AttendanceStatus


class AttendanceOut(BaseModel):
    id: int
    employee_id: int
    date: date
    status: AttendanceStatus
    created_at: datetime
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None

    model_config = {"from_attributes": True}


# ── Dashboard ──────────────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_employees: int
    present_today: int
    absent_today: int
    not_marked_today: int
