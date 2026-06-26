from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ── Development Helper ────────────────────────────────────────────────────────
def reset_database():
    """
    Drops all existing tables and recreates them cleanly.
    Use this to instantly refresh your database schema!
    """
    print("🔄 Dropping existing tables...")
    Base.metadata.drop_all(bind=engine)
    print("🚀 Recreating fresh tables with new columns...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database successfully refreshed!")