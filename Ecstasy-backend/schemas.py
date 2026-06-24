from pydantic import BaseModel
from typing import Optional


class BookingCreate(BaseModel):
    eventType: str
    eventDate: str
    guestCount: Optional[int] = None
    budgetRange: str
    vision: Optional[str] = None


class BookingResponse(BaseModel):
    id: int
    eventType: str
    eventDate: str
    guestCount: Optional[int]
    budgetRange: str
    vision: Optional[str]

    class Config:
        from_attributes = True