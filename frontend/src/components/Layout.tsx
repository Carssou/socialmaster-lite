import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from './ui/Sidebar';
import { Header } from './ui/Header';
import { cn } from '../utils/cn';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - only renders desktop version here */}
      <Sidebar 
        user={user}
        loading={loading}
        onLogout={handleLogout}
      />

      {/* Main content area with dynamic padding based on sidebar state */}
      <div className={cn(
        'transition-all duration-300 ease-in-out',
        'lg:pl-80', // Default padding for expanded sidebar
        // Add logic here later for collapsed state: sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-80'
      )}>
        <div className="flex min-h-screen flex-col">
          {/* Header with breadcrumbs - hidden on mobile when sidebar handles the mobile menu */}
          <Header className="hidden lg:block" />

          {/* Page content */}
          <main className="flex-1">
            <div className="px-6 py-6">
              <div className="mx-auto max-w-7xl">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};