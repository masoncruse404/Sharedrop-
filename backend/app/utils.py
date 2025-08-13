import os
import uuid
from typing import Optional
from fastapi import UploadFile
from .config import settings
import aiofiles

def generate_unique_filename(original_filename: str) -> str:
    """Generate a unique filename while preserving the extension."""
    name, ext = os.path.splitext(original_filename)
    unique_id = str(uuid.uuid4())[:8]
    return f"{unique_id}_{name}{ext}"

async def save_upload_file(upload_file: UploadFile, destination: str) -> int:
    """Save uploaded file and return file size."""
    size = 0
    async with aiofiles.open(destination, 'wb') as f:
        while chunk := await upload_file.read(1024):
            size += len(chunk)
            await f.write(chunk)
    return size

def is_allowed_file_type(content_type: str) -> bool:
    """Check if the file type is allowed."""
    # For now, we'll allow most common file types
    # You can customize this list based on your requirements
    allowed_types = {
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain', 'text/csv',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/zip', 'application/x-zip-compressed',
        'video/mp4', 'video/mpeg', 'video/quicktime',
        'audio/mpeg', 'audio/wav', 'audio/mp3'
    }
    return content_type in allowed_types

def format_file_size(size_bytes: int) -> str:
    """Convert bytes to human readable format."""
    if size_bytes == 0:
        return "0 B"
    size_names = ["B", "KB", "MB", "GB", "TB"]
    import math
    i = int(math.floor(math.log(size_bytes, 1024)))
    p = math.pow(1024, i)
    s = round(size_bytes / p, 2)
    return f"{s} {size_names[i]}"
