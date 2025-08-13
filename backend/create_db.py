#!/usr/bin/env python3
"""
Database initialization script.
Run this to create the database tables.
"""

from app.database import engine
from app.models import Base
import os

def create_database():
    """Create all database tables."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")
    
    # Create uploads directory
    upload_dir = "./uploads"
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
        print(f"Created uploads directory: {upload_dir}")
    else:
        print(f"Uploads directory already exists: {upload_dir}")

if __name__ == "__main__":
    create_database()
