from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Employee, Attendance, AttendanceStatus
from app.schemas import DashboardStats

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
    today = date.today()

    total_employees = db.query(Employee).count()

    today_records = db.query(Attendance).filter(Attendance.date == today).all()
    present_today = sum(1 for r in today_records if r.status == AttendanceStatus.present)
    absent_today = sum(1 for r in today_records if r.status == AttendanceStatus.absent)
    marked_today = len(today_records)
    not_marked_today = max(0, total_employees - marked_today)

    return DashboardStats(
        total_employees=total_employees,
        present_today=present_today,
        absent_today=absent_today,
        not_marked_today=not_marked_today,
    )
