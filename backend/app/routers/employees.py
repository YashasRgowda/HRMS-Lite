from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models import Employee, Attendance, AttendanceStatus
from app.schemas import EmployeeCreate, EmployeeOut, EmployeeWithStats

router = APIRouter(prefix="/employees", tags=["employees"])


@router.get("", response_model=List[EmployeeWithStats])
def list_employees(db: Session = Depends(get_db)):
    employees = db.query(Employee).order_by(Employee.created_at.desc()).all()
    result = []
    for emp in employees:
        total_present = sum(1 for a in emp.attendance if a.status == AttendanceStatus.present)
        total_absent = sum(1 for a in emp.attendance if a.status == AttendanceStatus.absent)
        result.append(
            EmployeeWithStats(
                **EmployeeOut.model_validate(emp).model_dump(),
                total_present=total_present,
                total_absent=total_absent,
            )
        )
    return result


@router.post("", response_model=EmployeeOut, status_code=status.HTTP_201_CREATED)
def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db)):
    existing = db.query(Employee).filter(
        (Employee.employee_id == payload.employee_id) | (Employee.email == payload.email)
    ).first()

    if existing:
        if existing.employee_id == payload.employee_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Employee ID '{payload.employee_id}' already exists.",
            )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Email '{payload.email}' is already registered.",
        )

    employee = Employee(**payload.model_dump())
    db.add(employee)
    try:
        db.commit()
        db.refresh(employee)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Duplicate employee ID or email.",
        )
    return employee


@router.get("/{employee_id}", response_model=EmployeeWithStats)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found.")
    total_present = sum(1 for a in emp.attendance if a.status == AttendanceStatus.present)
    total_absent = sum(1 for a in emp.attendance if a.status == AttendanceStatus.absent)
    return EmployeeWithStats(
        **EmployeeOut.model_validate(emp).model_dump(),
        total_present=total_present,
        total_absent=total_absent,
    )


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found.")
    db.delete(emp)
    db.commit()
