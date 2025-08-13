from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from ..models import User, File
from ..auth import get_current_user
from ..database import get_db

router = APIRouter(prefix="/me", tags=["me"])

@router.get("/storage")
def get_storage_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Sum file sizes for all files owned by the current user
    storage_used = db.query(
        func.coalesce(func.sum(File.file_size), 0)
    ).filter(File.owner_id == current_user.id).scalar()

    # Example: 1 GB storage limit
    storage_limit = .25 * 1024 * 1024 * 1024  # bytes

    return {
        "used": storage_used,
        "limit": storage_limit
    }
