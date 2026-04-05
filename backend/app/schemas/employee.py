from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator


class EmployeeCreate(BaseModel):
    """Request body for registering a new employee."""

    employee_id: str = Field(
        ...,
        description="Unique HR code assigned by the admin (e.g. EMP001).",
        examples=["EMP001"],
    )
    full_name: str = Field(
        ...,
        description="Full legal name of the employee.",
        examples=["Yashas R"],
    )
    email: EmailStr = Field(
        ...,
        description="Unique work email address.",
        examples=["yashas@company.com"],
    )
    department: str = Field(
        ...,
        description="Department the employee belongs to (e.g. Engineering, HR).",
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
    """Employee record returned in API responses."""

    id: int = Field(
        description="Auto-generated database primary key. Used in API URL paths.",
        examples=[1],
    )
    employee_id: str = Field(
        description="HR code assigned by admin (e.g. EMP001). Used for display only.",
        examples=["EMP001"],
    )
    full_name: str = Field(description="Full name of the employee.", examples=["Yashas R"])
    email: str = Field(description="Work email address.", examples=["yashas@company.com"])
    department: str = Field(description="Department name.", examples=["Engineering"])
    created_at: datetime = Field(description="Timestamp when the record was created.")

    model_config = {"from_attributes": True}


class EmployeeWithStats(EmployeeOut):
    """Employee record enriched with aggregated attendance statistics."""

    total_present: int = Field(0, description="Total days marked Present.")
    total_absent: int = Field(0, description="Total days marked Absent.")
