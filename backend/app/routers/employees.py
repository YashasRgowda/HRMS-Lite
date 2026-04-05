from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models import Employee, AttendanceStatus
from app.schemas import EmployeeCreate, EmployeeOut, EmployeeWithStats, MessageResponse

router = APIRouter(prefix="/employees", tags=["Employees"])


@router.get(
    "",
    response_model=List[EmployeeWithStats],
    summary="List All Employees",
    description="""
Returns a list of all registered employees, sorted by most recently added.

Each employee in the response includes:

- `id` — Database primary key (integer). Use this in URL paths.
- `employee_id` — HR code assigned by admin (e.g. `EMP001`). Display only.
- `full_name`, `email`, `department` — Basic employee details.
- `total_present` — Total days marked **Present** across all time.
- `total_absent` — Total days marked **Absent** across all time.
""",
    response_description="Array of employee objects with attendance statistics.",
)
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


@router.post(
    "",
    response_model=EmployeeOut,
    status_code=status.HTTP_201_CREATED,
    summary="Register a New Employee",
    description="""
Creates a new employee record in the system.

**Required fields:**

- `employee_id` — A unique HR code you assign (e.g. `EMP001`). Must not already exist.
- `full_name` — Full name of the employee.
- `email` — Work email address. Must be unique across all employees.
- `department` — Department the employee belongs to (e.g. `Engineering`, `HR`).

**On success:** Returns the created record with its auto-generated integer `id`.

**Errors:**
- `409` — If the HR code or email is already registered to another employee.
- `422` — If any required field is missing or invalid.
""",
    response_description="The newly created employee record with auto-generated `id`.",
)
def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db)):
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


@router.get(
    "/{id}",
    response_model=EmployeeWithStats,
    summary="Get a Single Employee",
    description="""
Fetches a single employee record by their database `id`.

**Path parameter:**

- `id` — The integer primary key of the employee (e.g. `1`, `2`, `3`).
  Get this from the `id` field in the **GET /employees** response.

> **Note:** This is NOT the HR code string like `EMP001`.
> Always use the integer `id` in the URL path.

**Errors:**
- `404` — If no employee exists with the given `id`.
""",
    response_description="The employee record with total present and absent day counts.",
)
def get_employee(id: int, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == id).first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No employee found with id={id}.")
    total_present = sum(1 for a in emp.attendance if a.status == AttendanceStatus.present)
    total_absent = sum(1 for a in emp.attendance if a.status == AttendanceStatus.absent)
    return EmployeeWithStats(
        **EmployeeOut.model_validate(emp).model_dump(),
        total_present=total_present,
        total_absent=total_absent,
    )


@router.delete(
    "/{id}",
    status_code=status.HTTP_200_OK,
    response_model=MessageResponse,
    summary="Delete an Employee",
    description="""
Permanently deletes an employee record by their database `id`.

**Path parameter:**

- `id` — The integer primary key of the employee to delete.

**Important:**

- All attendance records belonging to this employee are **also deleted automatically** (cascade delete).
- This action is **irreversible**. There is no undo.

**Errors:**
- `404` — If no employee exists with the given `id`.
""",
    response_description="Confirmation message with the name and HR code of the deleted employee.",
)
def delete_employee(id: int, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == id).first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No employee found with id={id}.")
    name = emp.full_name
    emp_code = emp.employee_id
    db.delete(emp)
    db.commit()
    return MessageResponse(
        success=True,
        message=f"Employee '{name}' ({emp_code}) and all their attendance records have been deleted.",
    )
