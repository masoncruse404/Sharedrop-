import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { filesAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { HardDrive, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { downloadFile } from '../lib/utils';

export const SharedFilePage = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleDownload = async () => {
    if (!shareToken) return;
    
    setIsDownloading(true);
    setError('');
    
    try {
      const response = await filesAPI.downloadSharedFile(shareToken);
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'download';
      
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) {
          filename = match[1];
        }
      }
      
      downloadFile(response.data, filename);
      setSuccess(true);
      
    } catch (error: any) {
      if (error.response?.status === 404) {
        setError('File not found or sharing link has expired.');
      } else {
        setError('Failed to download file. Please try again.');
      }
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!shareToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="p-3 bg-red-100 rounded-2xl w-fit mx-auto mb-6">
            <AlertCircle size={32} className="text-red-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Invalid Link</h1>
          <p className="text-gray-600">The sharing link is invalid or malformed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="p-3 bg-blue-100 rounded-2xl w-fit mx-auto mb-4">
              <HardDrive size={32} className="text-blue-600" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">ShareDrop</h1>
            <p className="text-gray-600">Someone shared a file with you</p>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-600">File downloaded successfully!</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-medium text-gray-900 mb-1">Ready to download</h3>
                <p className="text-sm text-gray-600">
                  Click the button below to download the shared file.
                </p>
              </div>

              <Button
                onClick={handleDownload}
                className="w-full h-12 text-base"
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Downloading...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Download size={18} />
                    Download File
                  </div>
                )}
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              This is a secure file sharing link. If you don't recognize this file,
              please don't download it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
