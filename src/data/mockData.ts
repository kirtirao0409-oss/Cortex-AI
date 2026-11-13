import { 
  DollarSign, 
  UserCheck, 
  Briefcase, 
  FolderKanban 
} from 'lucide-react';
import type { 
  KpiMetric, 
  MonthlyRevenue, 
  PipelineStage, 
  ActivityItem, 
  AutomationTask,
  CrmOpportunity,
  HrmsRequisition,
  ProjectItem,
  CortexNotification 
} from '../types';

/**
 * [PROTOTYPE DEMO DATA]
 * Note: These values are temporary visual mocks designed for Phase 1 dashboard layout & visualization.
 * No live backend, database, or LLM connection is claimed.
 */

export const DEMO_KPIS: KpiMetric[] = [
  {
    id: 'kpi-revenue',
    title: 'Total Revenue',
    value: '$1,284,500',
    change: '+14.8%',
    isPositive: true,
    period: 'vs. last month',
    subtext: '$184k generated via automated upsell triggers',
    icon: DollarSign,
    color: '#a855f7', // purple-500
  },
  {
    id: 'kpi-leads',
    title: 'Active Leads',
    value: '342',
    change: '+22.4%',
    isPositive: true,
    period: 'vs. last month',
    subtext: '86 hot leads auto-scored & prioritized',
    icon: UserCheck,
    color: '#8b5cf6', // violet-500
  },
  {
    id: 'kpi-positions',
    title: 'Open Positions',
    value: '18',
    change: '-3',
    isPositive: true, // filled positions
    period: '4 closed this month',
    subtext: '142 candidates screened by intake agent',
    icon: Briefcase,
    color: '#c084fc', // purple-400
  },
  {
    id: 'kpi-projects',
    title: 'Active Projects',
    value: '24',
    change: '92%',
    isPositive: true,
    period: 'on-schedule health',
    subtext: '6 sprints currently executing with automated tracking',
    icon: FolderKanban,
    color: '#6366f1', // indigo-500
  },
];

export const DEMO_REVENUE_CHART: MonthlyRevenue[] = [
  { month: 'Jun', revenue: 780000, projected: 750000, aiOptimized: 110000 },
  { month: 'Jul', revenue: 840000, projected: 820000, aiOptimized: 135000 },
  { month: 'Aug', revenue: 920000, projected: 890000, aiOptimized: 160000 },
  { month: 'Sep', revenue: 1040000, projected: 990000, aiOptimized: 195000 },
  { month: 'Oct', revenue: 1160000, projected: 1120000, aiOptimized: 230000 },
  { month: 'Nov', revenue: 1284500, projected: 1210000, aiOptimized: 284000 },
];

export const DEMO_PIPELINE: PipelineStage[] = [
  { stage: 'Inquiry', count: 148, value: 340000, formattedValue: '$340k', color: '#6366f1' },
  { stage: 'Qualified', count: 86, value: 520000, formattedValue: '$520k', color: '#8b5cf6' },
  { stage: 'Demo Held', count: 54, value: 480000, formattedValue: '$480k', color: '#a855f7' },
  { stage: 'Proposal', count: 32, value: 390000, formattedValue: '$390k', color: '#c084fc' },
  { stage: 'Negotiation', count: 14, value: 245000, formattedValue: '$245k', color: '#e879f9' },
  { stage: 'Closed Won', count: 8, value: 164000, formattedValue: '$164k', color: '#22c55e' },
];

export const DEMO_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    title: 'Enterprise Lead Auto-Qualified',
    description: 'Vertex Cloud qualified as Tier-1 ($140k ARR). Dispatched intake briefing to Account Executive.',
    timestamp: '12 min ago',
    category: 'CRM',
    status: 'automated',
    actor: 'Cortex CRM Agent',
  },
  {
    id: 'act-2',
    title: 'Candidate Screening Completed',
    description: '14 resumes processed for Staff Platform Engineer. 3 top candidates scheduled for interview.',
    timestamp: '34 min ago',
    category: 'HRMS',
    status: 'completed',
    actor: 'Cortex Talent Agent',
  },
  {
    id: 'act-3',
    title: 'Sprint Scope Variance Detected',
    description: 'Project "Nexus Gateway" flagged 8% velocity drop. Suggested task re-allocation to stay on target.',
    timestamp: '1 hr ago',
    category: 'PROJECTS',
    status: 'attention',
    actor: 'Cortex PM Agent',
  },
  {
    id: 'act-4',
    title: 'Monthly Revenue Reconciled',
    description: 'Autonomous reconciliation matched 312 invoices across Stripe & ERP ledger with zero discrepancies.',
    timestamp: '3 hrs ago',
    category: 'FINANCE',
    status: 'automated',
    actor: 'Finance Automation Core',
  },
  {
    id: 'act-5',
    title: 'SaaS Renewal Notice Dispatched',
    description: 'Personalized renewal sequence and contract uplift proposal sent to 12 Enterprise accounts.',
    timestamp: '5 hrs ago',
    category: 'CRM',
    status: 'completed',
    actor: 'Lifecycle Agent',
  },
];

export const DEMO_AUTOMATION_SUMMARY: AutomationTask[] = [
  {
    id: 'auto-1',
    name: 'Lead Enrichment & ICP Verification',
    module: 'CRM',
    lastRun: '10 mins ago',
    savedHours: 42.5,
    status: 'active',
  },
  {
    id: 'auto-2',
    name: 'Applicant Resume Extraction & Scoring',
    module: 'HRMS',
    lastRun: '28 mins ago',
    savedHours: 28.0,
    status: 'active',
  },
  {
    id: 'auto-3',
    name: 'Sprint Burn-down & Blocker Identification',
    module: 'Projects',
    lastRun: '1 hour ago',
    savedHours: 19.5,
    status: 'active',
  },
  {
    id: 'auto-4',
    name: 'Executive Revenue Forecast Generation',
    module: 'Analytics',
    lastRun: '3 hours ago',
    savedHours: 14.0,
    status: 'scheduled',
  },
];

export const DEMO_CRM_DEALS = [
  { company: 'Hyperion Networks', dealSize: '$180,000', stage: 'Negotiation', probability: '85%', owner: 'Sarah Chen' },
  { company: 'Aether Data Labs', dealSize: '$125,000', stage: 'Proposal', probability: '70%', owner: 'Marcus Vance' },
  { company: 'OmniGlobal Retail', dealSize: '$95,000', stage: 'Demo Held', probability: '60%', owner: 'Elena Rostova' },
  { company: 'Pulse Health Systems', dealSize: '$210,000', stage: 'Proposal', probability: '75%', owner: 'David Kim' },
];

export const INITIAL_CRM_OPPORTUNITIES: CrmOpportunity[] = [
  {
    id: 'opp-1',
    company: 'Hyperion Networks',
    contactPerson: 'Jonathan Vance',
    email: 'j.vance@hyperion.net',
    dealValue: 180000,
    stage: 'Negotiation',
    probability: '85%',
    owner: 'Sarah Chen',
    expectedCloseDate: '2026-11-28',
    createdAt: '2026-10-15',
  },
  {
    id: 'opp-2',
    company: 'Aether Data Labs',
    contactPerson: 'Dr. Aris Thorne',
    email: 'athorne@aetherlabs.io',
    dealValue: 125000,
    stage: 'Proposal',
    probability: '70%',
    owner: 'Marcus Vance',
    expectedCloseDate: '2026-12-05',
    createdAt: '2026-10-22',
  },
  {
    id: 'opp-3',
    company: 'OmniGlobal Retail',
    contactPerson: 'Claire Beauchamp',
    email: 'claire@omniglobal.com',
    dealValue: 95000,
    stage: 'Demo Held',
    probability: '60%',
    owner: 'Elena Rostova',
    expectedCloseDate: '2026-12-18',
    createdAt: '2026-11-01',
  },
  {
    id: 'opp-4',
    company: 'Pulse Health Systems',
    contactPerson: 'Dr. Robert Chen',
    email: 'rchen@pulsehealth.org',
    dealValue: 210000,
    stage: 'Proposal',
    probability: '75%',
    owner: 'David Kim',
    expectedCloseDate: '2026-11-30',
    createdAt: '2026-10-18',
  },
  {
    id: 'opp-5',
    company: 'Vertex Cloud Solutions',
    contactPerson: 'Marcus Brody',
    email: 'mbrody@vertexcloud.io',
    dealValue: 140000,
    stage: 'Qualified',
    probability: '45%',
    owner: 'Sarah Chen',
    expectedCloseDate: '2026-12-20',
    createdAt: '2026-11-05',
  },
  {
    id: 'opp-6',
    company: 'Nova Robotics',
    contactPerson: 'Evelyn Reed',
    email: 'ereed@novarobotics.tech',
    dealValue: 320000,
    stage: 'Closed Won',
    probability: '100%',
    owner: 'David Kim',
    expectedCloseDate: '2026-11-10',
    createdAt: '2026-09-30',
  },
  {
    id: 'opp-7',
    company: 'Apex Logistics Global',
    contactPerson: 'Samuel Drake',
    email: 'sdrake@apexlog.com',
    dealValue: 85000,
    stage: 'Inquiry',
    probability: '25%',
    owner: 'Elena Rostova',
    expectedCloseDate: '2027-01-15',
    createdAt: '2026-11-08',
  },
];

export const DEMO_HRMS_ROLES: HrmsRequisition[] = [
  { 
    id: 'req-1',
    role: 'Senior AI Research Engineer', 
    department: 'Applied Intelligence', 
    employmentType: 'Full-time',
    openings: 2,
    applicants: 48, 
    status: 'Interviewing', 
    targetDate: '2026-12-01',
    description: 'Lead research into autonomous agent coordination and real-time LLM inference pipelines.',
    createdAt: '2026-11-01'
  },
  { 
    id: 'req-2',
    role: 'Lead Solutions Architect', 
    department: 'Enterprise Sales', 
    employmentType: 'Full-time',
    openings: 1,
    applicants: 32, 
    status: 'Screening', 
    targetDate: '2026-12-15',
    description: 'Bridge customer architecture with Cortex enterprise automation nodes and on-prem connectors.',
    createdAt: '2026-11-04'
  },
  { 
    id: 'req-3',
    role: 'Staff Frontend Engineer', 
    department: 'Core Product', 
    employmentType: 'Full-time',
    openings: 1,
    applicants: 56, 
    status: 'Offer Stage', 
    targetDate: '2026-11-25',
    description: 'Architect low-latency UI interfaces, high-density telemetry dashboards, and interactive agent canvases.',
    createdAt: '2026-10-28'
  },
  { 
    id: 'req-4',
    role: 'Operations & Compliance Lead', 
    department: 'Legal & Ops', 
    employmentType: 'Full-time',
    openings: 1,
    applicants: 19, 
    status: 'Interviewing', 
    targetDate: '2026-12-10',
    description: 'Ensure SOC2 Type II compliance, audit logging integrity, and autonomous agent safety guardrails.',
    createdAt: '2026-11-06'
  },
];

export const DEMO_PROJECT_LIST: ProjectItem[] = [
  { 
    id: 'proj-1',
    name: 'Autonomous CRM Sync v2.4', 
    progress: 88, 
    status: 'On Track', 
    due: '2026-11-20', 
    team: 'Core Agent Team',
    manager: 'Alex Mercer',
    description: 'High-frequency bi-directional synchronization between CRM leads and Autonomous scoring pipeline.',
    startDate: '2026-10-15',
    priority: 'Critical',
    createdAt: '2026-10-15'
  },
  { 
    id: 'proj-2',
    name: 'Enterprise SSO & RBAC Engine', 
    progress: 95, 
    status: 'Final Review', 
    due: '2026-11-16', 
    team: 'Security & Auth',
    manager: 'Sarah Chen',
    description: 'SAML 2.0 and OIDC federation with enterprise identity providers and granular role-based policy guardrails.',
    startDate: '2026-10-01',
    priority: 'High',
    createdAt: '2026-10-01'
  },
  { 
    id: 'proj-3',
    name: 'Real-time Telemetry Pipeline', 
    progress: 64, 
    status: 'In Progress', 
    due: '2026-12-05', 
    team: 'Data Infrastructure',
    manager: 'David Kim',
    description: 'Sub-second event bus ingest engine for live operational monitoring and trace telemetry.',
    startDate: '2026-10-20',
    priority: 'Medium',
    createdAt: '2026-10-20'
  },
  { 
    id: 'proj-4',
    name: 'Applicant Tracking Automated Parser', 
    progress: 42, 
    status: 'On Track', 
    due: '2026-12-12', 
    team: 'HR Technology',
    manager: 'Elena Rostova',
    description: 'Semantic vector parsing of candidate resumes with instant automated interview slot scheduling.',
    startDate: '2026-11-01',
    priority: 'Medium',
    createdAt: '2026-11-01'
  },
];

export const INITIAL_NOTIFICATIONS: CortexNotification[] = [
  {
    id: 'notif-1',
    title: 'New CRM Opportunity Added',
    message: 'Apex Logistics Global ($85,000) was qualified and registered into the active sales pipeline.',
    timestamp: '10 min ago',
    module: 'CRM',
    targetTab: 'crm',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'HRMS Candidate Pipeline Updated',
    message: '14 candidate profiles screened for Staff AI Platform Engineer with 3 top candidates advancing.',
    timestamp: '25 min ago',
    module: 'HRMS',
    targetTab: 'hrms',
    read: false,
  },
  {
    id: 'notif-3',
    title: 'Project Status Changed',
    message: 'Autonomous ETL Pipeline advanced from Planning to In Progress (55% milestone achieved).',
    timestamp: '1 hr ago',
    module: 'PROJECTS',
    targetTab: 'projects',
    read: false,
  },
  {
    id: 'notif-4',
    title: 'Analytics Report Updated',
    message: 'Executive platform metrics and monthly revenue conversion telemetry were recalculated.',
    timestamp: '2 hrs ago',
    module: 'ANALYTICS',
    targetTab: 'analytics',
    read: false,
  },
  {
    id: 'notif-5',
    title: 'AI Workflow Completed',
    message: 'Autonomous lead enrichment & executive summary generated successfully for Tier-1 accounts.',
    timestamp: '3 hrs ago',
    module: 'AI_AGENT',
    targetTab: 'ai-assistant',
    read: true,
  },
];
