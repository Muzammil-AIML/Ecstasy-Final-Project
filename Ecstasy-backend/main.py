from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import schemas

from database import engine, get_db


models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Ecstasy Backend")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/")
def home():
    return {"message": "Ecstasy backend is running"}


# CREATE BOOKING
@app.post("/api/bookings", response_model=schemas.BookingResponse)
def create_booking(
    booking: schemas.BookingCreate,
    db: Session = Depends(get_db)
):

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
        raise HTTPException(
            status_code=500,
            detail="Failed to create booking"
        )


# GET ALL BOOKINGS
@app.get("/api/bookings", response_model=list[schemas.BookingResponse])
def get_bookings(db: Session = Depends(get_db)):

    try:
        bookings = db.query(models.Booking).all()
        return bookings

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch bookings"
        )
