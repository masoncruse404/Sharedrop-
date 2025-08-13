import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FileUploadZone } from './FileUploadZone';
import { FileCard } from './FileCard';
import { filesAPI, usersAPI } from '../../lib/api';
import { FileItem } from '../../types';
import { Grid, List, Plus, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadZone, setShowUploadZone] = useState(false);
  
  const queryClient = useQueryClient();

  // Files query
  const { data: fileList, isLoading, error } = useQuery({
    queryKey: ['files'],
    queryFn: () => filesAPI.getFiles(),
  });

  // Storage usage query
  const { data: storageData, isLoading: storageLoading } = useQuery({
    queryKey: ['storage'],
    queryFn: () => usersAPI.getStorage(), // backend returns { used, limit }
  });

  // Format bytes to human-readable string
  const formatBytes = (bytes) => {
    if (bytes === 0 || bytes === undefined || bytes === null) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = fileList?.files?.filter((file: FileItem) =>
    file.original_filename.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleUploadComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['files'] });
    queryClient.invalidateQueries({ queryKey: ['storage'] });
  };

  const handleFileDelete = (fileId: number) => {
    queryClient.setQueryData(['files'], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        files: oldData.files.filter((file: FileItem) => file.id !== fileId),
        total: oldData.total - 1,
      };
    });
    queryClient.invalidateQueries({ queryKey: ['storage'] });
  };

  const handleFileRename = (fileId: number, newName: string) => {
    queryClient.setQueryData(['files'], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        files: oldData.files.map((file: FileItem) =>
          file.id === fileId ? { ...file, original_filename: newName } : file
        ),
      };
    });
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error loading files</h3>
          <p className="text-red-600">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  const usagePercent = storageData?.limit
    ? Math.min(
        100,
        Math.round((storageData.used / storageData.limit) * 100)
      )
    : 0;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center border border-gray-200 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
        
        <Button
          onClick={() => setShowUploadZone(!showUploadZone)}
          className="whitespace-nowrap"
        >
          <Plus size={18} />
          Upload Files
        </Button>
      </div>

      {/* Upload Zone */}
      {showUploadZone && (
        <div className="mb-8">
          <FileUploadZone onUploadComplete={handleUploadComplete} />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Files</h3>
          <p className="text-2xl font-semibold text-gray-900">
            {isLoading ? '-' : fileList?.total || 0}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Storage Used</h3>
          {storageLoading ? (
            <p className="text-2xl font-semibold text-gray-900">-</p>
          ) : (
            <>
              <p className="text-2xl font-semibold text-gray-900">
                {formatBytes(storageData?.used) || '0 B'} / {formatBytes(storageData?.limit) || '—'}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Shared Files</h3>
          <p className="text-2xl font-semibold text-gray-900">
            {isLoading ? '-' : fileList?.files?.filter((f: FileItem) => f.share_token)?.length || 0}
          </p>
        </div>
      </div>

      {/* Files Grid/List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-6 bg-gray-200 rounded" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredFiles.length > 0 ? (
        <div className={`
          ${viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-3'
          }
        `}>
          {filteredFiles.map((file: FileItem) => (
            <FileCard
              key={file.id}
              file={file}
              onDelete={handleFileDelete}
              onRename={handleFileRename}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No files found' : 'No files yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Upload your first file to get started'
            }
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowUploadZone(true)}>
              <Plus size={18} />
              Upload Files
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
