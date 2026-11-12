import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowUpRight, 
  Calendar, 
  Bot 
} from 'lucide-react';
import { MetricCard } from './MetricCard';
import { RevenueChart } from './RevenueChart';
import { PipelineOverview } from './PipelineOverview';
import { RecentActivity } from './RecentActivity';
import { AutomationStatus } from './AutomationStatus';
import { 
  DEMO_KPIS, 
  DEMO_REVENUE_CHART, 
  DEMO_PIPELINE, 
  DEMO_ACTIVITIES 
} from '../../data/mockData';
import type { NavigationTab } from '../../types';

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6">
      {/* Welcome Heading Section */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#131127] to-[#0c0c16] border border-purple-500/20 p-6 shadow-2xl"
      >
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 text-[11px] font-semibold text-purple-300 bg-purple-900/50 rounded-full border border-purple-500/30 flex items-center gap-1.5 font-mono">
                <Sparkles className="w-3 h-3 text-purple-400" />
                AUTONOMOUS SYSTEM ONLINE
              </span>
              <span className="text-xs text-zinc-400 flex items-center gap-1 font-mono">
                <Calendar className="w-3 h-3 text-zinc-500" />
                Nov 2026 Enterprise Edition
              </span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Good morning, Alex <span className="text-purple-400">👋</span>
            </h2>
            <p className="text-sm text-zinc-300 mt-1 max-w-2xl leading-relaxed">
              Cortex has executed <span className="text-purple-300 font-semibold font-mono">148 autonomous tasks</span> today. 
              Revenue pacing is <span className="text-emerald-400 font-semibold">+14.8% above target</span>, and pipeline health remains optimal across all 4 departments.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('ai-assistant')}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-lg shadow-purple-900/40 border border-purple-400/40 transition-all duration-200"
            >
              <Bot className="w-4 h-4" />
              <span>Launch Agent Copilot</span>
            </button>
            <button
              onClick={() => onNavigate('crm')}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-zinc-300 bg-zinc-900/80 hover:bg-purple-950/40 hover:text-white rounded-xl border border-purple-500/20 transition-all duration-200"
            >
              <span>View Pipeline</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {DEMO_KPIS.map((metric, index) => (
          <MetricCard key={metric.id} metric={metric} index={index} />
        ))}
      </div>

      {/* Revenue & Pipeline Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={DEMO_REVENUE_CHART} />
        </div>
        <div className="lg:col-span-1">
          <PipelineOverview data={DEMO_PIPELINE} />
        </div>
      </div>

      {/* Autonomous Operations Summary Strip */}
      <AutomationStatus />

      {/* Recent Activity Section */}
      <RecentActivity activities={DEMO_ACTIVITIES} />
    </div>
  );
};
