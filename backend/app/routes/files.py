import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File as FastAPIFile, Form
from fastapi.responses import FileResponse as StreamingFileResponse
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, File
from ..schemas import FileResponse, FileList, ShareLinkResponse, FileUploadResponse, ErrorResponse
from ..auth import get_current_user
from ..config import settings
from ..utils import generate_unique_filename, save_upload_file, is_allowed_file_type, format_file_size

router = APIRouter(prefix="/files", tags=["files"])

@router.post("/upload", response_model=FileUploadResponse)
async def upload_file(
    file: UploadFile = FastAPIFile(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate file type
    if not is_allowed_file_type(file.content_type):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {file.content_type} is not allowed"
        )
    
    unique_filename = generate_unique_filename(file.filename)
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    try:
        file_size = await save_upload_file(file, file_path)
        
        if file_size > settings.MAX_FILE_SIZE:
            os.remove(file_path)
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum size is {format_file_size(settings.MAX_FILE_SIZE)}"
            )
        
        db_file = File(
            filename=unique_filename,
            original_filename=file.filename,
            file_path=file_path,
            file_size=file_size,
            content_type=file.content_type,
            owner_id=current_user.id
        )
        db.add(db_file)
        db.commit()
        db.refresh(db_file)
        
        return FileUploadResponse(
            message="File uploaded successfully",
            file=FileResponse.from_orm(db_file)
        )
        
    except Exception:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload file"
        )

@router.get("/", response_model=FileList)
def list_files(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    files = db.query(File).filter(File.owner_id == current_user.id).offset(skip).limit(limit).all()
    total = db.query(File).filter(File.owner_id == current_user.id).count()
    
    return FileList(
        files=[FileResponse.from_orm(file) for file in files],
        total=total
    )

@router.get("/{file_id}", response_model=FileResponse)
def get_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file = db.query(File).filter(
        File.id == file_id,
        File.owner_id == current_user.id
    ).first()
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    return FileResponse.from_orm(file)

@router.get("/{file_id}/download")
def download_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file = db.query(File).filter(
        File.id == file_id,
        File.owner_id == current_user.id
    ).first()
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    if not os.path.exists(file.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on disk"
        )
    
    return StreamingFileResponse(
        path=file.file_path,
        filename=file.original_filename,
        media_type=file.content_type
    )

@router.post("/{file_id}/share", response_model=ShareLinkResponse)
def create_share_link(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file = db.query(File).filter(
        File.id == file_id,
        File.owner_id == current_user.id
    ).first()
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    if not file.share_token:
        file.generate_share_token()
        db.commit()
        db.refresh(file)
    
    share_url = f"/api/shared/{file.share_token}"
    
    return ShareLinkResponse(
        share_url=share_url,
        share_token=file.share_token
    )

@router.delete("/{file_id}")
def delete_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file = db.query(File).filter(
        File.id == file_id,
        File.owner_id == current_user.id
    ).first()
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    if os.path.exists(file.file_path):
        os.remove(file.file_path)
    
    db.delete(file)
    db.commit()
    
    return {"message": "File deleted successfully"}

@router.put("/{file_id}/rename")
def rename_file(
    file_id: int,
    new_name: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file = db.query(File).filter(
        File.id == file_id,
        File.owner_id == current_user.id
    ).first()
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    file.original_filename = new_name
    db.commit()
    db.refresh(file)
    
    return {"message": "File renamed successfully", "file": FileResponse.from_orm(file)}

@router.get("/shared/{share_token}")
def download_shared_file(
    share_token: str,
    db: Session = Depends(get_db)
):
    file = db.query(File).filter(File.share_token == share_token).first()
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shared file not found"
        )
    
    if not os.path.exists(file.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on disk"
        )
    
    return StreamingFileResponse(
        path=file.file_path,
        filename=file.original_filename,
        media_type=file.content_type
    )
