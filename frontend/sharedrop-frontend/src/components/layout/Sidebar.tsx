import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Home, Settings, LogOut, HardDrive, ImagePlus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { usersAPI } from '../../lib/api';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Extract', href: '/extract', icon: ImagePlus },
    { name: 'Settings', href: '/settings', icon: Settings }
  ];

  const handleLogout = () => {
    logout();
    onClose();
  };

  // Query storage usage
  const { data: storageData } = useQuery({
    queryKey: ['storage'],
    queryFn: () => usersAPI.getStorage()
  });

  // Format bytes into human-readable sizes
  const formatBytes = (bytes?: number) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Calculate percentage
  const usagePercent = storageData?.limit
    ? Math.min(100, Math.round((storageData.used / storageData.limit) * 100))
    : 0;

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      <div className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <HardDrive size={24} className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">ShareDrop</h1>
                <p className="text-sm text-gray-600">File sharing made easy</p>
              </div>
            </div>
          </div>
          
          {/* User info */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 truncate">{user?.username}</p>
                <p className="text-sm text-gray-600 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <item.icon size={18} />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          
          {/* Storage info */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Storage</span>
                <span className="text-xs text-gray-500">
                  {storageData ? `${formatBytes(storageData.used)} / ${formatBytes(storageData.limit)}` : '—'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>
          </div>
          
          {/* Logout button */}
          <div className="p-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
