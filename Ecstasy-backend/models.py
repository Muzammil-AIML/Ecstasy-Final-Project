from sqlalchemy import Column, Integer, String, Text, DateTime
from database import Base
from datetime import datetime


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)

    eventType = Column(String, nullable=False)

    eventDate = Column(String, nullable=False)

    guestCount = Column(Integer, nullable=True)

    budgetRange = Column(String, nullable=False)

    vision = Column(Text, nullable=True)

    createdAt = Column(DateTime, default=datetime.utcnow)