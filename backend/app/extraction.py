import os
import magic
from typing import Dict, Any, List
from PIL import Image
from PIL.ExifTags import TAGS
from PyPDF2 import PdfReader
import re
from datetime import datetime
from .pdf_extractor import PDFHighlightExtractor


def get_file_type(file_path: str) -> str:
    """Get the MIME type of a file (only supports image/* and application/pdf)."""
    try:
        mime = magic.Magic(mime=True)
        return mime.from_file(file_path)
    except Exception:
        ext = os.path.splitext(file_path)[1].lower()
        ext_to_mime = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.bmp': 'image/bmp',
            '.webp': 'image/webp',
            '.pdf': 'application/pdf'
        }
        return ext_to_mime.get(ext, 'application/octet-stream')


def extract_image_metadata(file_path: str) -> Dict[str, Any]:
    """Extract metadata from image files."""
    try:
        with Image.open(file_path) as image:
            metadata = {
                'filename': os.path.basename(file_path),
                'format': image.format,
                'mode': image.mode,
                'size': {
                    'width': image.width,
                    'height': image.height
                },
                'has_transparency': image.mode in ('RGBA', 'LA') or 'transparency' in image.info,
                'file_size_bytes': os.path.getsize(file_path),
                'extracted_at': datetime.utcnow().isoformat() + 'Z'
            }
            exif_data = {}
            if hasattr(image, '_getexif') and image._getexif() is not None:
                for tag_id, value in image._getexif().items():
                    tag = TAGS.get(tag_id, tag_id)
                    if isinstance(value, (bytes, tuple)):
                        value = str(value)
                    exif_data[tag] = value
            metadata['exif'] = exif_data
            info = {k: (v if isinstance(v, (str, int, float, bool)) else str(v))
                    for k, v in image.info.items()}
            metadata['info'] = info
            return metadata
    except Exception as e:
        raise ValueError(f"Failed to extract image metadata: {str(e)}")


def extract_text_from_pdf(file_path: str) -> str:
    """Extract plain text from a PDF file."""
    try:
        text = ""
        with open(file_path, 'rb') as file:
            pdf_reader = PdfReader(file)
            for page in pdf_reader.pages:
                try:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                except Exception:
                    continue
        return text.strip()
    except Exception as e:
        raise ValueError(f"Failed to extract text from PDF: {str(e)}")


def extract_keywords_and_highlights(
    text: str,
    sample_highlights: List[str] = None,
    min_word_length: int = 4
) -> Dict[str, Any]:
    """Extract top keywords, phrases, and text statistics."""
    cleaned_text = re.sub(r'\s+', ' ', text.strip())
    words = re.findall(r'\b\w+\b', cleaned_text.lower())
    filtered_words = [word for word in words if len(word) >= min_word_length]

    word_freq = {}
    for word in filtered_words:
        word_freq[word] = word_freq.get(word, 0) + 1
    top_keywords = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:20]

    sentences = re.split(r'[.!?]+', cleaned_text)

    phrases = []
    words_list = cleaned_text.split()
    for i in range(len(words_list) - 1):
        phrase = f"{words_list[i]} {words_list[i+1]}"
        if len(phrase) > 8:
            phrases.append(phrase)
    phrase_freq = {}
    for phrase in phrases:
        phrase_freq[phrase] = phrase_freq.get(phrase, 0) + 1
    top_phrases = sorted(phrase_freq.items(), key=lambda x: x[1], reverse=True)[:10]

    return {
        'text_stats': {
            'total_characters': len(text),
            'total_words': len(words),
            'total_sentences': len(sentences),
            'unique_words': len(word_freq)
        },
        'top_keywords': [{'word': word, 'frequency': freq} for word, freq in top_keywords],
        'top_phrases': [{'phrase': phrase, 'frequency': freq} for phrase, freq in top_phrases],
        'sample_highlights': sample_highlights or [],
        'extracted_at': datetime.utcnow().isoformat() + 'Z'
    }


def extract_highlights_from_file(file_path: str) -> Dict[str, Any]:
    """Extract highlights and keywords from PDF, or metadata from images."""
    file_type = get_file_type(file_path)

    if file_type.startswith('image/'):
        return extract_image_metadata(file_path)

    elif file_type == 'application/pdf':
        text = extract_text_from_pdf(file_path)
        sample_highlights = []
        try:
            extractor = PDFHighlightExtractor(file_path)
            formatted_text = extractor.extract_and_format(output_path="output.md", output_format="markdown")
            if isinstance(formatted_text, str):
                sample_highlights = [line.strip() for line in formatted_text.splitlines() if line.strip()]
            elif isinstance(formatted_text, list):
                sample_highlights = [str(item) for item in formatted_text]
            else:
                sample_highlights = [str(formatted_text)]
        except Exception:
            pass

        result = extract_keywords_and_highlights(text, sample_highlights)
        result['filename'] = os.path.basename(file_path)
        result['file_type'] = file_type
        result['file_size_bytes'] = os.path.getsize(file_path)
        return result

    else:
        raise ValueError(f"Unsupported file type: {file_type}")


def is_image_file(file_path: str) -> bool:
    return get_file_type(file_path).startswith('image/')


def is_pdf_file(file_path: str) -> bool:
    return get_file_type(file_path) == 'application/pdf'
