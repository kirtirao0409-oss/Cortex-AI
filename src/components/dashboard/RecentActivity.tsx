import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Sparkles
} from 'lucide-react';
import type { ActivityItem } from '../../types';

interface RecentActivityProps {
  activities: ActivityItem[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const [filter, setFilter] = useState<'ALL' | 'CRM' | 'HRMS' | 'PROJECTS' | 'AUTOMATED'>('ALL');

  const filtered = activities.filter((item) => {
    if (filter === 'ALL') return true;
    if (filter === 'AUTOMATED') return item.status === 'automated';
    return item.category === filter;
  });

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'CRM':
        return 'bg-purple-950/60 text-purple-300 border-purple-500/30';
      case 'HRMS':
        return 'bg-violet-950/60 text-violet-300 border-violet-500/30';
      case 'PROJECTS':
        return 'bg-indigo-950/60 text-indigo-300 border-indigo-500/30';
      case 'FINANCE':
        return 'bg-fuchsia-950/60 text-fuchsia-300 border-fuchsia-500/30';
      default:
        return 'bg-zinc-900 text-zinc-300 border-zinc-700';
    }
  };

  const getStatusIcon = (status: ActivityItem['status']) => {
    switch (status) {
      case 'automated':
        return <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
      case 'completed':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'attention':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#121222]/90 to-[#0e0e1a]/80 backdrop-blur-xl border border-purple-500/15 p-5 lg:p-6 shadow-xl">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base lg:text-lg font-bold text-white tracking-tight">
              Autonomous Activity Feed
            </h3>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Real-time execution log from Cortex autonomous agents & workflows
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          {(['ALL', 'AUTOMATED', 'CRM', 'HRMS', 'PROJECTS'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all ${
                filter === tab
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-400/40 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              {tab === 'AUTOMATED' ? 'AI Automated' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="group flex flex-col sm:flex-row sm:items-start justify-between gap-3 p-3.5 rounded-xl bg-zinc-900/40 hover:bg-purple-950/20 border border-purple-500/10 hover:border-purple-500/25 transition-all duration-200"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-2 rounded-lg bg-purple-950/50 border border-purple-500/20 flex-shrink-0">
                {getStatusIcon(item.status)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-white group-hover:text-purple-200 transition-colors">
                    {item.title}
                  </span>
                  <span className={`px-2 py-0.2 text-[10px] font-medium rounded-full border ${getCategoryBadgeClass(item.category)}`}>
                    {item.category}
                  </span>
                  {item.status === 'automated' && (
                    <span className="px-1.5 py-0.2 text-[10px] font-mono text-purple-300 bg-purple-900/40 rounded border border-purple-500/20">
                      Auto-Exec
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
                  {item.description}
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-[11px] text-zinc-500">
                  <span className="text-purple-400/80 font-medium">{item.actor}</span>
                  <span>•</span>
                  <span>{item.timestamp}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-8 text-center text-xs text-zinc-500">
            No activities found for this filter.
          </div>
        )}
      </div>
    </div>
  );
};
