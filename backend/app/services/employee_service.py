from typing import List

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.attendance import AttendanceStatus
from app.models.employee import Employee
from app.schemas.common import MessageResponse
from app.schemas.employee import EmployeeCreate, EmployeeOut, EmployeeWithStats


def list_employees(db: Session) -> List[EmployeeWithStats]:
    """Return all employees enriched with their attendance totals."""
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


def create_employee(db: Session, payload: EmployeeCreate) -> Employee:
    """Register a new employee. Raises 409 on duplicate HR code or email."""
    existing = db.query(Employee).filter(
        (Employee.employee_id == payload.employee_id) | (Employee.email == payload.email)
    ).first()

    if existing:
        if existing.employee_id == payload.employee_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"HR code '{payload.employee_id}' is already assigned to another employee.",
            )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Email '{payload.email}' is already registered to another employee.",
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
            detail="An employee with this HR code or email already exists.",
        )
    return employee


def get_employee(db: Session, id: int) -> EmployeeWithStats:
    """Fetch a single employee by primary key. Raises 404 if not found."""
    emp = db.query(Employee).filter(Employee.id == id).first()
    if not emp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No employee found with id={id}.",
        )
    total_present = sum(1 for a in emp.attendance if a.status == AttendanceStatus.present)
    total_absent = sum(1 for a in emp.attendance if a.status == AttendanceStatus.absent)
    return EmployeeWithStats(
        **EmployeeOut.model_validate(emp).model_dump(),
        total_present=total_present,
        total_absent=total_absent,
    )


def delete_employee(db: Session, id: int) -> MessageResponse:
    """Delete an employee and all their attendance records. Raises 404 if not found."""
    emp = db.query(Employee).filter(Employee.id == id).first()
    if not emp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No employee found with id={id}.",
        )
    name, emp_code = emp.full_name, emp.employee_id
    db.delete(emp)
    db.commit()
    return MessageResponse(
        success=True,
        message=f"Employee '{name}' ({emp_code}) and all their attendance records have been deleted.",
    )
