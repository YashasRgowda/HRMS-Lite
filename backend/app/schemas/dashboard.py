from pydantic import BaseModel, Field


class DashboardStats(BaseModel):
    """Aggregated HR statistics for today's date."""

    total_employees: int = Field(description="Total employees registered in the system.")
    present_today: int = Field(description="Employees marked Present today.")
    absent_today: int = Field(description="Employees marked Absent today.")
    not_marked_today: int = Field(description="Employees not yet marked today.")
