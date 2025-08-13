import { ExtractionType } from '../../types/extraction';
import { Button } from '../ui/button';
import { Image, FileText, Search, Zap } from 'lucide-react';

interface ExtractionTypeSelectorProps {
  selectedType: ExtractionType | null;
  onTypeSelect: (type: ExtractionType) => void;
  supportsMetadata: boolean;
  supportsHighlights: boolean;
}

export const ExtractionTypeSelector = ({
  selectedType,
  onTypeSelect,
  supportsMetadata,
  supportsHighlights,
}: ExtractionTypeSelectorProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Choose Extraction Type</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Metadata Extraction */}
        <div
          className={`
            border-2 rounded-xl p-6 cursor-pointer transition-all
            ${
              selectedType === 'metadata'
                ? 'border-blue-500 bg-blue-50'
                : supportsMetadata
                ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
            }
          `}
          onClick={() => supportsMetadata && onTypeSelect('metadata')}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${
              selectedType === 'metadata' ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <Image size={24} className={`${
                selectedType === 'metadata' ? 'text-blue-600' : 'text-gray-600'
              }`} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Extract Image Metadata</h4>
              <p className="text-sm text-gray-600">For image files (JPG, PNG, GIF, etc.)</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-green-500" />
              <span>EXIF data and camera information</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-green-500" />
              <span>Image dimensions and format details</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-green-500" />
              <span>File properties and technical info</span>
            </div>
          </div>
          {!supportsMetadata && (
            <div className="mt-3 text-xs text-red-600">
              This file type does not support metadata extraction
            </div>
          )}
        </div>

        {/* Highlights Extraction */}
        <div
          className={`
            border-2 rounded-xl p-6 cursor-pointer transition-all
            ${
              selectedType === 'highlights'
                ? 'border-blue-500 bg-blue-50'
                : supportsHighlights
                ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
            }
          `}
          onClick={() => supportsHighlights && onTypeSelect('highlights')}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${
              selectedType === 'highlights' ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <FileText size={24} className={`${
                selectedType === 'highlights' ? 'text-blue-600' : 'text-gray-600'
              }`} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Extract Keywords & Highlights</h4>
              <p className="text-sm text-gray-600">For documents (PDF, DOCX, TXT)</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Search size={14} className="text-blue-500" />
              <span>Top keywords and phrases</span>
            </div>
            <div className="flex items-center gap-2">
              <Search size={14} className="text-blue-500" />
              <span>Important text passages</span>
            </div>
            <div className="flex items-center gap-2">
              <Search size={14} className="text-blue-500" />
              <span>Text statistics and analysis</span>
            </div>
          </div>
          {!supportsHighlights && (
            <div className="mt-3 text-xs text-red-600">
              This file type does not support text extraction
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
