import { useState } from 'react';
import { ImageMetadata } from '../../types/extraction';
import { Button } from '../ui/button';
import { formatFileSize, formatDate } from '../../lib/utils';
import {
  Download,
  Image as ImageIcon,
  Info,
  Camera,
  ChevronDown,
  ChevronRight,
  Copy,
  Check
} from 'lucide-react';

interface MetadataViewerProps {
  data: ImageMetadata;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onExportEXCEL: () => void;
}

export const MetadataViewer = ({ data, onExportCSV, onExportJSON, onExportEXCEL }: MetadataViewerProps) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    exif: false,
    technical: false
  });
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const renderField = (label: string, value: any, fieldKey: string) => (
    <div key={fieldKey} className="flex items-start justify-between py-2 border-b border-gray-100 last:border-b-0">
      <div className="flex-1 min-w-0">
        <dt className="text-sm font-medium text-gray-700">{label}</dt>
        <dd className="text-sm text-gray-900 break-words">{formatValue(value)}</dd>
      </div>
      <button
        onClick={() => copyToClipboard(formatValue(value), fieldKey)}
        className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
      >
        {copiedField === fieldKey ? (
          <Check size={14} className="text-green-500" />
        ) : (
          <Copy size={14} className="text-gray-400" />
        )}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ImageIcon size={24} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Image Metadata</h3>
            <p className="text-sm text-gray-600">{data.filename}</p>
          </div>
        </div>
        <Button onClick={onExportJSON} variant="outline">
          <Download size={16} />
          Export JSON
        </Button>
        <Button onClick={onExportCSV} variant="outline">
          <Download size={16} />
          Export CSV
        </Button>

           <Button onClick={onExportEXCEL} variant="outline">
          <Download size={16} />
          Export EXCEL
        </Button>

        
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-xl border border-gray-200">
        <button
          onClick={() => toggleSection('basic')}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Info size={18} className="text-blue-600" />
            <h4 className="font-semibold text-gray-900">Basic Information</h4>
          </div>
          {expandedSections.basic ? (
            <ChevronDown size={18} className="text-gray-400" />
          ) : (
            <ChevronRight size={18} className="text-gray-400" />
          )}
        </button>
        
        {expandedSections.basic && (
          <div className="px-4 pb-4">
            <dl className="space-y-1">
              {renderField('Format', data.format, 'format')}
              {renderField('Mode', data.mode, 'mode')}
              {renderField('Width', `${data.size.width} pixels`, 'width')}
              {renderField('Height', `${data.size.height} pixels`, 'height')}
              {renderField('Dimensions', `${data.size.width} × ${data.size.height}`, 'dimensions')}
              {renderField('File Size', formatFileSize(data.file_size_bytes), 'fileSize')}
              {renderField('Has Transparency', data.has_transparency ? 'Yes' : 'No', 'transparency')}
              {renderField('Extracted At', formatDate(data.extracted_at), 'extractedAt')}
            </dl>
          </div>
        )}
      </div>

      {/* EXIF Data */}
      {Object.keys(data.exif).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200">
          <button
            onClick={() => toggleSection('exif')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Camera size={18} className="text-green-600" />
              <h4 className="font-semibold text-gray-900">EXIF Data</h4>
              <span className="text-sm text-gray-500">({Object.keys(data.exif).length} fields)</span>
            </div>
            {expandedSections.exif ? (
              <ChevronDown size={18} className="text-gray-400" />
            ) : (
              <ChevronRight size={18} className="text-gray-400" />
            )}
          </button>
          
          {expandedSections.exif && (
            <div className="px-4 pb-4">
              <dl className="space-y-1 max-h-64 overflow-y-auto">
                {Object.entries(data.exif).map(([key, value]) =>
                  renderField(key, value, `exif-${key}`)
                )}
              </dl>
            </div>
          )}
        </div>
      )}

      {/* Technical Information */}
      {Object.keys(data.info).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200">
          <button
            onClick={() => toggleSection('technical')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Info size={18} className="text-purple-600" />
              <h4 className="font-semibold text-gray-900">Technical Information</h4>
              <span className="text-sm text-gray-500">({Object.keys(data.info).length} fields)</span>
            </div>
            {expandedSections.technical ? (
              <ChevronDown size={18} className="text-gray-400" />
            ) : (
              <ChevronRight size={18} className="text-gray-400" />
            )}
          </button>
          
          {expandedSections.technical && (
            <div className="px-4 pb-4">
              <dl className="space-y-1 max-h-64 overflow-y-auto">
                {Object.entries(data.info).map(([key, value]) =>
                  renderField(key, value, `info-${key}`)
                )}
              </dl>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
