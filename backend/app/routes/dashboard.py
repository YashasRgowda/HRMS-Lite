from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.dashboard import DashboardStats
from app.services import attendance_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get(
    "",
    response_model=DashboardStats,
    summary="Get Dashboard Statistics",
    description="""
Returns a real-time attendance summary for **today's date**.

**Response fields:**

- `total_employees` — Total number of employees registered in the system.
- `present_today` — Employees marked as **Present** today.
- `absent_today` — Employees marked as **Absent** today.
- `not_marked_today` — Employees whose attendance has **not yet been marked** today.

No parameters required. The date is automatically set to today.
""",
    response_description="Aggregated HR statistics for today.",
)
def get_dashboard(db: Session = Depends(get_db)):
    return attendance_service.get_dashboard_stats(db)
