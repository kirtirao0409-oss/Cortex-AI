import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import type { NavigationTab } from '../../types';

interface MainLayoutProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  activeTab,
  onSelectTab,
  children,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#09090f] text-[#f1f0f7] flex relative selection:bg-purple-600/40 selection:text-white">
      {/* Deep purple ambient glow blobs in background */}
      <div 
        className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-purple-700/8 rounded-full blur-[140px] pointer-events-none -z-10" 
        aria-hidden="true"
      />
      <div 
        className="fixed bottom-10 right-10 w-[500px] h-[500px] bg-indigo-600/6 rounded-full blur-[140px] pointer-events-none -z-10" 
        aria-hidden="true"
      />

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Sticky Header */}
        <Header
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenAiAssistant={() => onSelectTab('ai-assistant')}
        />

        {/* View Content Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Subtle Footer */}
        <footer className="px-6 py-4 border-t border-purple-500/10 text-center text-xs text-zinc-500 font-mono">
          <span>Cortex Autonomous AI Business OS • Phase 1 Visual Architecture</span>
        </footer>
      </div>
    </div>
  );
};
