# Import all models here so SQLAlchemy registers them with Base
# before create_all() is called at startup.
from app.models.employee import Employee
from app.models.attendance import AttendanceStatus, Attendance

__all__ = ["Employee", "AttendanceStatus", "Attendance"]
