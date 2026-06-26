from pydantic import BaseModel, EmailStr
from typing import Optional


# ── Booking ────────────────────────────────────────────────────────────────────
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


# ── Auth ───────────────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    username: str
    email: EmailStr
    password: str
    confirm_password: str


class LoginRequest(BaseModel):
    identifier: str
    password: str

class AuthResponse(BaseModel):
    message: str
    username: Optional[str] = None
    email: Optional[str] = None