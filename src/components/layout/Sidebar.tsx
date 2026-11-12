import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FolderKanban, 
  BarChart3, 
  Bot, 
  Settings, 
  Sparkles,
  ShieldCheck,
  ChevronRight,
  X
} from 'lucide-react';
import type { NavigationTab, NavItemConfig } from '../../types';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Executive overview & KPIs',
  },
  {
    id: 'crm',
    label: 'CRM',
    icon: Users,
    badge: '342',
    description: 'Deals, leads & pipeline',
  },
  {
    id: 'hrms',
    label: 'HRMS',
    icon: Briefcase,
    badge: '18 Open',
    description: 'Talent, requisitions & team',
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: FolderKanban,
    description: 'Sprints, tasks & delivery',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'Telemetry & business intelligence',
  },
  {
    id: 'ai-assistant',
    label: 'AI Assistant',
    icon: Bot,
    badge: 'Core',
    description: 'Autonomous copilot & workflows',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    description: 'System configurations & rules',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
}) => {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 flex flex-col bg-[#0d0d16]/95 backdrop-blur-2xl border-r border-purple-500/15 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo Section */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-purple-500/10">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-violet-700 shadow-lg shadow-purple-900/40 border border-purple-400/30">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-white font-mono">CORTEX</span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-purple-300 uppercase bg-purple-900/50 rounded border border-purple-500/30">
                  AI OS
                </span>
              </div>
              <p className="text-[11px] text-purple-300/60 font-medium tracking-tight">
                Business Automation Agent
              </p>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-purple-500/10 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Autonomous Core Status Card */}
        <div className="px-4 py-3 mx-4 mt-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-purple-900/20 to-indigo-950/30 border border-purple-500/20 shadow-inner">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-zinc-200">Autonomous Core</span>
            </div>
            <span className="text-[10px] font-mono text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-500/30">
              v1.0-alpha
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            All automation pipelines active. 4 background agents monitoring.
          </p>
        </div>

        {/* Navigation List */}
        <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-purple-300/50 uppercase">
            Platform Navigation
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600/25 to-indigo-600/15 text-white border border-purple-500/30 shadow-md shadow-purple-950/40'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-purple-950/30 hover:border hover:border-purple-500/10'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-purple-400 to-indigo-500 rounded-r-full shadow-sm shadow-purple-400" />
                )}

                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-purple-500/20 text-purple-300' 
                      : 'text-zinc-400 group-hover:text-purple-300 group-hover:bg-purple-500/10'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="block leading-tight">{item.label}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                      isActive 
                        ? 'bg-purple-500/30 text-purple-200 border border-purple-400/40' 
                        : 'bg-zinc-800/80 text-zinc-400 border border-zinc-700/50 group-hover:border-purple-500/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* User Profile / Status Footer */}
        <div className="p-4 border-t border-purple-500/15 bg-purple-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-400 flex items-center justify-center text-xs font-bold text-white shadow-md">
                  AM
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0d0d16]" />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-semibold text-zinc-100 truncate">Alex Mercer</h4>
                <p className="text-[11px] text-purple-300/70 truncate flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-purple-400 inline" />
                  Enterprise Admin
                </p>
              </div>
            </div>
            <button
              onClick={() => onSelectTab('settings')}
              title="Settings"
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-purple-500/15 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
