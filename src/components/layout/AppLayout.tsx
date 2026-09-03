'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { UserProvider } from '@/context/UserContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const pathname = usePathname();

  if (pathname === '/login') {
    return <UserProvider>{children}</UserProvider>;
  }

  return (
    <UserProvider>
      <div className="min-h-screen bg-slate-50 flex">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
          <Navbar onToggleSidebar={() => setIsSidebarOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </UserProvider>
  );
}
