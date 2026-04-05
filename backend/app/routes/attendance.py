from datetime import date as DateType
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.attendance import AttendanceCreate, AttendanceStatusUpdate, AttendanceOut
from app.schemas.common import MessageResponse
from app.services import attendance_service

router = APIRouter(prefix="/attendance", tags=["Attendance"])


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
  Format: `YYYY-MM-DD` (e.g. `2026-04-06`).

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
    date: Optional[DateType] = Query(
        None,
        description="Filter by date in `YYYY-MM-DD` format. Example: `2026-04-06`.",
    ),
    db: Session = Depends(get_db),
):
    return attendance_service.list_attendance(db, employee_id, date)


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

- `date` — Date of attendance in `YYYY-MM-DD` format (e.g. `2026-04-06`).

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
    return attendance_service.mark_attendance(db, payload)


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
    return attendance_service.update_attendance(db, id, payload)


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
    return attendance_service.delete_attendance(db, id)
