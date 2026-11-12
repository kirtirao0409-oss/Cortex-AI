import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Layers, 
  Users, 
  FolderKanban, 
  RotateCw,
  Zap,
  Filter
} from 'lucide-react';
import { 
  INITIAL_CRM_OPPORTUNITIES, 
  DEMO_HRMS_ROLES, 
  DEMO_PROJECT_LIST, 
  DEMO_AUTOMATION_SUMMARY 
} from '../../data/mockData';
import type { CrmOpportunity, HrmsRequisition, ProjectItem, DealStage } from '../../types';
import { OpportunitiesStageChart } from '../analytics/OpportunitiesStageChart';
import { HrmsStatusChart } from '../analytics/HrmsStatusChart';
import { ProjectsStatusChart } from '../analytics/ProjectsStatusChart';
import { MonthlyTrendChart } from '../analytics/MonthlyTrendChart';

const CRM_KEY = 'cortex_crm_opportunities';
const HRMS_KEY = 'cortex_hrms_requisitions';
const PROJECTS_KEY = 'cortex_projects';

type ModuleFilter = 'all' | 'crm' | 'hrms' | 'projects';
type DateRangeFilter = 'all' | 'this-month' | '30d' | '90d';

const STAGE_ORDER: DealStage[] = [
  'Inquiry',
  'Qualified',
  'Demo Held',
  'Proposal',
  'Negotiation',
  'Closed Won'
];

const STAGE_COLORS: Record<DealStage, string> = {
  'Inquiry': '#6366f1',
  'Qualified': '#8b5cf6',
  'Demo Held': '#a855f7',
  'Proposal': '#c084fc',
  'Negotiation': '#e879f9',
  'Closed Won': '#22c55e',
};

const HRMS_STATUS_COLORS: Record<string, string> = {
  'Active': '#10b981',
  'Interviewing': '#a855f7',
  'Screening': '#818cf8',
  'Offer Stage': '#c084fc',
};

const PROJECT_STATUS_COLORS: Record<string, string> = {
  'On Track': '#10b981',
  'In Progress': '#8b5cf6',
  'Final Review': '#6366f1',
  'Planning': '#a855f7',
  'On Hold': '#f59e0b',
  'Completed': '#059669',
};

const MONTH_BUCKETS = [
  { label: 'Sep 26', key: '2026-09' },
  { label: 'Oct 26', key: '2026-10' },
  { label: 'Nov 26', key: '2026-11' },
  { label: 'Dec 26', key: '2026-12' },
  { label: 'Jan 27', key: '2027-01' },
];

const loadCrmData = (): CrmOpportunity[] => {
  try {
    const rawCrm = localStorage.getItem(CRM_KEY);
    if (rawCrm) {
      const parsed = JSON.parse(rawCrm);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingNames = new Set(parsed.map((item: any) => (item.company || '').toLowerCase().trim()));
        const missingInitial = INITIAL_CRM_OPPORTUNITIES.filter(
          (init) => !existingNames.has(init.company.toLowerCase().trim()) && !parsed.some((p: any) => p.id === init.id)
        );
        return missingInitial.length > 0 ? [...parsed, ...missingInitial] : parsed;
      }
    }
  } catch {}
  return INITIAL_CRM_OPPORTUNITIES;
};

const loadHrmsData = (): HrmsRequisition[] => {
  try {
    const rawHrms = localStorage.getItem(HRMS_KEY);
    if (rawHrms) {
      const parsed = JSON.parse(rawHrms);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEMO_HRMS_ROLES;
};

const loadProjectsData = (): ProjectItem[] => {
  try {
    const rawProjects = localStorage.getItem(PROJECTS_KEY);
    if (rawProjects) {
      const parsed = JSON.parse(rawProjects);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEMO_PROJECT_LIST;
};

export const AnalyticsView: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<ModuleFilter>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<DateRangeFilter>('all');
  const [opportunities, setOpportunities] = useState<CrmOpportunity[]>(loadCrmData);
  const [requisitions, setRequisitions] = useState<HrmsRequisition[]>(loadHrmsData);
  const [projects, setProjects] = useState<ProjectItem[]>(loadProjectsData);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync data from localStorage with initial mock fallbacks
  const loadAllData = useCallback(() => {
    setOpportunities(loadCrmData());
    setRequisitions(loadHrmsData());
    setProjects(loadProjectsData());
  }, []);

  useEffect(() => {
    // Listen to localStorage updates across tabs / window
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CRM_KEY || e.key === HRMS_KEY || e.key === PROJECTS_KEY) {
        loadAllData();
      }
    };

    // Re-sync on window focus
    const handleFocus = () => {
      loadAllData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadAllData]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    loadAllData();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  // Date range filter helper
  const isDateInRange = useCallback((dateStr: string | undefined): boolean => {
    if (selectedDateRange === 'all' || !dateStr) return true;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return true;

    // Anchor reference: mid-November 2026
    const anchor = new Date('2026-11-12T00:00:00').getTime();

    if (selectedDateRange === 'this-month') {
      return d.getFullYear() === 2026 && d.getMonth() === 10;
    }

    if (selectedDateRange === '30d') {
      const min = anchor - 30 * 24 * 60 * 60 * 1000;
      const max = anchor + 30 * 24 * 60 * 60 * 1000;
      return d.getTime() >= min && d.getTime() <= max;
    }

    if (selectedDateRange === '90d') {
      const min = anchor - 90 * 24 * 60 * 60 * 1000;
      const max = anchor + 90 * 24 * 60 * 60 * 1000;
      return d.getTime() >= min && d.getTime() <= max;
    }

    return true;
  }, [selectedDateRange]);

  // Filtered Datasets
  const filteredOpps = useMemo(() => {
    return opportunities.filter((o) => 
      isDateInRange(o.createdAt) || isDateInRange(o.expectedCloseDate)
    );
  }, [opportunities, isDateInRange]);

  const filteredReqs = useMemo(() => {
    return requisitions.filter((r) => 
      isDateInRange(r.createdAt) || isDateInRange(r.targetDate)
    );
  }, [requisitions, isDateInRange]);

  const filteredProjs = useMemo(() => {
    return projects.filter((p) => 
      isDateInRange(p.createdAt) || isDateInRange(p.startDate) || isDateInRange(p.due)
    );
  }, [projects, isDateInRange]);

  // Derived Metrics
  const crmMetrics = useMemo(() => {
    const totalPipeline = filteredOpps.reduce((sum, o) => sum + (Number(o.dealValue) || 0), 0);
    const closedWonOpps = filteredOpps.filter((o) => o.stage === 'Closed Won');
    const closedWonValue = closedWonOpps.reduce((sum, o) => sum + (Number(o.dealValue) || 0), 0);
    const count = filteredOpps.length;
    const winRate = count > 0 ? Math.round((closedWonOpps.length / count) * 100) : 0;
    const avgDeal = count > 0 ? Math.round(totalPipeline / count) : 0;

    return { totalPipeline, closedWonValue, count, winRate, avgDeal };
  }, [filteredOpps]);

  const hrmsMetrics = useMemo(() => {
    const totalCount = filteredReqs.length;
    const totalOpenings = filteredReqs.reduce((sum, r) => sum + (Number(r.openings) || 1), 0);
    const totalApplicants = filteredReqs.reduce((sum, r) => sum + (Number(r.applicants) || 0), 0);
    const activeCount = filteredReqs.filter((r) => 
      r.status === 'Active' || r.status === 'Interviewing' || r.status === 'Screening'
    ).length;

    return { totalCount, totalOpenings, totalApplicants, activeCount };
  }, [filteredReqs]);

  const projectsMetrics = useMemo(() => {
    const count = filteredProjs.length;
    const avgProgress = count > 0 
      ? Math.round(filteredProjs.reduce((sum, p) => sum + (Number(p.progress) || 0), 0) / count) 
      : 0;
    const onTrack = filteredProjs.filter((p) => 
      p.status === 'On Track' || p.status === 'Completed' || p.status === 'Final Review'
    ).length;
    const highPriority = filteredProjs.filter((p) => 
      p.priority === 'Critical' || p.priority === 'High'
    ).length;

    return { count, avgProgress, onTrack, highPriority };
  }, [filteredProjs]);

  // Chart 1: Opportunities by Stage
  const stageChartData = useMemo(() => {
    return STAGE_ORDER.map((stage) => {
      const match = filteredOpps.filter((o) => o.stage === stage);
      const totalVal = match.reduce((sum, o) => sum + (Number(o.dealValue) || 0), 0);
      return {
        stage,
        count: match.length,
        value: totalVal,
        formattedValue: `$${(totalVal / 1000).toFixed(0)}k`,
        color: STAGE_COLORS[stage],
      };
    });
  }, [filteredOpps]);

  // Chart 2: HRMS Requisitions by Status
  const hrmsStatusChartData = useMemo(() => {
    const uniqueStatuses = Array.from(
      new Set(filteredReqs.map((r) => r.status || 'Active'))
    );
    if (uniqueStatuses.length === 0) return [];

    return uniqueStatuses.map((status) => {
      const match = filteredReqs.filter((r) => (r.status || 'Active') === status);
      const applicants = match.reduce((sum, r) => sum + (Number(r.applicants) || 0), 0);
      return {
        status,
        count: match.length,
        applicants,
        color: HRMS_STATUS_COLORS[status] || '#a855f7',
      };
    });
  }, [filteredReqs]);

  // Chart 3: Projects by Status
  const projectStatusChartData = useMemo(() => {
    const uniqueStatuses = Array.from(
      new Set(filteredProjs.map((p) => p.status || 'In Progress'))
    );
    if (uniqueStatuses.length === 0) return [];

    return uniqueStatuses.map((status) => {
      const match = filteredProjs.filter((p) => (p.status || 'In Progress') === status);
      const avgProgress = match.length > 0 
        ? Math.round(match.reduce((sum, p) => sum + (Number(p.progress) || 0), 0) / match.length)
        : 0;
      return {
        status,
        count: match.length,
        avgProgress,
        color: PROJECT_STATUS_COLORS[status] || '#a855f7',
      };
    });
  }, [filteredProjs]);

  // Chart 4: Monthly Trajectory Trend
  const monthlyTrendData = useMemo(() => {
    return MONTH_BUCKETS.map(({ label, key }) => {
      const matchOpps = opportunities.filter((o) => 
        (o.createdAt && o.createdAt.startsWith(key)) || 
        (o.expectedCloseDate && o.expectedCloseDate.startsWith(key))
      );
      const valK = Math.round(matchOpps.reduce((sum, o) => sum + (Number(o.dealValue) || 0), 0) / 1000);

      const matchProjs = projects.filter((p) => 
        (p.createdAt && p.createdAt.startsWith(key)) || 
        (p.startDate && p.startDate.startsWith(key)) || 
        (p.due && p.due.startsWith(key))
      );

      return {
        month: label,
        pipelineValueK: valK,
        dealsCount: matchOpps.length,
        projectsCount: matchProjs.length,
      };
    });
  }, [opportunities, projects]);

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="p-6 rounded-2xl bg-[#121222]/80 backdrop-blur-xl border border-purple-500/15">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[10px] font-mono text-purple-300 bg-purple-950/60 rounded border border-purple-500/30">
                ENTERPRISE TELEMETRY
              </span>
              <span className="text-xs text-zinc-400">Live Computed Metrics Engine</span>
            </div>
            <h2 className="text-xl font-bold text-white">Platform Analytics & Intelligence</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live operational metrics calculated from actual CRM pipeline, HRMS talent intake, and Projects delivery.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Module Filter Pills */}
            <div className="flex items-center bg-zinc-900/90 p-1 rounded-xl border border-purple-500/20">
              <button
                type="button"
                onClick={() => setSelectedModule('all')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  selectedModule === 'all'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                All Modules
              </button>
              <button
                type="button"
                onClick={() => setSelectedModule('crm')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  selectedModule === 'crm'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                CRM
              </button>
              <button
                type="button"
                onClick={() => setSelectedModule('hrms')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  selectedModule === 'hrms'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                HRMS
              </button>
              <button
                type="button"
                onClick={() => setSelectedModule('projects')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  selectedModule === 'projects'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Projects
              </button>
            </div>

            {/* Date Range Selector */}
            <div className="flex items-center gap-1.5 bg-zinc-900/90 px-2.5 py-1 rounded-xl border border-purple-500/20 text-xs">
              <Filter className="w-3 h-3 text-purple-400" />
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value as DateRangeFilter)}
                className="bg-transparent text-zinc-300 text-xs focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#121222] text-white">All Time</option>
                <option value="this-month" className="bg-[#121222] text-white">This Month (Nov 2026)</option>
                <option value="30d" className="bg-[#121222] text-white">Next 30 Days</option>
                <option value="90d" className="bg-[#121222] text-white">Last 90 Days</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={handleManualRefresh}
              title="Refresh telemetry from storage"
              className="p-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-500/25 transition-all cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Analytics KPI Row - Derived From Actual Data */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: CRM Telemetry */}
        <div className="p-5 rounded-2xl bg-[#121222]/80 backdrop-blur-xl border border-purple-500/15 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-zinc-400">Total Pipeline Value</span>
              <span className="px-1.5 py-0.5 text-[9px] font-mono text-purple-300 bg-purple-950/60 rounded border border-purple-500/20">
                LIVE CRM
              </span>
            </div>
            <span className="text-3xl font-extrabold text-white font-mono block">
              ${crmMetrics.totalPipeline.toLocaleString()}
            </span>
          </div>
          <div className="pt-2 border-t border-purple-500/10 mt-3 text-xs text-zinc-400 flex items-center justify-between">
            <span>{crmMetrics.count} active {crmMetrics.count === 1 ? 'deal' : 'deals'}</span>
            <span className="text-emerald-400 font-mono font-semibold">
              ${(crmMetrics.closedWonValue / 1000).toFixed(0)}k Won
            </span>
          </div>
        </div>

        {/* Card 2: HRMS Telemetry */}
        <div className="p-5 rounded-2xl bg-[#121222]/80 backdrop-blur-xl border border-purple-500/15 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-zinc-400">Talent Sourcing & Screened</span>
              <span className="px-1.5 py-0.5 text-[9px] font-mono text-emerald-300 bg-emerald-950/60 rounded border border-emerald-500/20">
                LIVE HRMS
              </span>
            </div>
            <span className="text-3xl font-extrabold text-purple-300 font-mono block">
              {hrmsMetrics.totalApplicants.toLocaleString()}
            </span>
          </div>
          <div className="pt-2 border-t border-purple-500/10 mt-3 text-xs text-zinc-400 flex items-center justify-between">
            <span>{hrmsMetrics.totalOpenings} open {hrmsMetrics.totalOpenings === 1 ? 'position' : 'positions'}</span>
            <span className="text-zinc-300 font-mono">
              {hrmsMetrics.totalCount} {hrmsMetrics.totalCount === 1 ? 'requisition' : 'requisitions'}
            </span>
          </div>
        </div>

        {/* Card 3: Projects Telemetry */}
        <div className="p-5 rounded-2xl bg-[#121222]/80 backdrop-blur-xl border border-purple-500/15 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-zinc-400">Initiatives Delivery Health</span>
              <span className="px-1.5 py-0.5 text-[9px] font-mono text-indigo-300 bg-indigo-950/60 rounded border border-indigo-500/20">
                LIVE PROJECTS
              </span>
            </div>
            <span className="text-3xl font-extrabold text-emerald-400 font-mono block">
              {projectsMetrics.avgProgress}%
            </span>
          </div>
          <div className="pt-2 border-t border-purple-500/10 mt-3 text-xs text-zinc-400 flex items-center justify-between">
            <span>{projectsMetrics.onTrack} on-track velocity</span>
            <span className="text-zinc-300 font-mono">
              {projectsMetrics.count} active {projectsMetrics.count === 1 ? 'initiative' : 'initiatives'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="space-y-6">
        {/* Full-width Monthly Trend Chart */}
        {(selectedModule === 'all' || selectedModule === 'crm' || selectedModule === 'projects') && (
          <MonthlyTrendChart data={monthlyTrendData} />
        )}

        {/* Dynamic Multi-Chart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Opportunities by Stage Chart */}
          {(selectedModule === 'all' || selectedModule === 'crm') && (
            <OpportunitiesStageChart data={stageChartData} />
          )}

          {/* HRMS Requisitions by Status Chart */}
          {(selectedModule === 'all' || selectedModule === 'hrms') && (
            <HrmsStatusChart data={hrmsStatusChartData} />
          )}

          {/* Projects by Status Chart */}
          {(selectedModule === 'all' || selectedModule === 'projects') && (
            <ProjectsStatusChart data={projectStatusChartData} />
          )}

          {/* Focused Module Summary Card (When single module is selected) */}
          {selectedModule === 'crm' && (
            <div className="rounded-2xl bg-[#121222]/80 backdrop-blur-xl border border-purple-500/15 p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white">CRM Conversion Dynamics</h3>
                </div>
                <p className="text-xs text-zinc-400 mb-4">
                  Autonomous win-rate pacing and deal sizing derived from live opportunities.
                </p>
                <div className="grid grid-cols-2 gap-3.5 pt-2">
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-purple-500/10">
                    <span className="text-[11px] text-zinc-400 block mb-0.5">Win Rate Conversion</span>
                    <span className="text-xl font-bold font-mono text-emerald-400">{crmMetrics.winRate}%</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-purple-500/10">
                    <span className="text-[11px] text-zinc-400 block mb-0.5">Average Deal Size</span>
                    <span className="text-xl font-bold font-mono text-white">${crmMetrics.avgDeal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-purple-500/10 text-[11px] text-zinc-400 font-mono mt-4">
                Total Closed Won: ${crmMetrics.closedWonValue.toLocaleString()} across {filteredOpps.filter(o => o.stage === 'Closed Won').length} accounts
              </div>
            </div>
          )}

          {selectedModule === 'hrms' && (
            <div className="rounded-2xl bg-[#121222]/80 backdrop-blur-xl border border-purple-500/15 p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white">Talent Intake Velocity</h3>
                </div>
                <p className="text-xs text-zinc-400 mb-4">
                  Autonomous talent extraction efficiency and opening coverage.
                </p>
                <div className="grid grid-cols-2 gap-3.5 pt-2">
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-purple-500/10">
                    <span className="text-[11px] text-zinc-400 block mb-0.5">Active Requisitions</span>
                    <span className="text-xl font-bold font-mono text-purple-300">{hrmsMetrics.activeCount}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-purple-500/10">
                    <span className="text-[11px] text-zinc-400 block mb-0.5">Candidates per Opening</span>
                    <span className="text-xl font-bold font-mono text-white">
                      {hrmsMetrics.totalOpenings > 0 
                        ? (hrmsMetrics.totalApplicants / hrmsMetrics.totalOpenings).toFixed(1) 
                        : '0'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-purple-500/10 text-[11px] text-zinc-400 font-mono mt-4">
                Screening active across {filteredReqs.length} department pipelines
              </div>
            </div>
          )}

          {selectedModule === 'projects' && (
            <div className="rounded-2xl bg-[#121222]/80 backdrop-blur-xl border border-purple-500/15 p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FolderKanban className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white">Delivery Velocity & Priority Health</h3>
                </div>
                <p className="text-xs text-zinc-400 mb-4">
                  Sprint velocity and high-priority blocker mitigation telemetry.
                </p>
                <div className="grid grid-cols-2 gap-3.5 pt-2">
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-purple-500/10">
                    <span className="text-[11px] text-zinc-400 block mb-0.5">On-Track Initiatives</span>
                    <span className="text-xl font-bold font-mono text-emerald-400">{projectsMetrics.onTrack}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-purple-500/10">
                    <span className="text-[11px] text-zinc-400 block mb-0.5">Critical/High Priority</span>
                    <span className="text-xl font-bold font-mono text-amber-400">{projectsMetrics.highPriority}</span>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-purple-500/10 text-[11px] text-zinc-400 font-mono mt-4">
                Autonomous velocity tracking enabled on all {filteredProjs.length} initiatives
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Autonomous Workflows Section - Explicitly Labeled as Sample Benchmark (Req #8) */}
      <div className="rounded-2xl bg-[#121222]/80 backdrop-blur-xl border border-purple-500/15 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">Autonomous Workflows Telemetry</h3>
            <span className="px-2 py-0.5 text-[9px] font-mono text-purple-300 bg-purple-950/80 rounded border border-purple-500/25">
              Sample AI Benchmark
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            * Simulated enterprise baselines (not backed by live execution database)
          </span>
        </div>

        <div className="space-y-3">
          {DEMO_AUTOMATION_SUMMARY.map((auto) => (
            <div 
              key={auto.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/40 border border-purple-500/10 text-xs hover:border-purple-500/20 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-950/60 border border-purple-500/20 text-purple-300">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{auto.name}</h4>
                  <span className="text-zinc-400 text-[11px] font-mono">
                    Module: {auto.module} • Last cycle: {auto.lastRun}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-purple-300 font-bold block">
                  {auto.savedHours} hrs estimated
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold uppercase font-mono">
                  {auto.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
