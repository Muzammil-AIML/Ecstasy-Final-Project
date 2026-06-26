from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import resend
import os
from sqlalchemy import or_
import models
import schemas

from database import engine, get_db

# Create tables
models.Base.metadata.create_all(bind=engine)

# FastAPI app
app = FastAPI(title="Ecstasy Backend")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password hashing
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

# Environment variables
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
FROM_EMAIL = os.getenv(
    "FROM_EMAIL",
    "onboarding@resend.dev"
)

resend.api_key = RESEND_API_KEY


# ------------------------------------------------------------------
# Email Helper
# ------------------------------------------------------------------
def send_welcome_email(to_email: str, name: str):
    try:
        resend.Emails.send({
            "from": FROM_EMAIL,
            "to": [to_email],
            "subject": "Welcome to Ecstasy 🎉",
            "html": f"""
            <div style="font-family:Arial,sans-serif;background:#050505;color:#fff;padding:40px;border-radius:12px;max-width:560px;margin:0 auto;">
              <h1 style="color:#ff4141;">ECSTASY</h1>
              <h2>Welcome {name} 🔥</h2>
              <p>Thank you for joining Ecstasy. We are excited to have you with us.</p>
              <a href="http://localhost:5173" style="display:inline-block;background:#ff3030;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">
                Visit Ecstasy
              </a>
              <p style="margin-top:30px;">© ECSTASY Event Production</p>
            </div>
            """
        })
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")


# ------------------------------------------------------------------
# Root
# ------------------------------------------------------------------
@app.get("/")
def home():
    return {"message": "Ecstasy backend is running"}


# ------------------------------------------------------------------
# Register
# ------------------------------------------------------------------
@app.post("/api/auth/register", response_model=schemas.AuthResponse)
def register(data: schemas.RegisterRequest, db: Session = Depends(get_db)):

    if data.password != data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    existing_user = db.query(models.Credential).filter(
        models.Credential.username == data.username
    ).first()

    if existing_user:
        raise HTTPException(status_code=409, detail="Username already taken")

    existing_email = db.query(models.Credential).filter(
        models.Credential.email == data.email
    ).first()

    if existing_email:
        raise HTTPException(status_code=409, detail="Email already registered")

    hashed_password = pwd_context.hash(data.password)

    user = models.Credential(
        name=data.name,
        username=data.username,
        email=data.email,
        hashed_password=hashed_password
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    send_welcome_email(user.email, user.name)

    return schemas.AuthResponse(
        message="Registered successfully",
        username=user.username,
        email=user.email
    )


# ------------------------------------------------------------------
# Login
# ------------------------------------------------------------------
@app.post("/api/auth/login", response_model=schemas.AuthResponse)
def login(data: schemas.LoginRequest, db: Session = Depends(get_db)):

    user = db.query(models.Credential).filter(
        or_(
            models.Credential.username == data.identifier,
            models.Credential.email == data.identifier
        )
    ).first()

    if not user or not user.hashed_password:
        raise HTTPException(status_code=401, detail="Invalid username/email or password")

    if not pwd_context.verify(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username/email or password")

    return schemas.AuthResponse(
        message="Login successful",
        username=user.username,
        email=user.email
    )


# ------------------------------------------------------------------
# Create Booking
# ------------------------------------------------------------------
@app.post("/api/bookings", response_model=schemas.BookingResponse)
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(get_db)):
    try:
        new_booking = models.Booking(
            eventType=booking.eventType,
            eventDate=booking.eventDate,
            guestCount=booking.guestCount,
            budgetRange=booking.budgetRange,
            vision=booking.vision
        )
        db.add(new_booking)
        db.commit()
        db.refresh(new_booking)
        return new_booking
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create booking")


# ------------------------------------------------------------------
# Get Bookings
# ------------------------------------------------------------------
@app.get("/api/bookings", response_model=list[schemas.BookingResponse])
def get_bookings(db: Session = Depends(get_db)):
    try:
        return db.query(models.Booking).all()
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch bookings")