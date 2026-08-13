import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-200 overflow-hidden">
      {/* HEADER: FIXED AT TOP - DOES NOT SCROLL */}
      <Navbar onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      {/* LOWER SHELL: FILLS REMAINING VIEWPORT HEIGHT */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* SIDEBAR: SCROLLS INDEPENDENTLY */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        {/* MAIN CONTENT: SCROLLS INDEPENDENTLY */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 w-full max-w-7xl mx-auto min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
