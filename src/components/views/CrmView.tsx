import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Search, 
  Pencil, 
  Trash2, 
  CheckCircle2, 
  X, 
  Calendar, 
  Sparkles 
} from 'lucide-react';
import { OpportunityModal } from '../crm/OpportunityModal';
import { DeleteConfirmModal } from '../crm/DeleteConfirmModal';
import { INITIAL_CRM_OPPORTUNITIES } from '../../data/mockData';
import type { CrmOpportunity, DealStage, PipelineStage } from '../../types';

const STORAGE_KEY = 'cortex_crm_opportunities';

const STAGE_CONFIG: Record<DealStage, { color: string; probability: string }> = {
  'Inquiry': { color: '#6366f1', probability: '25%' },
  'Qualified': { color: '#8b5cf6', probability: '45%' },
  'Demo Held': { color: '#a855f7', probability: '60%' },
  'Proposal': { color: '#c084fc', probability: '75%' },
  'Negotiation': { color: '#e879f9', probability: '85%' },
  'Closed Won': { color: '#22c55e', probability: '100%' },
};

const STAGES_LIST: DealStage[] = [
  'Inquiry',
  'Qualified',
  'Demo Held',
  'Proposal',
  'Negotiation',
  'Closed Won'
];

const formatCurrency = (val: number): string => {
  if (isNaN(val)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val);
};

const formatStageValue = (val: number): string => {
  if (isNaN(val) || val <= 0) return '$0';
  if (val >= 1000000) {
    return `$${(val / 1000000).toFixed(2)}M`;
  }
  if (val >= 1000) {
    return `$${(val / 1000).toFixed(0)}k`;
  }
  return `$${val}`;
};

// Safe record normalizer to prevent runtime errors from legacy or incomplete localStorage data
const normalizeOpportunity = (
  opp: Partial<CrmOpportunity> & { dealSize?: string },
  index: number
): CrmOpportunity => {
  const dealValue = typeof opp.dealValue === 'number'
    ? opp.dealValue
    : typeof opp.dealSize === 'string'
      ? parseFloat(opp.dealSize.replace(/[^0-9.]/g, '')) || 0
      : 0;

  const stage: DealStage = STAGES_LIST.includes(opp.stage as DealStage)
    ? (opp.stage as DealStage)
    : 'Qualified';

  return {
    id: opp.id || `opp-${index}-${Date.now()}`,
    company: opp.company || 'Unnamed Account',
    contactPerson: opp.contactPerson || 'Lead Contact',
    email: opp.email || 'contact@enterprise.com',
    dealValue,
    stage,
    probability: opp.probability || (STAGE_CONFIG[stage]?.probability || '50%'),
    owner: opp.owner || 'Sarah Chen',
    expectedCloseDate: opp.expectedCloseDate || new Date().toISOString().split('T')[0],
    createdAt: opp.createdAt || new Date().toISOString().split('T')[0],
  };
};

interface NotificationState {
  id: number;
  message: string;
  type: 'success' | 'info';
}

export const CrmView: React.FC = () => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 1. Opportunities State with localStorage persistence & robust schema normalization
  const [opportunities, setOpportunities] = useState<CrmOpportunity[]>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const normalized = parsed.map((item, idx) => normalizeOpportunity(item, idx));
            const existingNames = new Set(normalized.map((o) => (o.company || '').toLowerCase().trim()));
            const missingInitial = INITIAL_CRM_OPPORTUNITIES.filter(
              (init) => !existingNames.has(init.company.toLowerCase().trim()) && !normalized.some((n) => n.id === init.id)
            );
            if (missingInitial.length > 0) {
              const merged = [...normalized, ...missingInitial];
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
              } catch {}
              return merged;
            }
            return normalized;
          }
        }
      }
    } catch (e) {
      console.error('Failed to parse saved CRM opportunities:', e);
    }
    return INITIAL_CRM_OPPORTUNITIES;
  });

  // Save to localStorage whenever records change and notify other components
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(opportunities));
        window.dispatchEvent(new CustomEvent('cortex_data_change', { detail: { key: STORAGE_KEY } }));
      }
    } catch (e) {
      console.error('Failed to save CRM opportunities:', e);
    }
  }, [opportunities]);

  // Keyboard shortcut listener: "/" to focus CRM table search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 2. Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('ALL');

  // 3. Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<CrmOpportunity | null>(null);

  // 4. Delete Confirmation State
  const [deletingOpportunity, setDeletingOpportunity] = useState<CrmOpportunity | null>(null);

  // 5. Notification Toast State
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    const id = Date.now();
    setNotification({ id, message, type });
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // 6. Dynamic Pipeline Statistics Calculation (safe against NaN / undefined values)
  const pipelineStages: PipelineStage[] = useMemo(() => {
    return STAGES_LIST.map((stage) => {
      const stageDeals = opportunities.filter((o) => o.stage === stage);
      const count = stageDeals.length;
      const value = stageDeals.reduce((acc, curr) => acc + (curr.dealValue || 0), 0);
      return {
        stage,
        count,
        value,
        formattedValue: formatStageValue(value),
        color: STAGE_CONFIG[stage]?.color || '#9333ea',
      };
    });
  }, [opportunities]);

  const totalPipelineValue = useMemo(() => {
    return opportunities.reduce((acc, curr) => acc + (curr.dealValue || 0), 0);
  }, [opportunities]);

  // 7. Filtered Opportunities with safe optional-chaining and fallbacks
  const filteredOpportunities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return opportunities.filter((opp) => {
      const matchesStage = selectedStageFilter === 'ALL' || opp.stage === selectedStageFilter;
      if (!matchesStage) return false;

      if (!query) return true;

      const inCompany = (opp.company || '').toLowerCase().includes(query);
      const inContact = (opp.contactPerson || '').toLowerCase().includes(query);
      const inEmail = (opp.email || '').toLowerCase().includes(query);
      const inOwner = (opp.owner || '').toLowerCase().includes(query);
      const inStage = (opp.stage || '').toLowerCase().includes(query);
      return inCompany || inContact || inEmail || inOwner || inStage;
    });
  }, [opportunities, searchQuery, selectedStageFilter]);

  // 8. Create or Update Handler
  const handleSaveOpportunity = (data: Omit<CrmOpportunity, 'id' | 'createdAt' | 'probability'> & { id?: string }) => {
    const calculatedProbability = STAGE_CONFIG[data.stage]?.probability || '50%';

    if (data.id) {
      // Edit existing
      setOpportunities((prev) =>
        prev.map((item) =>
          item.id === data.id
            ? {
                ...item,
                ...data,
                probability: calculatedProbability,
              }
            : item
        )
      );
      showNotification(`Opportunity for "${data.company}" updated successfully!`);
    } else {
      // Create new
      const newOpportunity: CrmOpportunity = {
        id: `opp-${Date.now()}`,
        company: data.company,
        contactPerson: data.contactPerson,
        email: data.email,
        dealValue: data.dealValue,
        stage: data.stage,
        probability: calculatedProbability,
        owner: data.owner,
        expectedCloseDate: data.expectedCloseDate,
        createdAt: new Date().toISOString().split('T')[0],
      };

      setOpportunities((prev) => [newOpportunity, ...prev]);
      showNotification(
        `Opportunity for "${data.company}" (${formatCurrency(data.dealValue)}) created successfully!`
      );
    }
  };

  // 9. Delete Handler
  const handleConfirmDelete = () => {
    if (!deletingOpportunity) return;
    const companyName = deletingOpportunity.company;
    setOpportunities((prev) => prev.filter((item) => item.id !== deletingOpportunity.id));
    showNotification(`Opportunity for "${companyName}" removed from pipeline.`, 'info');
    setDeletingOpportunity(null);
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#141226]/95 border border-purple-500/40 shadow-2xl shadow-purple-950/80 backdrop-blur-xl text-white max-w-md pointer-events-auto"
          >
            <div className={`p-1.5 rounded-lg ${notification.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-300'}`}>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-semibold block">{notification.type === 'success' ? 'CRM Action Completed' : 'Pipeline Updated'}</span>
              <span className="text-zinc-300">{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="p-1 text-zinc-400 hover:text-white rounded ml-2 cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#121222]/80 backdrop-blur-xl border border-purple-500/15">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-mono text-purple-300 bg-purple-950/60 rounded border border-purple-500/30">
              CRM CORE
            </span>
            <span className="text-xs text-zinc-400">Autonomous Deal Intake & Routing</span>
          </div>
          <h2 className="text-xl font-bold text-white">Enterprise Deal Flow & Pipeline</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time lead qualification, automated enrichment, and probability forecasts ({opportunities.length} active opportunities, {formatCurrency(totalPipelineValue)} total value).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => {
              setEditingOpportunity(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-purple-900/40 border border-purple-400/30 transition-all cursor-pointer text-center"
          >
            <span>New Opportunity</span>
          </button>
        </div>
      </div>

      {/* Stage Cards summary (Dynamically calculated based on opportunities) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {pipelineStages.map((stage) => {
          const isSelected = selectedStageFilter === stage.stage;
          return (
            <button
              key={stage.stage}
              type="button"
              onClick={() => {
                setSelectedStageFilter(isSelected ? 'ALL' : stage.stage);
              }}
              className={`p-3.5 rounded-xl text-left transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-purple-950/50 border-purple-400/50 shadow-lg shadow-purple-950/40 scale-[1.02]'
                  : 'bg-zinc-900/60 border-purple-500/15 hover:border-purple-500/35 hover:bg-zinc-900/90'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-zinc-400 block truncate">
                  {stage.stage}
                </span>
                <span 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: stage.color }}
                />
              </div>
              <span className="text-lg font-bold text-white font-mono block mt-1">
                {stage.formattedValue}
              </span>
              <span className="text-[10px] text-purple-300/80 font-mono mt-0.5 block">
                {stage.count} {stage.count === 1 ? 'deal' : 'deals'}
              </span>
            </button>
          );
        })}
      </div>

      {/* High Priority Deals Table with Working Search & Filters */}
      <div className="rounded-2xl bg-[#121222]/80 backdrop-blur-xl border border-purple-500/15 p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Active High-Priority Opportunities</h3>
              <span className="px-2 py-0.5 text-[10px] font-mono text-purple-300 bg-purple-950/60 rounded border border-purple-500/25">
                {filteredOpportunities.length} of {opportunities.length}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live records persisted to browser storage. Add, edit, or delete deals anytime.
            </p>
          </div>

          {/* Search bar & Filter Reset */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div 
              onClick={() => searchInputRef.current?.focus()}
              className="relative flex-1 md:w-64 cursor-text"
            >
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500 pointer-events-none z-20" />
              <input
                ref={searchInputRef}
                id="crm-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search company, contact, owner..."
                autoComplete="off"
                className="relative z-10 w-full pl-9 pr-8 py-1.5 text-xs bg-zinc-900/80 rounded-xl text-white placeholder-zinc-500 border border-purple-500/20 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40 transition-all cursor-text"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2.5 top-2 z-20 text-zinc-400 hover:text-white cursor-pointer"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {selectedStageFilter !== 'ALL' && (
              <button
                type="button"
                onClick={() => setSelectedStageFilter('ALL')}
                className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-purple-300 bg-purple-950/60 rounded-xl border border-purple-500/30 hover:bg-purple-900/60 cursor-pointer"
              >
                <span>Stage: {selectedStageFilter}</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Table Canvas */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-purple-500/15 text-zinc-400 font-medium pb-2">
                <th className="pb-3 pl-2">Account & Contact</th>
                <th className="pb-3">Deal Value</th>
                <th className="pb-3">Stage</th>
                <th className="pb-3">AI Win Probability</th>
                <th className="pb-3">Close Date</th>
                <th className="pb-3">Owner</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10">
              {filteredOpportunities.map((deal) => (
                <tr key={deal.id} className="group hover:bg-purple-950/20 transition-colors">
                  {/* Account & Contact */}
                  <td className="py-3.5 pl-2">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-purple-950/60 border border-purple-500/20 text-purple-400 mt-0.5">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-semibold text-white block group-hover:text-purple-200 transition-colors">
                          {deal.company}
                        </span>
                        <span className="text-[11px] text-zinc-400 block font-mono">
                          {deal.contactPerson} • {deal.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Deal Value */}
                  <td className="py-3.5 font-mono font-bold text-white text-sm">
                    {formatCurrency(deal.dealValue)}
                  </td>

                  {/* Stage */}
                  <td className="py-3.5">
                    <span 
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-medium border"
                      style={{
                        backgroundColor: `${STAGE_CONFIG[deal.stage]?.color || '#9333ea'}15`,
                        color: STAGE_CONFIG[deal.stage]?.color || '#d8b4fe',
                        borderColor: `${STAGE_CONFIG[deal.stage]?.color || '#9333ea'}35`,
                      }}
                    >
                      {deal.stage}
                    </span>
                  </td>

                  {/* Win Probability */}
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-emerald-400 font-semibold min-w-8">
                        {deal.probability}
                      </span>
                      <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all" 
                          style={{ width: deal.probability }} 
                        />
                      </div>
                    </div>
                  </td>

                  {/* Close Date */}
                  <td className="py-3.5 text-zinc-300 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-zinc-500" />
                      <span>{deal.expectedCloseDate}</span>
                    </div>
                  </td>

                  {/* Owner */}
                  <td className="py-3.5 text-zinc-300 font-medium">
                    {deal.owner}
                  </td>

                  {/* Action Buttons: Edit & Delete */}
                  <td className="py-3.5 pr-2 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingOpportunity(deal);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-zinc-400 hover:text-purple-300 rounded-lg hover:bg-purple-500/20 transition-colors cursor-pointer"
                        title="Edit opportunity"
                        aria-label={`Edit opportunity for ${deal.company}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => setDeletingOpportunity(deal)}
                        className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/20 transition-colors cursor-pointer"
                        title="Delete opportunity"
                        aria-label={`Delete opportunity for ${deal.company}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredOpportunities.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400">
                    <div className="flex flex-col items-center justify-center">
                      <Sparkles className="w-6 h-6 text-purple-400 mb-2 opacity-60" />
                      <p className="text-sm font-medium text-zinc-200">No opportunities found</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {searchQuery
                          ? `No records match "${searchQuery}". Try another keyword or clear the search.`
                          : 'No opportunities in this stage. Click "New Opportunity" to create one.'}
                      </p>
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedStageFilter('ALL');
                            searchInputRef.current?.focus();
                          }}
                          className="mt-3 px-3 py-1 text-xs text-purple-300 bg-purple-950/60 rounded-lg border border-purple-500/25 hover:bg-purple-900/50 cursor-pointer"
                        >
                          Reset Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Opportunity Modal (Create / Edit) */}
      <OpportunityModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingOpportunity(null);
        }}
        onSubmit={handleSaveOpportunity}
        initialData={editingOpportunity}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingOpportunity)}
        onClose={() => setDeletingOpportunity(null)}
        onConfirm={handleConfirmDelete}
        companyName={deletingOpportunity?.company || ''}
      />
    </div>
  );
};
