from datetime import date as DateType
from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.attendance import Attendance, AttendanceStatus
from app.models.employee import Employee
from app.schemas.attendance import AttendanceCreate, AttendanceOut, AttendanceStatusUpdate
from app.schemas.common import MessageResponse
from app.schemas.dashboard import DashboardStats


def _enrich(record: Attendance) -> AttendanceOut:
    """Attach employee name and HR code onto an attendance record."""
    out = AttendanceOut.model_validate(record)
    if record.employee:
        out.employee_name = record.employee.full_name
        out.employee_code = record.employee.employee_id
    return out


def list_attendance(
    db: Session,
    employee_id: Optional[int] = None,
    date: Optional[DateType] = None,
) -> List[AttendanceOut]:
    """Return attendance records with optional filters by employee or date."""
    query = db.query(Attendance)
    if employee_id is not None:
        query = query.filter(Attendance.employee_id == employee_id)
    if date is not None:
        query = query.filter(Attendance.date == date)
    records = query.order_by(Attendance.date.desc(), Attendance.id.desc()).all()
    return [_enrich(r) for r in records]


def mark_attendance(db: Session, payload: AttendanceCreate) -> AttendanceOut:
    """Create a new attendance record. Raises 404/409 on failure."""
    employee = db.query(Employee).filter(Employee.id == payload.employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No employee found with id={payload.employee_id}. Use the integer `id` from GET /employees.",
        )

    duplicate = db.query(Attendance).filter(
        Attendance.employee_id == payload.employee_id,
        Attendance.date == payload.date,
    ).first()
    if duplicate:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Attendance for '{employee.full_name}' ({employee.employee_id}) "
                f"on {payload.date} is already marked as '{duplicate.status.value}'. "
                "Use PUT /attendance/{id} to update it."
            ),
        )

    record = Attendance(**payload.model_dump())
    db.add(record)
    try:
        db.commit()
        db.refresh(record)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Attendance for this employee on the given date is already recorded.",
        )
    db.refresh(record)
    return _enrich(record)


def update_attendance(db: Session, id: int, payload: AttendanceStatusUpdate) -> AttendanceOut:
    """Update the status of an existing attendance record. Raises 404 if not found."""
    record = db.query(Attendance).filter(Attendance.id == id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No attendance record found with id={id}.",
        )
    record.status = payload.status
    db.commit()
    db.refresh(record)
    return _enrich(record)


def delete_attendance(db: Session, id: int) -> MessageResponse:
    """Delete a single attendance record. Raises 404 if not found."""
    record = db.query(Attendance).filter(Attendance.id == id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No attendance record found with id={id}.",
        )
    db.delete(record)
    db.commit()
    return MessageResponse(
        success=True,
        message=f"Attendance record (id={id}) has been deleted successfully.",
    )


def get_dashboard_stats(db: Session) -> DashboardStats:
    """Return today's aggregated attendance statistics."""
    today = DateType.today()
    total_employees = db.query(Employee).count()
    today_records = db.query(Attendance).filter(Attendance.date == today).all()
    present_today = sum(1 for r in today_records if r.status == AttendanceStatus.present)
    absent_today = sum(1 for r in today_records if r.status == AttendanceStatus.absent)
    not_marked_today = max(0, total_employees - len(today_records))
    return DashboardStats(
        total_employees=total_employees,
        present_today=present_today,
        absent_today=absent_today,
        not_marked_today=not_marked_today,
    )
