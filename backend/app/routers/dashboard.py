from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Employee, Attendance, AttendanceStatus
from app.schemas import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardStats)
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
