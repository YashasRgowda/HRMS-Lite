from datetime import date as Date
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.attendance import AttendanceStatus


class AttendanceCreate(BaseModel):
    """Request body for marking a new attendance record."""

    employee_id: int = Field(
        ...,
        description=(
            "Database primary key (`id`) of the employee. "
            "Get this from GET /employees — NOT the HR code string like 'EMP001'."
        ),
        examples=[1],
    )
    date: Date = Field(
        ...,
        description="Date of attendance in YYYY-MM-DD format.",
        examples=["2026-04-06"],
    )
    status: AttendanceStatus = Field(
        ...,
        description="Attendance status. Allowed values: `present` or `absent`.",
        examples=["present"],
    )


class AttendanceStatusUpdate(BaseModel):
    """Request body for updating the status of an existing attendance record."""

    status: AttendanceStatus = Field(
        ...,
        description="New attendance status. Allowed values: `present` or `absent`.",
        examples=["present"],
    )


class AttendanceOut(BaseModel):
    """Attendance record returned in API responses."""

    id: int = Field(description="Auto-generated primary key of this attendance record.", examples=[1])
    employee_id: int = Field(
        description="Database `id` of the employee this record belongs to.",
        examples=[1],
    )
    date: Date = Field(description="Date of this attendance record.", examples=["2026-04-06"])
    status: AttendanceStatus = Field(description="Attendance status: `present` or `absent`.")
    created_at: datetime = Field(description="Timestamp when this record was created.")
    employee_name: Optional[str] = Field(None, description="Full name of the employee.")
    employee_code: Optional[str] = Field(None, description="HR code of the employee (e.g. EMP001).")

    model_config = {"from_attributes": True}
