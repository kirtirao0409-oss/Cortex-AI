import React, { useState } from 'react';
import { 
  UserPlus, 
  CheckCircle2, 
  Sparkles,
  Trash2,
  Users
} from 'lucide-react';
import { DEMO_HRMS_ROLES } from '../../data/mockData';
import type { HrmsRequisition } from '../../types';
import { RequisitionModal } from '../hrms/RequisitionModal';

const STORAGE_KEY = 'cortex_hrms_requisitions';

const loadRequisitions = (): HrmsRequisition[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load requisitions from localStorage', e);
  }
  return DEMO_HRMS_ROLES;
};

const formatTargetDate = (dateStr: string): string => {
  if (!dateStr) return '';
  if (dateStr.includes('-')) {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }
  return dateStr;
};

export const HrmsView: React.FC = () => {
  const [requisitions, setRequisitions] = useState<HrmsRequisition[]>(loadRequisitions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const handleCreateRequisition = (
    data: Omit<HrmsRequisition, 'id' | 'applicants' | 'status' | 'createdAt'>
  ) => {
    const newRequisition: HrmsRequisition = {
      ...data,
      id: `req-${Date.now()}`,
      applicants: 0,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updated = [newRequisition, ...requisitions];
    setRequisitions(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }

    setNotification(`Requisition for "${newRequisition.role}" created successfully.`);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleDeleteRequisition = (id: string, roleName: string) => {
    const updated = requisitions.filter((r) => (r.id ? r.id !== id : r.role !== id));
    setRequisitions(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update localStorage', e);
    }
    setNotification(`Requisition for "${roleName}" removed.`);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#121222]/80 backdrop-blur-xl border border-purple-500/15">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-mono text-purple-300 bg-purple-950/60 rounded border border-purple-500/30">
              TALENT INTELLIGENCE
            </span>
            <span className="text-xs text-zinc-400">Autonomous Sourcing & Screening</span>
          </div>
          <h2 className="text-xl font-bold text-white">HRMS & Open Requisitions</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Automated resume parsing, intake scoring, and interview scheduling workflows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-md shadow-purple-950/50 transition-all cursor-pointer hover:border-purple-400/40 border border-purple-500/30"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Open Requisition</span>
          </button>
        </div>
      </div>

      {/* Notification Toast Banner */}
      {notification && (
        <div className="flex items-center justify-between p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 backdrop-blur-md animate-fade-in shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setNotification(null)}
            className="text-emerald-400 hover:text-emerald-200 text-xs cursor-pointer font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Requisitions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requisitions.map((role) => (
          <div 
            key={role.id || role.role}
            className="p-5 rounded-2xl bg-[#121222]/80 backdrop-blur-xl border border-purple-500/15 hover:border-purple-500/30 transition-all shadow-lg flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono text-purple-300/80 uppercase">
                      {role.department}
                    </span>
                    {role.employmentType && (
                      <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-purple-950/80 text-purple-300 border border-purple-500/25 uppercase font-mono">
                        {role.employmentType}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-purple-200 transition-colors">
                    {role.role}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`px-2.5 py-0.5 text-[10px] font-medium rounded-full border ${
                    role.status === 'Active' || role.status === 'Open'
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                      : 'bg-purple-900/40 text-purple-200 border border-purple-500/25'
                  }`}>
                    {role.status}
                  </span>
                  {role.id && role.id.startsWith('req-') && (
                    <button
                      type="button"
                      title="Delete Requisition"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRequisition(role.id, role.role);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {role.description && (
                <p className="text-xs text-zinc-400 mb-3 line-clamp-2 leading-relaxed">
                  {role.description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-purple-500/10 text-xs mt-2">
              <div className="flex items-center gap-2 text-zinc-400">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>
                  <strong className="text-white font-mono">{role.applicants}</strong> applicants screened
                </span>
                {role.openings && (
                  <span className="text-zinc-500 text-[11px] font-mono flex items-center gap-1">
                    • <Users className="w-3 h-3 text-zinc-500 inline" /> {role.openings} {role.openings === 1 ? 'opening' : 'openings'}
                  </span>
                )}
              </div>
              <span className="text-zinc-500 text-[11px] font-mono">
                Target: {formatTargetDate(role.targetDate)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Autonomous Recruiter Status */}
      <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/15 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>
            Talent Intake Agent: <strong className="text-white">Active</strong> — {requisitions.length} open {requisitions.length === 1 ? 'requisition' : 'requisitions'} monitored with automated semantic skill extraction.
          </span>
        </div>
        <span className="font-mono text-purple-300 text-[11px]">Cortex Talent Core v2.4</span>
      </div>

      {/* Requisition Modal */}
      <RequisitionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateRequisition}
      />
    </div>
  );
};
