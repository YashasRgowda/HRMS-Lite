from datetime import date as date_type
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models import Attendance, Employee
from app.schemas import AttendanceCreate, AttendanceOut

router = APIRouter(prefix="/attendance", tags=["attendance"])


def _enrich(record: Attendance) -> AttendanceOut:
    out = AttendanceOut.model_validate(record)
    if record.employee:
        out.employee_name = record.employee.full_name
        out.employee_code = record.employee.employee_id
    return out


@router.get("", response_model=List[AttendanceOut])
def list_attendance(
    employee_id: Optional[int] = Query(None, description="Filter by employee primary key"),
    date: Optional[date_type] = Query(None, description="Filter by date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
):
    query = db.query(Attendance)
    if employee_id is not None:
        query = query.filter(Attendance.employee_id == employee_id)
    if date is not None:
        query = query.filter(Attendance.date == date)
    records = query.order_by(Attendance.date.desc(), Attendance.id.desc()).all()
    return [_enrich(r) for r in records]


@router.post("", response_model=AttendanceOut, status_code=status.HTTP_201_CREATED)
def mark_attendance(payload: AttendanceCreate, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.id == payload.employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with id {payload.employee_id} not found.",
        )

    existing = (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == payload.employee_id,
            Attendance.date == payload.date,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Attendance for {employee.full_name} on {payload.date} is already marked.",
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
            detail="Attendance already marked for this employee on the given date.",
        )
    db.refresh(record)
    return _enrich(record)


@router.put("/{attendance_id}", response_model=AttendanceOut)
def update_attendance(attendance_id: int, payload: AttendanceCreate, db: Session = Depends(get_db)):
    record = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendance record not found.")
    record.status = payload.status
    db.commit()
    db.refresh(record)
    return _enrich(record)


@router.delete("/{attendance_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attendance(attendance_id: int, db: Session = Depends(get_db)):
    record = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendance record not found.")
    db.delete(record)
    db.commit()
