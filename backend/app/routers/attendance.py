from datetime import date as date_type
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models import Attendance, Employee
from app.schemas import AttendanceCreate, AttendanceOut, AttendanceStatusUpdate, MessageResponse

router = APIRouter(prefix="/attendance", tags=["Attendance"])


def _enrich(record: Attendance) -> AttendanceOut:
    """Attach employee name and HR code to an attendance record."""
    out = AttendanceOut.model_validate(record)
    if record.employee:
        out.employee_name = record.employee.full_name
        out.employee_code = record.employee.employee_id
    return out


@router.get(
    "",
    response_model=List[AttendanceOut],
    summary="List Attendance Records",
    description="""
Returns all attendance records, sorted by most recent date first.

**Optional filters (query parameters):**

- `employee_id` — Filter records for a specific employee.
  Pass their integer database `id` (e.g. `1`, `2`).
  Get this from the `id` field in **GET /employees**.

- `date` — Filter records for a specific date.
  Format: `YYYY-MM-DD` (e.g. `2026-04-05`).

Both filters can be combined to narrow results further.

> **Important:** The `employee_id` filter takes the integer `id`, not the HR code string like `EMP001`.
""",
    response_description="Array of attendance records with employee name and HR code included.",
)
def list_attendance(
    employee_id: Optional[int] = Query(
        None,
        description="Integer database `id` of the employee (from GET /employees). Example: `1`.",
    ),
    date: Optional[date_type] = Query(
        None,
        description="Filter by date in `YYYY-MM-DD` format. Example: `2026-04-05`.",
    ),
    db: Session = Depends(get_db),
):
    query = db.query(Attendance)
    if employee_id is not None:
        query = query.filter(Attendance.employee_id == employee_id)
    if date is not None:
        query = query.filter(Attendance.date == date)
    records = query.order_by(Attendance.date.desc(), Attendance.id.desc()).all()
    return [_enrich(r) for r in records]


@router.post(
    "",
    response_model=AttendanceOut,
    status_code=status.HTTP_201_CREATED,
    summary="Mark Attendance",
    description="""
Marks attendance for an employee on a given date.

**Required fields:**

- `employee_id` — Integer database `id` of the employee (e.g. `1`, `2`).
  Get this from the `id` field in **GET /employees**.
  This is **not** the HR code string like `EMP001`.

- `date` — Date of attendance in `YYYY-MM-DD` format (e.g. `2026-04-05`).

- `status` — Attendance status. Allowed values: `present` or `absent`.

**Rules:**

- Only **one record per employee per day** is allowed.
- Submitting a duplicate (same employee + same date) returns a `409` error.
- To correct an already-marked record, use **PUT /attendance/{id}**.

**Errors:**
- `404` — Employee not found.
- `409` — Attendance already marked for this employee on the given date.
- `422` — Missing or invalid fields in the request body.
""",
    response_description="The newly created attendance record with employee name and HR code.",
)
def mark_attendance(payload: AttendanceCreate, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.id == payload.employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No employee found with id={payload.employee_id}. Use the integer `id` from GET /employees.",
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
            detail=(
                f"Attendance for '{employee.full_name}' ({employee.employee_id}) "
                f"on {payload.date} is already marked as '{existing.status.value}'. "
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


@router.put(
    "/{id}",
    response_model=AttendanceOut,
    summary="Update an Attendance Record",
    description="""
Updates the status of an existing attendance record.

**Path parameter:**

- `id` — The integer database `id` of the attendance record to update.
  Get this from the `id` field in **GET /attendance**.

**Request body:**

- `status` — The new status. Allowed values: `present` or `absent`.

**Errors:**
- `404` — If no attendance record exists with the given `id`.
""",
    response_description="The updated attendance record.",
)
def update_attendance(id: int, payload: AttendanceStatusUpdate, db: Session = Depends(get_db)):
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


@router.delete(
    "/{id}",
    status_code=status.HTTP_200_OK,
    response_model=MessageResponse,
    summary="Delete an Attendance Record",
    description="""
Permanently deletes a single attendance record by its database `id`.

**Path parameter:**

- `id` — The integer `id` of the attendance record (from **GET /attendance**).

**Note:**

- This deletes only this specific attendance entry.
- The employee record itself is **not affected**.

**Errors:**
- `404` — If no attendance record exists with the given `id`.
""",
    response_description="Confirmation message with the deleted record's `id`.",
)
def delete_attendance(id: int, db: Session = Depends(get_db)):
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
