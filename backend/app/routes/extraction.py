import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, File
from ..schemas import ExtractionResponse
from ..auth import get_current_user
from ..extraction import (
    extract_image_metadata,
    extract_highlights_from_file,
    is_image_file
)

router = APIRouter(prefix="/files", tags=["extraction"])


@router.post("/{file_id}/extract/metadata", response_model=ExtractionResponse)
def extract_file_metadata(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Extract metadata from image files only."""
    file = db.query(File).filter(
        File.id == file_id,
        File.owner_id == current_user.id
    ).first()

    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    if not os.path.exists(file.file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")

    if not is_image_file(file.file_path):
        raise HTTPException(
            status_code=400,
            detail="Only image files are supported for metadata extraction."
        )

    try:
        metadata = extract_image_metadata(file.file_path)
        return ExtractionResponse(
            extraction_type="metadata",
            file_id=file_id,
            data=metadata
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to extract metadata")


@router.post("/{file_id}/extract/highlights", response_model=ExtractionResponse)
def extract_file_highlights(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Extract highlights from PDF files only."""
    file = db.query(File).filter(
        File.id == file_id,
        File.owner_id == current_user.id
    ).first()

    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    if not os.path.exists(file.file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")

    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported for highlight extraction."
        )

    try:
        highlights_data = extract_highlights_from_file(file.file_path)
        return ExtractionResponse(
            extraction_type="highlights",
            file_id=file_id,
            data=highlights_data
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to extract highlights")


@router.get("/{file_id}/extraction-info")
def get_file_extraction_info(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Return which extractions are supported for the given file."""
    file = db.query(File).filter(
        File.id == file_id,
        File.owner_id == current_user.id
    ).first()

    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    if not os.path.exists(file.file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")

    supports_metadata = is_image_file(file.file_path)
    supports_highlights = file.content_type == "application/pdf"

    return {
        "file_id": file_id,
        "filename": file.original_filename,
        "content_type": file.content_type,
        "supports_metadata_extraction": supports_metadata,
        "supports_highlight_extraction": supports_highlights,
        "supported_extraction_types": [
            "metadata" if supports_metadata else None,
            "highlights" if supports_highlights else None
        ]
    }
