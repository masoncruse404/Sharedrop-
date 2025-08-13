import { useState } from 'react';
import { FileItem } from '../../types';
import { formatFileSize, formatDate, getFileIcon, downloadFile, copyToClipboard } from '../../lib/utils';
import { filesAPI } from '../../lib/api';
import { Input } from '../ui/input';
import {
  MoreVertical,
  Download,
  Share2,
  Edit3,
  Trash2,
  Check,
  X,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  File
} from 'lucide-react';

interface FileCardProps {
  file: FileItem;
  onDelete: (fileId: number) => void;
  onRename: (fileId: number, newName: string) => void;
}

const getFileIconComponent = (contentType?: string) => {
  const iconType = getFileIcon(contentType);
  const iconProps = { size: 24, className: "text-gray-600" };
  
  switch (iconType) {
    case 'image': return <Image {...iconProps} />;
    case 'video': return <Video {...iconProps} />;
    case 'music': return <Music {...iconProps} />;
    case 'file-text': return <FileText {...iconProps} />;
    case 'archive': return <Archive {...iconProps} />;
    default: return <File {...iconProps} />;
  }
};

export const FileCard = ({ file, onDelete, onRename }: FileCardProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.original_filename);
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const response = await filesAPI.downloadFile(file.id);
      downloadFile(response.data, file.original_filename);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    setIsLoading(true);
    try {
      const shareData = await filesAPI.shareFile(file.id);
      const shareUrl = `${window.location.origin}/shared/${shareData.share_token}`;
      await copyToClipboard(shareUrl);
      setCopySuccess(true);
      showToast("Share link copied to clipboard!");
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRename = async () => {
    if (newName.trim() === file.original_filename || !newName.trim()) {
      setIsRenaming(false);
      setNewName(file.original_filename);
      return;
    }

    setIsLoading(true);
    try {
      await filesAPI.renameFile(file.id, newName.trim());
      onRename(file.id, newName.trim());
      setIsRenaming(false);
    } catch (error) {
      console.error('Rename failed:', error);
      setNewName(file.original_filename);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    setIsLoading(true);
    try {
      await filesAPI.deleteFile(file.id);
      onDelete(file.id);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex-shrink-0">
              {getFileIconComponent(file.content_type)}
            </div>
            <div className="min-w-0 flex-1">
              {isRenaming ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="text-sm"
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename();
                      if (e.key === 'Escape') {
                        setIsRenaming(false);
                        setNewName(file.original_filename);
                      }
                    }}
                    autoFocus
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={handleRename}
                      disabled={isLoading}
                      className="p-1 hover:bg-green-100 rounded transition-colors"
                    >
                      <Check size={16} className="text-green-600" />
                    </button>
                    <button
                      onClick={() => {
                        setIsRenaming(false);
                        setNewName(file.original_filename);
                      }}
                      disabled={isLoading}
                      className="p-1 hover:bg-red-100 rounded transition-colors"
                    >
                      <X size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>
              ) : (
                <h3 className="font-medium text-gray-900 truncate">
                  {file.original_filename}
                </h3>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <span>{formatFileSize(file.file_size)}</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              disabled={isLoading}
            >
              <MoreVertical size={16} className="text-gray-400" />
            </button>
            
            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-48">
                  <button
                    onClick={() => {
                      handleDownload();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    disabled={isLoading}
                  >
                    <Download size={16} />
                    Download
                  </button>
                  
                  <button
                    onClick={() => {
                      handleShare();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    disabled={isLoading}
                  >
                    {copySuccess ? (
                      <>
                        <Check size={16} className="text-green-600" />
                        <span className="text-green-600">Link copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 size={16} />
                        Share
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsRenaming(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    disabled={isLoading}
                  >
                    <Edit3 size={16} />
                    Rename
                  </button>
                  
                  <hr className="my-1" />
                  
                  <button
                    onClick={() => {
                      handleDelete();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                    disabled={isLoading}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-3 h-3 border border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            Processing...
          </div>
        )}
      </div>

      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg animate-fade-in-out z-50">
          {toastMessage}
        </div>
      )}
    </>
  );
};
