export interface ExtractionInfo {
  file_id: number;
  filename: string;
  content_type: string;
  supports_metadata_extraction: boolean;
  supports_highlight_extraction: boolean;
  supported_extraction_types: string[];
}

export interface ImageMetadata {
  filename: string;
  format: string;
  mode: string;
  size: {
    width: number;
    height: number;
  };
  has_transparency: boolean;
  file_size_bytes: number;
  extracted_at: string;
  exif: Record<string, any>;
  info: Record<string, any>;
}

export interface TextStats {
  total_characters: number;
  total_words: number;
  total_sentences: number;
  unique_words: number;
}

export interface Keyword {
  word: string;
  frequency: number;
}

export interface Phrase {
  phrase: string;
  frequency: number;
}

export interface HighlightsData {
  filename: string;
  file_type: string;
  file_size_bytes: number;
  extracted_at: string;
  text_stats: TextStats;
  top_keywords: Keyword[];
  top_phrases: Phrase[];
  sample_highlights: string[];
}

export interface ExtractionResponse {
  extraction_type: 'metadata' | 'highlights';
  file_id: number;
  data: ImageMetadata | HighlightsData;
}

export type ExtractionType = 'metadata' | 'highlights';
