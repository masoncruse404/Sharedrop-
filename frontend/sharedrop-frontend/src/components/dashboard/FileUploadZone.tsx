import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { filesAPI } from '../../lib/api';
import { formatFileSize } from '../../lib/utils';
import { UploadProgress } from '../../types';

interface FileUploadZoneProps {
  onUploadComplete: () => void;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export const FileUploadZone = ({ onUploadComplete }: FileUploadZoneProps) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Add files to uploading state
    const newUploadingFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'uploading' as const,
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // Upload each file
    newUploadingFiles.forEach(uploadingFile => {
      uploadFile(uploadingFile);
    });
  }, []);

  const uploadFile = async (uploadingFile: UploadingFile) => {
    try {
      await filesAPI.uploadFile(
        uploadingFile.file,
        (progress) => {
          setUploadingFiles(prev =>
            prev.map(f =>
              f.id === uploadingFile.id
                ? { ...f, progress }
                : f
            )
          );
        }
      );

      // Mark as completed
      setUploadingFiles(prev =>
        prev.map(f =>
          f.id === uploadingFile.id
            ? { ...f, progress: 100, status: 'completed' }
            : f
        )
      );

      // Remove from list after 2 seconds
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f.id !== uploadingFile.id));
        onUploadComplete();
      }, 2000);

    } catch (error: any) {
      setUploadingFiles(prev =>
        prev.map(f =>
          f.id === uploadingFile.id
            ? {
                ...f,
                status: 'error',
                error: error.response?.data?.detail || 'Upload failed'
              }
            : f
        )
      );
    }
  };

  const removeFile = (id: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== id));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer
          ${isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className={`p-3 rounded-full ${isDragActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <Upload size={32} className={isDragActive ? 'text-blue-600' : 'text-gray-600'} />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {isDragActive ? 'Drop files here' : 'Upload files'}
            </h3>
            <p className="text-sm text-gray-600">
              Drag and drop files here, or{' '}
              <span className="text-blue-600 font-medium">browse</span> to choose files
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Maximum file size: 100MB
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Uploading files</h4>
          {uploadingFiles.map((uploadingFile) => (
            <div
              key={uploadingFile.id}
              className="bg-white border border-gray-200 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex-shrink-0">
                    {uploadingFile.status === 'completed' && (
                      <CheckCircle size={20} className="text-green-500" />
                    )}
                    {uploadingFile.status === 'error' && (
                      <AlertCircle size={20} className="text-red-500" />
                    )}
                    {uploadingFile.status === 'uploading' && (
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {uploadingFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(uploadingFile.file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(uploadingFile.id)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              </div>
              
              {uploadingFile.status === 'uploading' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadingFile.progress}%` }}
                  />
                </div>
              )}
              
              {uploadingFile.status === 'error' && (
                <p className="text-xs text-red-600 mt-1">
                  {uploadingFile.error}
                </p>
              )}
              
              {uploadingFile.status === 'completed' && (
                <p className="text-xs text-green-600 mt-1">
                  Upload completed successfully
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
