import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { filesAPI } from '../../lib/api';
import { extractionAPI } from '../../lib/extractionAPI';
import { FileItem } from '../../types';
import { ExtractionInfo } from '../../types/extraction';
import { getFileIcon } from '../../lib/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Search,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  File,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface FileSelectorProps {
  selectedFileId: number | null;
  onFileSelect: (fileId: number, extractionInfo: ExtractionInfo) => void;
}

const getFileIconComponent = (contentType?: string) => {
  const iconType = getFileIcon(contentType);
  const iconProps = { size: 20, className: "text-gray-600" };
  
  switch (iconType) {
    case 'image': return <Image {...iconProps} />;
    case 'video': return <Video {...iconProps} />;
    case 'music': return <Music {...iconProps} />;
    case 'file-text': return <FileText {...iconProps} />;
    case 'archive': return <Archive {...iconProps} />;
    default: return <File {...iconProps} />;
  }
};

export const FileSelector = ({ selectedFileId, onFileSelect }: FileSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingFileId, setLoadingFileId] = useState<number | null>(null);

  const { data: fileList, isLoading } = useQuery({
    queryKey: ['files'],
    queryFn: () => filesAPI.getFiles(),
  });

  const filteredFiles = fileList?.files?.filter((file: FileItem) =>
    file.original_filename.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleFileSelect = async (file: FileItem) => {
    setLoadingFileId(file.id);
    try {
      const extractionInfo = await extractionAPI.getFileExtractionInfo(file.id);
      onFileSelect(file.id, extractionInfo);
    } catch (error) {
      console.error('Failed to get extraction info:', error);
    } finally {
      setLoadingFileId(null);
    }
  };

  const getExtractionStatus = (file: FileItem) => {
    const isImage = file.content_type?.startsWith('image/');
    const isDocument = 
      file.content_type === 'application/pdf' ||
      file.content_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.content_type?.startsWith('text/');
    
    if (isImage || isDocument) {
      return (
        <CheckCircle size={16} className="text-green-500" />
      );
    }
    
    return (
      <AlertCircle size={16} className="text-gray-400" />
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-gray-200 rounded" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* File List */}
      <div className="space-y-2">
        {filteredFiles.length > 0 ? (
          filteredFiles.map((file: FileItem) => (
            <div
              key={file.id}
              className={`
                bg-white border rounded-xl p-4 cursor-pointer transition-all
                ${
                  selectedFileId === file.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
              onClick={() => handleFileSelect(file)}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {getFileIconComponent(file.content_type)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-900 truncate">
                    {file.original_filename}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {file.content_type}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getExtractionStatus(file)}
                  {loadingFileId === file.id && (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No files found' : 'No files available'}
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Upload some files to get started with extraction'
              }
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-3">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Extraction Support:</h4>
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <CheckCircle size={14} className="text-green-500" />
            <span>Images: Metadata extraction (EXIF, dimensions, format)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={14} className="text-green-500" />
            <span>Documents: Text analysis and keyword extraction</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="text-gray-400" />
            <span>Not supported for this file type</span>
          </div>
        </div>
      </div>
    </div>
  );
};
