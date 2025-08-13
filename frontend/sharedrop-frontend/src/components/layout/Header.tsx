import { Menu, Bell, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
}

export const Header = ({ onMenuClick, title }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4 lg:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu size={20} />
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search - hidden on mobile */}
          <div className="hidden relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search files..."
              className="pl-10 w-64"
            />
          </div>
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs" />
          </Button>
        </div>
      </div>
    </header>
  );
};
