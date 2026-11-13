import type { ComponentType } from 'react';

export type NavigationTab = 
  | 'dashboard'
  | 'crm'
  | 'hrms'
  | 'projects'
  | 'analytics'
  | 'ai-assistant'
  | 'settings';

export interface NavItemConfig {
  id: NavigationTab;
  label: string;
  icon: ComponentType<{ className?: string; size?: number | string }>;
  badge?: string;
  description: string;
}

export interface KpiMetric {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  period: string;
  subtext: string;
  icon: ComponentType<{ className?: string; size?: number | string }>;
  color: string;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  projected: number;
  aiOptimized: number;
}

export type DealStage = 
  | 'Inquiry'
  | 'Qualified'
  | 'Demo Held'
  | 'Proposal'
  | 'Negotiation'
  | 'Closed Won';

export interface CrmOpportunity {
  id: string;
  company: string;
  contactPerson: string;
  email: string;
  dealValue: number;
  stage: DealStage;
  probability: string;
  owner: string;
  expectedCloseDate: string;
  createdAt: string;
}

export interface PipelineStage {
  stage: string;
  count: number;
  value: number;
  formattedValue: string;
  color: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  category: 'CRM' | 'HRMS' | 'PROJECTS' | 'AI_AGENT' | 'FINANCE';
  status: 'completed' | 'in_progress' | 'automated' | 'attention';
  actor: string;
}

export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';

export interface HrmsRequisition {
  id: string;
  role: string;
  department: string;
  employmentType: EmploymentType;
  openings: number;
  applicants: number;
  status: string;
  targetDate: string;
  description: string;
  createdAt: string;
}

export interface AutomationTask {
  id: string;
  name: string;
  module: string;
  lastRun: string;
  savedHours: number;
  status: 'active' | 'scheduled' | 'optimizing';
}

export type ProjectPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type ProjectStatus = 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'On Track' | 'Final Review';

export interface ProjectItem {
  id: string;
  name: string;
  team: string;
  manager?: string;
  description?: string;
  startDate?: string;
  due: string;
  priority?: ProjectPriority;
  status: ProjectStatus;
  progress: number;
  createdAt?: string;
}

export type NotificationCategory = 'CRM' | 'HRMS' | 'PROJECTS' | 'ANALYTICS' | 'AI_AGENT';

export interface CortexNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  module: NotificationCategory;
  targetTab: NavigationTab;
  read: boolean;
}
