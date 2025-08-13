from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from enum import Enum



# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# File schemas
class FileBase(BaseModel):
    filename: str
    original_filename: str
    file_size: int
    content_type: Optional[str] = None

class FileCreate(FileBase):
    file_path: str

class FileResponse(FileBase):
    id: int
    uploaded_at: datetime
    share_token: Optional[str] = None
    
    class Config:
        from_attributes = True

class FileList(BaseModel):
    files: List[FileResponse]
    total: int

class ShareLinkResponse(BaseModel):
    share_url: str
    share_token: str

class FileUploadResponse(BaseModel):
    message: str
    file: FileResponse

class ErrorResponse(BaseModel):
    detail: str

# Extraction schemas
class ExtractionTypeEnum(str, Enum):
    metadata = "metadata"
    highlights = "highlights"

class ImageMetadataResponse(BaseModel):
    filename: str
    format: str
    mode: str
    size: dict
    has_transparency: bool
    file_size_bytes: int
    extracted_at: str
    exif: dict
    info: dict

class TextStatsResponse(BaseModel):
    total_characters: int
    total_words: int
    total_sentences: int
    unique_words: int

class KeywordResponse(BaseModel):
    word: str
    frequency: int

class PhraseResponse(BaseModel):
    phrase: str
    frequency: int

class HighlightsResponse(BaseModel):
    filename: str
    file_type: str
    file_size_bytes: int
    extracted_at: str
    text_stats: TextStatsResponse
    top_keywords: List[KeywordResponse]
    top_phrases: List[PhraseResponse]
    sample_highlights: List[str]

class ExtractionResponse(BaseModel):
    extraction_type: str
    file_id: int
    data: dict

# Storage

class StorageUsage(BaseModel):
    used: int
    limit: int

    class Config:
        orm_mode = True
