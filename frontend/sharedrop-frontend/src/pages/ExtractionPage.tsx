import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FileSelector } from '../components/extraction/FileSelector';
import { ExtractionTypeSelector } from '../components/extraction/ExtractionTypeSelector';
import { MetadataViewer } from '../components/extraction/MetadataViewer';
import { HighlightsViewer } from '../components/extraction/HighlightsViewer';
import { Button } from '../components/ui/button';
import { extractionAPI } from '../lib/extractionAPI';

import ExcelJS from 'exceljs';


import { ExtractionInfo, ExtractionResponse, ExtractionType, ImageMetadata, HighlightsData } from '../types/extraction';
import {
  Search,
  ArrowRight,
  AlertCircle,
  Loader2,
  RefreshCw,
  X
} from 'lucide-react';

export const ExtractionPage = () => {
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [extractionInfo, setExtractionInfo] = useState<ExtractionInfo | null>(null);
  const [selectedType, setSelectedType] = useState<ExtractionType | null>(null);
  const [extractionResult, setExtractionResult] = useState<ExtractionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const extractionMutation = useMutation({
    mutationFn: ({ fileId, type }: { fileId: number; type: ExtractionType }) => {
      if (type === 'metadata') {
        return extractionAPI.extractMetadata(fileId);
      } else {
        return extractionAPI.extractHighlights(fileId);
      }
    },
    onSuccess: (data) => {
      setExtractionResult(data);
      setError(null);
    },
    onError: (error: any) => {
      setError(error.response?.data?.detail || 'Extraction failed. Please try again.');
      setExtractionResult(null);
    },
  });

  const handleFileSelect = (fileId: number, info: ExtractionInfo) => {
    setSelectedFileId(fileId);
    setExtractionInfo(info);
    setSelectedType(null);
    setExtractionResult(null);
    setError(null);
  };

  const handleTypeSelect = (type: ExtractionType) => {
    setSelectedType(type);
    setExtractionResult(null);
    setError(null);
  };

  const handleExtract = () => {
    if (selectedFileId && selectedType) {
      extractionMutation.mutate({ fileId: selectedFileId, type: selectedType });
    }
  };

// Export as JSON
const handleExportJSON = () => {
 
  if (extractionResult) {
    const dataStr = JSON.stringify(extractionResult.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `extraction-${extractionResult.extraction_type}-${extractionResult.file_id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// Export as CSV
const handleExportCSV = () => {
  if (extractionResult) {
    const data = extractionResult.data;

    const convertToCSV = (objArray: any) => {
      const array = Array.isArray(objArray) ? objArray : [objArray];
      if (array.length === 0) return '';

      const keys = Object.keys(array[0]);
      const header = keys.join(',');

      const rows = array.map(row =>
        keys.map(k => {
          let value = row[k];

          // Convert objects/arrays to JSON so we can see their contents
          if (typeof value === 'object' && value !== null) {
            value = JSON.stringify(value);
          }

          // Escape double quotes for CSV
          return `"${String(value ?? '').replace(/"/g, '""')}"`;
        }).join(',')
      );

      return [header, ...rows].join('\n');
    };

    const csvStr = convertToCSV(data);

    const dataBlob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `extraction-${extractionResult.extraction_type}-${extractionResult.file_id}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};


const handleExportExcelImage = async () => {
  if (!extractionResult) return;

  const {
    format,
    mode,
    size,
    file_size_bytes,
    has_transparency,
    extracted_at,
    filename,
    file_type
  } = extractionResult.data;

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Image Metadata Report');

  let currentRow = 1;

  // ---- IMAGE METADATA ----
  sheet.mergeCells(`A${currentRow}:B${currentRow}`);
  sheet.getCell(`A${currentRow}`).value = 'Image Metadata';
  sheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
  currentRow++;

  const metadataRows = [
    ['Format', format],
    ['Mode', mode],
    ['Width', `${size.width} pixels`],
    ['Height', `${size.height} pixels`],
    ['Dimensions', `${size.width} × ${size.height}`],
    ['File Size', `${(file_size_bytes / 1024).toFixed(2)} KB`],
    ['Has Transparency', has_transparency ? 'Yes' : 'No'],
    ['Extracted At', extracted_at],
    ['Filename', filename]
  ];

  sheet.addTable({
    name: 'ImageMetadataTable',
    ref: `A${currentRow}`,
    headerRow: true,
    style: { theme: 'TableStyleMedium5', showRowStripes: true },
    columns: [{ name: 'Field' }, { name: 'Value' }],
    rows: metadataRows
  });

  // Auto fit column widths
  sheet.columns.forEach(col => {
    let maxLength = 0;
    col.eachCell({ includeEmpty: true }, cell => {
      const cellValue = cell.value ? cell.value.toString() : '';
      maxLength = Math.max(maxLength, cellValue.length);
    });
    col.width = maxLength < 15 ? 15 : maxLength + 2;
  });

  // Export Excel
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `image-metadata-${extractionResult.file_id}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};


const handleExportExcelPdf = async () => {
  if (!extractionResult) return;

  const { text_stats, top_keywords, top_phrases, sample_highlights, extracted_at, filename, file_type, file_size_bytes } = extractionResult.data;

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Extraction Report');

  let currentRow = 1;

  // ---- TEXT STATS ----
  sheet.mergeCells(`A${currentRow}:B${currentRow}`);
  sheet.getCell(`A${currentRow}`).value = 'Text Statistics';
  sheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
  currentRow++;

  const textStatsData = Object.entries(text_stats).map(([key, value]) => [key, value]);
  sheet.addTable({
    name: 'TextStatsTable',
    ref: `A${currentRow}`,
    headerRow: true,
    style: { theme: 'TableStyleMedium9', showRowStripes: true },
    columns: [{ name: 'Metric' }, { name: 'Value' }],
    rows: textStatsData
  });
  currentRow += textStatsData.length + 2;

  // ---- TOP KEYWORDS ----
  sheet.mergeCells(`A${currentRow}:B${currentRow}`);
  sheet.getCell(`A${currentRow}`).value = 'Top Keywords';
  sheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
  currentRow++;

  const keywordRows = top_keywords.map(k => [k.word, k.frequency]);
  sheet.addTable({
    name: 'KeywordsTable',
    ref: `A${currentRow}`,
    headerRow: true,
    style: { theme: 'TableStyleMedium4', showRowStripes: true },
    columns: [{ name: 'Keyword' }, { name: 'Frequency' }],
    rows: keywordRows
  });
  currentRow += keywordRows.length + 2;

  // ---- TOP PHRASES ----
  sheet.mergeCells(`A${currentRow}:B${currentRow}`);
  sheet.getCell(`A${currentRow}`).value = 'Top Phrases';
  sheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
  currentRow++;

  const phraseRows = top_phrases.map(p => [p.phrase, p.frequency]);
  sheet.addTable({
    name: 'PhrasesTable',
    ref: `A${currentRow}`,
    headerRow: true,
    style: { theme: 'TableStyleMedium2', showRowStripes: true },
    columns: [{ name: 'Phrase' }, { name: 'Frequency' }],
    rows: phraseRows
  });
  currentRow += phraseRows.length + 2;

  // ---- SAMPLE HIGHLIGHTS ----
  sheet.mergeCells(`A${currentRow}:B${currentRow}`);
  sheet.getCell(`A${currentRow}`).value = 'Sample Highlights';
  sheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
  currentRow++;

  const highlightRows = sample_highlights.map(h => [h]);
  sheet.addTable({
    name: 'HighlightsTable',
    ref: `A${currentRow}`,
    headerRow: true,
    style: { theme: 'TableStyleLight9', showRowStripes: true },
    columns: [{ name: 'Highlight' }],
    rows: highlightRows
  });
  currentRow += highlightRows.length + 2;

  // ---- FILE METADATA ----
  sheet.mergeCells(`A${currentRow}:B${currentRow}`);
  sheet.getCell(`A${currentRow}`).value = 'File Metadata';
  sheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
  currentRow++;

  const metadata = [
    ['Filename', filename],
    ['File Type', file_type],
    ['File Size (bytes)', file_size_bytes],
    ['Extracted At', extracted_at]
  ];
  sheet.addTable({
    name: 'MetadataTable',
    ref: `A${currentRow}`,
    headerRow: true,
    style: { theme: 'TableStyleMedium5', showRowStripes: true },
    columns: [{ name: 'Field' }, { name: 'Value' }],
    rows: metadata
  });

  // Auto fit column widths
  sheet.columns.forEach(col => {
    let maxLength = 0;
    col.eachCell({ includeEmpty: true }, cell => {
      const cellValue = cell.value ? cell.value.toString() : '';
      maxLength = Math.max(maxLength, cellValue.length);
    });
    col.width = maxLength < 15 ? 15 : maxLength + 2;
  });

  // Export
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `extraction-${extractionResult.extraction_type}-${extractionResult.file_id}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

  const resetExtraction = () => {
    setSelectedFileId(null);
    setExtractionInfo(null);
    setSelectedType(null);
    setExtractionResult(null);
    setError(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">File Extraction</h1>
            <p className="text-lg text-gray-600">
              Extract metadata from images or analyze text content from documents
            </p>
          </div>

          <div className="flex items-center gap-3">
            {extractionResult && (
              <Button onClick={resetExtraction} variant="outline">
                <RefreshCw size={16} />
                Start Over
              </Button>
            )}
            <Link to="/dashboard">
              <Button variant="ghost" size="icon" aria-label="Back to Dashboard">
                <X size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {!extractionResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* File Selection */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Select File</h2>
            <FileSelector
              selectedFileId={selectedFileId}
              onFileSelect={handleFileSelect}
            />
          </div>

          {/* Extraction Type Selection */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Choose Extraction Type</h2>
            {extractionInfo ? (
              <div className="space-y-4">
                <ExtractionTypeSelector
                  selectedType={selectedType}
                  onTypeSelect={handleTypeSelect}
                  supportsMetadata={extractionInfo.supports_metadata_extraction}
                  supportsHighlights={extractionInfo.supports_highlight_extraction}
                />
                
                {selectedType && (
                  <div className="flex justify-center pt-4">
                    <Button
                      onClick={handleExtract}
                      disabled={extractionMutation.isPending}
                      className="w-full md:w-auto"
                    >
                      {extractionMutation.isPending ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Search size={16} />
                          Start Extraction
                          <ArrowRight size={16} />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                <Search size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a file first</h3>
                <p className="text-gray-600">
                  Choose a file from the list to see available extraction options
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Results */}
          {extractionResult.extraction_type === 'metadata' ? (
            <MetadataViewer
              data={extractionResult.data as ImageMetadata}
                onExportCSV={handleExportCSV}
                onExportJSON={handleExportJSON}
                onExportEXCEL={handleExportExcelImage}
            />
          ) : (
            <HighlightsViewer
              data={extractionResult.data as HighlightsData}
                onExportCSV={handleExportCSV}
                onExportJSON={handleExportJSON}
                onExportEXCEL={handleExportExcelPdf}
            />
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-red-800">Extraction Failed</h4>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      {!extractionResult && (
        <div className="mt-12 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How it works</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Image Metadata Extraction</h4>
              <p className="text-sm text-blue-700"> 
                Extract EXIF data, camera settings, image dimensions, and technical information from image files.
                Supported formats: JPG, PNG, GIF, BMP, WebP.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Text Analysis & Keywords</h4>
              <p className="text-sm text-blue-700">
                Analyze document content to extract key terms, phrases, and important text passages.
                Supported formats: PDF, DOCX, TXT.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
