from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime
from database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    eventType = Column(String, nullable=False)
    eventDate = Column(String, nullable=False)
    guestCount = Column(Integer, nullable=True)
    budgetRange = Column(String, nullable=False)
    vision = Column(Text, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)


class Credential(Base):
    __tablename__ = "credentials"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow)