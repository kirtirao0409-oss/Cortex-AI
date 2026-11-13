import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  BellOff, 
  CheckCheck, 
  Check, 
  X, 
  Clock, 
  Building2, 
  Briefcase, 
  FolderKanban, 
  TrendingUp, 
  Bot,
  RotateCcw
} from 'lucide-react';
import type { NavigationTab, CortexNotification } from '../../types';

interface NotificationPanelProps {
  notifications: CortexNotification[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onResetNotifications: () => void;
  onSelectNotification: (tab: NavigationTab, id: string) => void;
}

const MODULE_CONFIG = {
  CRM: {
    label: 'CRM',
    icon: Building2,
    badgeClass: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30',
    iconClass: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/20',
  },
  HRMS: {
    label: 'HRMS',
    icon: Briefcase,
    badgeClass: 'text-purple-300 bg-purple-950/60 border-purple-500/30',
    iconClass: 'text-purple-400 bg-purple-950/50 border-purple-500/20',
  },
  PROJECTS: {
    label: 'Projects',
    icon: FolderKanban,
    badgeClass: 'text-cyan-300 bg-cyan-950/60 border-cyan-500/30',
    iconClass: 'text-cyan-400 bg-cyan-950/50 border-cyan-500/20',
  },
  ANALYTICS: {
    label: 'Analytics',
    icon: TrendingUp,
    badgeClass: 'text-fuchsia-300 bg-fuchsia-950/60 border-fuchsia-500/30',
    iconClass: 'text-fuchsia-400 bg-fuchsia-950/50 border-fuchsia-500/20',
  },
  AI_AGENT: {
    label: 'AI Copilot',
    icon: Bot,
    badgeClass: 'text-indigo-300 bg-indigo-950/60 border-indigo-500/30',
    iconClass: 'text-indigo-400 bg-indigo-950/50 border-indigo-500/20',
  },
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onResetNotifications,
  onSelectNotification,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 rounded-2xl bg-[#0e0e1a]/95 backdrop-blur-2xl border border-purple-500/25 shadow-2xl shadow-black/80 overflow-hidden z-50 flex flex-col"
      role="dialog"
      aria-label="Notifications panel"
    >
      {/* Top Header */}
      <div className="px-4 py-3 border-b border-purple-500/15 flex items-center justify-between bg-purple-950/20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">
                Notifications
              </span>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {unreadCount} new
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-full bg-zinc-800 text-zinc-400">
                  All read
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="px-2 py-1 text-[11px] font-medium text-purple-300 hover:text-white rounded-lg hover:bg-purple-500/15 transition-colors flex items-center gap-1 cursor-pointer"
              title="Mark all notifications as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-purple-500/10 transition-colors cursor-pointer"
            aria-label="Close notification panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notification Items List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-purple-500/10 overscroll-contain">
        {notifications.length > 0 ? (
          notifications.map((item) => {
            const config = MODULE_CONFIG[item.module] || MODULE_CONFIG.CRM;
            const Icon = config.icon;

            return (
              <div
                key={item.id}
                onClick={() => onSelectNotification(item.targetTab, item.id)}
                className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer group ${
                  item.read
                    ? 'bg-transparent hover:bg-purple-950/30'
                    : 'bg-purple-900/15 hover:bg-purple-900/25'
                }`}
              >
                {/* Module Icon */}
                <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${config.iconClass}`}>
                  <Icon className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className={`text-xs font-semibold truncate ${
                        item.read ? 'text-zinc-300' : 'text-white font-bold'
                      } group-hover:text-purple-200`}
                    >
                      {item.title}
                    </span>

                    <span
                      className={`px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded border shrink-0 ${config.badgeClass}`}
                    >
                      {config.label}
                    </span>
                  </div>

                  <p className="text-[11px] leading-relaxed text-zinc-400 group-hover:text-zinc-300">
                    {item.message}
                  </p>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      {item.timestamp}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(item.id);
                      }}
                      className={`p-1 rounded-md text-[10px] transition-all flex items-center gap-1 cursor-pointer ${
                        item.read
                          ? 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                          : 'text-purple-300 hover:text-white bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30'
                      }`}
                      title={item.read ? 'Mark as unread' : 'Mark as read'}
                    >
                      <Check className="w-3 h-3" />
                      <span>{item.read ? 'Read' : 'Mark read'}</span>
                    </button>
                  </div>
                </div>

                {/* Unread Indicator Glow */}
                {!item.read && (
                  <span
                    className="w-2 h-2 rounded-full bg-purple-400 ring-4 ring-purple-500/20 shrink-0 mt-1"
                    title="Unread notification"
                  />
                )}
              </div>
            );
          })
        ) : (
          /* Clean Empty State */
          <div className="py-12 px-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3 shadow-lg shadow-purple-950/50">
              <BellOff className="w-6 h-6 text-zinc-400" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">
              All caught up!
            </h4>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
              No notifications at the moment. All autonomous tasks and pipeline updates are in sync.
            </p>
            <button
              type="button"
              onClick={onResetNotifications}
              className="mt-4 px-3 py-1.5 text-xs font-medium text-purple-300 hover:text-white bg-purple-950/60 hover:bg-purple-900/60 rounded-xl border border-purple-500/25 transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Load sample notifications</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      {notifications.length > 0 && (
        <div className="px-4 py-2.5 bg-[#090913] border-t border-purple-500/15 flex items-center justify-between text-[11px] text-zinc-500">
          <span>{notifications.length} updates recorded</span>
          <button
            type="button"
            onClick={onClearAll}
            className="text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}
    </motion.div>
  );
};
