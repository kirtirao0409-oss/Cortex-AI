import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowUpRight, 
  Calendar, 
  Bot,
  DollarSign,
  UserCheck,
  Briefcase,
  FolderKanban
} from 'lucide-react';
import { MetricCard } from './MetricCard';
import { RevenueChart } from './RevenueChart';
import { PipelineOverview } from './PipelineOverview';
import { RecentActivity } from './RecentActivity';
import { AutomationStatus } from './AutomationStatus';
import { 
  INITIAL_CRM_OPPORTUNITIES, 
  DEMO_HRMS_ROLES, 
  DEMO_PROJECT_LIST,
  DEMO_ACTIVITIES 
} from '../../data/mockData';
import type { 
  NavigationTab, 
  CrmOpportunity, 
  HrmsRequisition, 
  ProjectItem, 
  KpiMetric, 
  PipelineStage, 
  DealStage 
} from '../../types';

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

const CRM_KEY = 'cortex_crm_opportunities';
const HRMS_KEY = 'cortex_hrms_requisitions';
const PROJECTS_KEY = 'cortex_projects';

const STAGES_LIST: DealStage[] = [
  'Inquiry',
  'Qualified',
  'Demo Held',
  'Proposal',
  'Negotiation',
  'Closed Won'
];

const STAGE_CONFIG: Record<DealStage, { color: string }> = {
  'Inquiry': { color: '#6366f1' },
  'Qualified': { color: '#8b5cf6' },
  'Demo Held': { color: '#a855f7' },
  'Proposal': { color: '#c084fc' },
  'Negotiation': { color: '#e879f9' },
  'Closed Won': { color: '#22c55e' },
};

// Safe loaders for actual application data
const loadCrmData = (): CrmOpportunity[] => {
  try {
    const raw = localStorage.getItem(CRM_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingNames = new Set(parsed.map((item: any) => (item.company || '').toLowerCase().trim()));
        const missing = INITIAL_CRM_OPPORTUNITIES.filter(
          (init) => !existingNames.has(init.company.toLowerCase().trim()) && !parsed.some((p: any) => p.id === init.id)
        );
        return missing.length > 0 ? [...parsed, ...missing] : parsed;
      }
    }
  } catch {}
  return INITIAL_CRM_OPPORTUNITIES;
};

const loadHrmsData = (): HrmsRequisition[] => {
  try {
    const raw = localStorage.getItem(HRMS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEMO_HRMS_ROLES;
};

const loadProjectsData = (): ProjectItem[] => {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEMO_PROJECT_LIST;
};

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [opportunities, setOpportunities] = useState<CrmOpportunity[]>(loadCrmData);
  const [requisitions, setRequisitions] = useState<HrmsRequisition[]>(loadHrmsData);
  const [projects, setProjects] = useState<ProjectItem[]>(loadProjectsData);

  // Sync data dynamically from localStorage
  const loadAllData = useCallback(() => {
    setOpportunities(loadCrmData());
    setRequisitions(loadHrmsData());
    setProjects(loadProjectsData());
  }, []);

  // Real-time synchronization when records change in CRM, HRMS, Projects or other tabs
  useEffect(() => {
    const handleDataChange = () => {
      loadAllData();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CRM_KEY || e.key === HRMS_KEY || e.key === PROJECTS_KEY) {
        loadAllData();
      }
    };

    window.addEventListener('cortex_data_change', handleDataChange);
    window.addEventListener('cortex_crm_updated', handleDataChange);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleDataChange);

    return () => {
      window.removeEventListener('cortex_data_change', handleDataChange);
      window.removeEventListener('cortex_crm_updated', handleDataChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleDataChange);
    };
  }, [loadAllData]);

  // CRM Calculations
  const totalPipeline = useMemo(() => {
    return opportunities.reduce((sum, o) => sum + (Number(o.dealValue) || 0), 0);
  }, [opportunities]);

  const closedWonDeals = useMemo(() => {
    return opportunities.filter((o) => o.stage === 'Closed Won');
  }, [opportunities]);

  const closedWonRevenue = useMemo(() => {
    return closedWonDeals.reduce((sum, o) => sum + (Number(o.dealValue) || 0), 0);
  }, [closedWonDeals]);

  const weightedPipeline = useMemo(() => {
    return opportunities.reduce((sum, o) => {
      const prob = parseFloat(String(o.probability || '50%').replace(/[^0-9.]/g, '')) || 50;
      return sum + Math.round((Number(o.dealValue) || 0) * (prob / 100));
    }, 0);
  }, [opportunities]);

  // HRMS Calculations
  const totalOpenings = useMemo(() => {
    return requisitions.reduce((sum, r) => sum + (Number(r.openings) || 1), 0);
  }, [requisitions]);

  const totalApplicants = useMemo(() => {
    return requisitions.reduce((sum, r) => sum + (Number(r.applicants) || 0), 0);
  }, [requisitions]);

  // Projects Calculations
  const totalProjects = projects.length;
  const avgProgress = useMemo(() => {
    if (projects.length === 0) return 0;
    return Math.round(projects.reduce((sum, p) => sum + (Number(p.progress) || 0), 0) / projects.length);
  }, [projects]);

  const criticalProjects = useMemo(() => {
    return projects.filter((p) => p.priority === 'High' || p.priority === 'Critical').length;
  }, [projects]);

  // Dynamic Pipeline Stages calculated from actual opportunities
  const dynamicPipelineStages: PipelineStage[] = useMemo(() => {
    return STAGES_LIST.map((stageName) => {
      const matching = opportunities.filter((o) => o.stage === stageName);
      const count = matching.length;
      const value = matching.reduce((sum, o) => sum + (Number(o.dealValue) || 0), 0);
      const formattedValue = value >= 1000000 
        ? `$${(value / 1000000).toFixed(2)}M` 
        : value >= 1000 
          ? `$${(value / 1000).toFixed(0)}k` 
          : `$${value}`;
      return {
        stage: stageName,
        count,
        value,
        formattedValue,
        color: STAGE_CONFIG[stageName]?.color || '#8b5cf6',
      };
    });
  }, [opportunities]);

  // Dynamic Executive KPI Metrics computed from actual application records
  const dynamicKpis: KpiMetric[] = useMemo(() => [
    {
      id: 'kpi-pipeline',
      title: 'Total Pipeline Target',
      value: totalPipeline >= 1000000 
        ? `$${(totalPipeline / 1000000).toFixed(2)}M` 
        : `$${(totalPipeline / 1000).toFixed(0)}k`,
      change: closedWonDeals.length > 0 ? `${closedWonDeals.length} Won` : `${opportunities.length} Active`,
      isPositive: true,
      period: closedWonRevenue > 0 ? `$${(closedWonRevenue / 1000).toFixed(0)}k realized` : 'pipeline target',
      subtext: `${opportunities.length} opportunities active across pipeline`,
      icon: DollarSign,
      color: '#8b5cf6',
    },
    {
      id: 'kpi-weighted',
      title: 'Weighted Opportunity Value',
      value: `$${(weightedPipeline / 1000).toFixed(0)}k`,
      change: totalPipeline > 0 ? `${Math.round((weightedPipeline / totalPipeline) * 100)}%` : '0%',
      isPositive: true,
      period: 'probability weighted',
      subtext: 'Calculated from stage closing probabilities',
      icon: UserCheck,
      color: '#a855f7',
    },
    {
      id: 'kpi-positions',
      title: 'Open Requisitions',
      value: String(totalOpenings),
      change: String(totalApplicants),
      isPositive: true,
      period: 'candidates screened',
      subtext: `${requisitions.length} active department requisitions`,
      icon: Briefcase,
      color: '#c084fc',
    },
    {
      id: 'kpi-projects',
      title: 'Active Projects',
      value: String(totalProjects),
      change: `${avgProgress}%`,
      isPositive: true,
      period: 'avg milestone progress',
      subtext: `${criticalProjects} high/critical priority initiatives`,
      icon: FolderKanban,
      color: '#6366f1',
    },
  ], [totalPipeline, closedWonDeals.length, opportunities.length, closedWonRevenue, weightedPipeline, totalOpenings, totalApplicants, requisitions.length, totalProjects, avgProgress, criticalProjects]);

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
              Executive Business Overview
            </h2>
            <p className="text-sm text-zinc-300 mt-1 max-w-2xl leading-relaxed">
              Active enterprise pipeline stands at <span className="text-purple-300 font-semibold font-mono">${(totalPipeline / 1000).toFixed(0)}k</span> across {opportunities.length} opportunities. 
              Managing <span className="text-purple-300 font-semibold font-mono">{totalOpenings} open positions</span> and <span className="text-emerald-400 font-semibold font-mono">{totalProjects} delivery initiatives</span> averaging {avgProgress}% completion.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('ai-assistant')}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-lg shadow-purple-900/40 border border-purple-400/40 transition-all duration-200 cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>Launch Agent Copilot</span>
            </button>
            <button
              onClick={() => onNavigate('crm')}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-zinc-300 bg-zinc-900/80 hover:bg-purple-950/40 hover:text-white rounded-xl border border-purple-500/20 transition-all duration-200 cursor-pointer"
            >
              <span>View Pipeline</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Dynamic KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dynamicKpis.map((metric, index) => (
          <MetricCard key={metric.id} metric={metric} index={index} />
        ))}
      </div>

      {/* Dynamic Revenue & Pipeline Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart opportunities={opportunities} />
        </div>
        <div className="lg:col-span-1">
          <PipelineOverview data={dynamicPipelineStages} />
        </div>
      </div>

      {/* Autonomous Operations Summary Strip */}
      <AutomationStatus />

      {/* Recent Activity Section */}
      <RecentActivity activities={DEMO_ACTIVITIES} />
    </div>
  );
};
