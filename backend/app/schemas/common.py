from pydantic import BaseModel, Field


class MessageResponse(BaseModel):
    """Generic success response returned for destructive operations (delete)."""

    success: bool = Field(description="Whether the operation was successful.")
    message: str = Field(description="Human-readable confirmation message.")
