import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  Search, 
  Bell, 
  Bot, 
  X, 
  Building2, 
  Briefcase, 
  Zap, 
  FolderKanban
} from 'lucide-react';
import { 
  INITIAL_CRM_OPPORTUNITIES, 
  DEMO_HRMS_ROLES, 
  DEMO_AUTOMATION_SUMMARY,
  DEMO_PROJECT_LIST,
  INITIAL_NOTIFICATIONS 
} from '../../data/mockData';
import { NotificationPanel } from './NotificationPanel';
import type { NavigationTab, CrmOpportunity, CortexNotification } from '../../types';

interface HeaderProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenMobileMenu: () => void;
  onOpenAiAssistant: () => void;
}

const TAB_TITLES: Record<NavigationTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Executive Dashboard',
    subtitle: 'Unified AI automation performance & telemetry',
  },
  crm: {
    title: 'CRM & Pipeline Automation',
    subtitle: 'Autonomous lead scoring, deal tracking & outreach',
  },
  hrms: {
    title: 'HRMS & Talent Intelligence',
    subtitle: 'Automated candidate screening, requisitions & team health',
  },
  projects: {
    title: 'Projects & Autonomous Delivery',
    subtitle: 'Sprint velocity monitoring, automated blockers & workflows',
  },
  analytics: {
    title: 'Enterprise Analytics',
    subtitle: 'Deep business metrics, operational uplift & revenue models',
  },
  'ai-assistant': {
    title: 'Cortex AI Copilot',
    subtitle: 'Autonomous business process execution & conversational interface',
  },
  settings: {
    title: 'System Settings & Rules',
    subtitle: 'Automation thresholds, integrations & agent permissions',
  },
};

const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val);
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenMobileMenu,
  onOpenAiAssistant,
}) => {
  const current = TAB_TITLES[activeTab] || TAB_TITLES.dashboard;

  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Notifications State & LocalStorage Persistence
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationContainerRef = useRef<HTMLDivElement>(null);
  const NOTIFICATIONS_STORAGE_KEY = 'cortex_notifications';

  const [notifications, setNotifications] = useState<CortexNotification[]>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      }
    } catch {
      // fallback to default
    }
    return INITIAL_NOTIFICATIONS;
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
      }
    } catch {
      // storage quota / unavailable
    }
  }, [notifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleResetNotifications = () => {
    setNotifications(INITIAL_NOTIFICATIONS);
  };

  const handleSelectNotification = (tab: NavigationTab, id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    onSelectTab(tab);
    setIsNotificationsOpen(false);
  };

  // Global keyboard shortcut: Cmd+K or Ctrl+K to focus search input; Escape to dismiss modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsDropdownOpen(true);
      } else if (e.key === 'Escape') {
        if (isDropdownOpen) {
          setIsDropdownOpen(false);
          searchInputRef.current?.blur();
        }
        if (isNotificationsOpen) {
          setIsNotificationsOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDropdownOpen, isNotificationsOpen]);

  // Click outside listener to dismiss dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationContainerRef.current && !notificationContainerRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch opportunities (reading localStorage for real-time updates if available)
  const allOpportunities = useMemo<CrmOpportunity[]>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('cortex_crm_opportunities');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const existingNames = new Set(parsed.map((item: any) => (item.company || '').toLowerCase().trim()));
            const missingInitial = INITIAL_CRM_OPPORTUNITIES.filter(
              (init) => !existingNames.has(init.company.toLowerCase().trim()) && !parsed.some((p: any) => p.id === init.id)
            );
            return missingInitial.length > 0 ? [...parsed, ...missingInitial] : parsed;
          }
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_CRM_OPPORTUNITIES;
  }, []);

  // Filter items across pipelines, candidates, workflows, and projects
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return { pipelines: [], candidates: [], workflows: [], projects: [], totalCount: 0 };
    }

    const pipelines = allOpportunities.filter((opp) => {
      const inCompany = (opp.company || '').toLowerCase().includes(query);
      const inContact = (opp.contactPerson || '').toLowerCase().includes(query);
      const inEmail = (opp.email || '').toLowerCase().includes(query);
      const inOwner = (opp.owner || '').toLowerCase().includes(query);
      const inStage = (opp.stage || '').toLowerCase().includes(query);
      return inCompany || inContact || inEmail || inOwner || inStage;
    }).slice(0, 4);

    let hrmsRoles = DEMO_HRMS_ROLES;
    try {
      const storedHrms = localStorage.getItem('cortex_hrms_requisitions');
      if (storedHrms) {
        const parsedHrms = JSON.parse(storedHrms);
        if (Array.isArray(parsedHrms) && parsedHrms.length > 0) {
          hrmsRoles = parsedHrms;
        }
      }
    } catch {
      // fallback to default demo roles
    }

    const candidates = hrmsRoles.filter((role) => {
      const inRole = (role.role || '').toLowerCase().includes(query);
      const inDept = (role.department || '').toLowerCase().includes(query);
      const inStatus = (role.status || '').toLowerCase().includes(query);
      return inRole || inDept || inStatus;
    }).slice(0, 3);

    const workflows = DEMO_AUTOMATION_SUMMARY.filter((task) => {
      const inName = (task.name || '').toLowerCase().includes(query);
      const inModule = (task.module || '').toLowerCase().includes(query);
      const inStatus = (task.status || '').toLowerCase().includes(query);
      return inName || inModule || inStatus;
    }).slice(0, 3);

    let projectList = DEMO_PROJECT_LIST;
    try {
      const storedProjects = localStorage.getItem('cortex_projects');
      if (storedProjects) {
        const parsedProjects = JSON.parse(storedProjects);
        if (Array.isArray(parsedProjects) && parsedProjects.length > 0) {
          projectList = parsedProjects;
        }
      }
    } catch {
      // fallback
    }

    const projects = projectList.filter((proj) => {
      const inName = (proj.name || '').toLowerCase().includes(query);
      const inTeam = (proj.team || '').toLowerCase().includes(query);
      const inStatus = (proj.status || '').toLowerCase().includes(query);
      return inName || inTeam || inStatus;
    }).slice(0, 3);

    const totalCount = pipelines.length + candidates.length + workflows.length + projects.length;

    return { pipelines, candidates, workflows, projects, totalCount };
  }, [searchQuery, allOpportunities]);

  const handleSelectItem = (tab: NavigationTab) => {
    onSelectTab(tab);
    setIsDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 py-3.5 bg-[#09090f]/80 backdrop-blur-xl border-b border-purple-500/15">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 lg:gap-4">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-purple-500/10 lg:hidden border border-purple-500/20 cursor-pointer"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center">
            <span className="text-xs font-semibold text-purple-400/90 tracking-wide uppercase font-mono">
              CORTEX // {activeTab.toUpperCase()}
            </span>
          </div>
          <h1 className="text-lg lg:text-xl font-bold tracking-tight text-white flex items-center gap-2">
            {current.title}
          </h1>
        </div>
      </div>

      {/* Center: Global Search Bar & Results Dropdown */}
      <div 
        ref={containerRef}
        className="hidden md:flex items-center relative max-w-xs lg:max-w-md w-full mx-4"
      >
        <Search className="absolute left-3 w-4 h-4 text-zinc-500 pointer-events-none z-10" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => {
            if (searchQuery.trim()) {
              setIsDropdownOpen(true);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsDropdownOpen(false);
              searchInputRef.current?.blur();
            }
          }}
          placeholder="Search pipelines, candidates, workflows (⌘K)..."
          autoComplete="off"
          className="w-full pl-9 pr-12 py-1.5 text-xs bg-zinc-900/80 border border-purple-500/20 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all cursor-text"
        />

        {searchQuery ? (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setIsDropdownOpen(false);
              searchInputRef.current?.focus();
            }}
            className="absolute right-2.5 p-1 text-zinc-400 hover:text-white rounded cursor-pointer"
            title="Clear search"
            aria-label="Clear search input"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="absolute right-2.5 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-800/80 rounded border border-zinc-700/50 pointer-events-none">
            ⌘K
          </span>
        )}

        {/* Global Search Results Dropdown */}
        <AnimatePresence>
          {isDropdownOpen && searchQuery.trim() && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl bg-[#121222]/95 border border-purple-500/30 p-3 shadow-2xl shadow-purple-950/80 backdrop-blur-2xl text-white max-h-96 overflow-y-auto"
            >
              <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-purple-500/15 text-[11px] text-zinc-400 font-mono">
                <span>Matching Results</span>
                <span>{searchResults.totalCount} found • Press Esc to close</span>
              </div>

              {/* CRM Pipelines & Deals */}
              {searchResults.pipelines.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-semibold tracking-wider text-purple-300 uppercase font-mono">
                    <Building2 className="w-3 h-3 text-purple-400" />
                    <span>Pipelines & Deals (CRM)</span>
                  </div>
                  <div className="space-y-1">
                    {searchResults.pipelines.map((deal) => (
                      <button
                        key={deal.id}
                        type="button"
                        onClick={() => handleSelectItem('crm')}
                        className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-purple-950/40 hover:border hover:border-purple-500/20 transition-all cursor-pointer group"
                      >
                        <div>
                          <span className="text-xs font-semibold text-white group-hover:text-purple-200 block">
                            {deal.company}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {deal.contactPerson} • {deal.owner}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold font-mono text-emerald-400 block">
                            {formatCurrency(deal.dealValue)}
                          </span>
                          <span className="text-[10px] font-medium text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-500/20">
                            {deal.stage}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Candidates & Open Requisitions */}
              {searchResults.candidates.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-semibold tracking-wider text-purple-300 uppercase font-mono">
                    <Briefcase className="w-3 h-3 text-purple-400" />
                    <span>Candidates & Requisitions (HRMS)</span>
                  </div>
                  <div className="space-y-1">
                    {searchResults.candidates.map((role) => (
                      <button
                        key={role.role}
                        type="button"
                        onClick={() => handleSelectItem('hrms')}
                        className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-purple-950/40 hover:border hover:border-purple-500/20 transition-all cursor-pointer group"
                      >
                        <div>
                          <span className="text-xs font-semibold text-white group-hover:text-purple-200 block">
                            {role.role}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {role.department}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] font-mono text-zinc-300 block">
                            {role.applicants} applicants
                          </span>
                          <span className="text-[10px] font-medium text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-500/20">
                            {role.status}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Workflows & Automation */}
              {searchResults.workflows.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-semibold tracking-wider text-purple-300 uppercase font-mono">
                    <Zap className="w-3 h-3 text-purple-400" />
                    <span>Workflows & Automation</span>
                  </div>
                  <div className="space-y-1">
                    {searchResults.workflows.map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => handleSelectItem('analytics')}
                        className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-purple-950/40 hover:border hover:border-purple-500/20 transition-all cursor-pointer group"
                      >
                        <div>
                          <span className="text-xs font-semibold text-white group-hover:text-purple-200 block">
                            {task.name}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            Module: {task.module} • {task.lastRun}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-purple-300 block">
                            {task.savedHours} hrs saved
                          </span>
                          <span className="text-[10px] uppercase font-semibold text-emerald-400">
                            {task.status}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects & Initiatives */}
              {searchResults.projects.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-semibold tracking-wider text-purple-300 uppercase font-mono">
                    <FolderKanban className="w-3 h-3 text-purple-400" />
                    <span>Active Projects</span>
                  </div>
                  <div className="space-y-1">
                    {searchResults.projects.map((proj) => (
                      <button
                        key={proj.name}
                        type="button"
                        onClick={() => handleSelectItem('projects')}
                        className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-purple-950/40 hover:border hover:border-purple-500/20 transition-all cursor-pointer group"
                      >
                        <div>
                          <span className="text-xs font-semibold text-white group-hover:text-purple-200 block">
                            {proj.name}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {proj.team}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-white block">
                            {proj.progress}%
                          </span>
                          <span className="text-[10px] font-medium text-emerald-400">
                            {proj.status}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state when no matches found */}
              {searchResults.totalCount === 0 && (
                <div className="py-6 text-center text-xs text-zinc-400">
                  <p className="font-semibold text-zinc-200">No matching results found</p>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    No pipelines, candidates, or workflows matching &quot;{searchQuery}&quot;
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Autonomous Core Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-950/40 border border-purple-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-purple-200">
            Engine: <span className="text-emerald-400 font-mono">Active</span>
          </span>
        </div>

        {/* Notifications */}
        <div ref={notificationContainerRef} className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            title="Notifications"
            aria-label="Notifications"
            aria-expanded={isNotificationsOpen}
            className={`relative p-2 rounded-xl border transition-all cursor-pointer ${
              isNotificationsOpen
                ? 'text-white bg-purple-600/20 border-purple-500/40'
                : 'text-zinc-400 hover:text-white hover:bg-purple-500/10 border-transparent hover:border-purple-500/20'
            }`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full border-2 border-[#09090f] shadow-md shadow-purple-500/40">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <NotificationPanel
                notifications={notifications}
                onClose={() => setIsNotificationsOpen(false)}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onClearAll={handleClearAll}
                onResetNotifications={handleResetNotifications}
                onSelectNotification={handleSelectNotification}
              />
            )}
          </AnimatePresence>
        </div>

        {/* AI Copilot Trigger Button */}
        <button
          onClick={onOpenAiAssistant}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-purple-900/30 border border-purple-400/30 transition-all duration-200 cursor-pointer"
        >
          <Bot className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ask Cortex</span>
        </button>
      </div>
    </header>
  );
};
