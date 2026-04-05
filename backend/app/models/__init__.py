# Import all models here so SQLAlchemy registers them with Base
# before create_all() is called at startup.
from app.models.attendance import Attendance, AttendanceStatus
from app.models.employee import Employee

__all__ = ["Employee", "AttendanceStatus", "Attendance"]
