import { useState } from 'react';
import { Dashboard } from '../components/dashboard/Dashboard';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';

export const DashboardPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          title="Dashboard"
        />
        
        <main className="flex-1 overflow-y-auto">
          <Dashboard />
        </main>
      </div>
    </div>
  );
};
