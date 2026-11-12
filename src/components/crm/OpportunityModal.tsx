import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Building2, 
  User, 
  Mail, 
  DollarSign, 
  Calendar, 
  Layers, 
  ShieldCheck 
} from 'lucide-react';
import type { CrmOpportunity, DealStage } from '../../types';

interface OpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<CrmOpportunity, 'id' | 'createdAt' | 'probability'> & { id?: string }) => void;
  initialData?: CrmOpportunity | null;
}

const DEAL_STAGES: DealStage[] = [
  'Inquiry',
  'Qualified',
  'Demo Held',
  'Proposal',
  'Negotiation',
  'Closed Won'
];

const PRESET_OWNERS = [
  'Sarah Chen',
  'Marcus Vance',
  'Elena Rostova',
  'David Kim',
  'Alex Mercer'
];

interface FormErrors {
  company?: string;
  contactPerson?: string;
  email?: string;
  dealValue?: string;
  stage?: string;
  owner?: string;
  expectedCloseDate?: string;
}

const getDefaultExpectedDate = (): string => {
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 30);
  return defaultDate.toISOString().split('T')[0];
};

interface OpportunityFormProps {
  initialData?: CrmOpportunity | null;
  onClose: () => void;
  onSubmit: (data: Omit<CrmOpportunity, 'id' | 'createdAt' | 'probability'> & { id?: string }) => void;
}

const OpportunityForm: React.FC<OpportunityFormProps> = ({
  initialData,
  onClose,
  onSubmit,
}) => {
  const [company, setCompany] = useState(initialData?.company || '');
  const [contactPerson, setContactPerson] = useState(initialData?.contactPerson || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [dealValue, setDealValue] = useState(
    initialData ? initialData.dealValue.toString() : ''
  );
  const [stage, setStage] = useState<DealStage>(initialData?.stage || 'Qualified');
  const [owner, setOwner] = useState(initialData?.owner || 'Sarah Chen');
  const [expectedCloseDate, setExpectedCloseDate] = useState(
    initialData?.expectedCloseDate || getDefaultExpectedDate()
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!contactPerson.trim()) {
      newErrors.contactPerson = 'Contact person is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    const numericValue = parseFloat(dealValue.replace(/[^0-9.]/g, ''));
    if (!dealValue || isNaN(numericValue) || numericValue <= 0) {
      newErrors.dealValue = 'Please enter a valid deal value greater than 0';
    }

    if (!stage) {
      newErrors.stage = 'Deal stage is required';
    }

    if (!owner.trim()) {
      newErrors.owner = 'Deal owner is required';
    }

    if (!expectedCloseDate) {
      newErrors.expectedCloseDate = 'Expected closing date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const numericValue = parseFloat(dealValue.replace(/[^0-9.]/g, ''));

    onSubmit({
      id: initialData?.id,
      company: company.trim(),
      contactPerson: contactPerson.trim(),
      email: email.trim().toLowerCase(),
      dealValue: numericValue,
      stage,
      owner: owner.trim(),
      expectedCloseDate,
    });

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Row 1: Company Name */}
      <div>
        <label className="block text-xs font-medium text-zinc-300 mb-1.5">
          Company / Account Name <span className="text-purple-400">*</span>
        </label>
        <div className="relative">
          <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Acme Corporation"
            className={`w-full pl-9 pr-3.5 py-2 text-xs bg-zinc-900/80 rounded-xl text-white placeholder-zinc-500 border transition-all ${
              errors.company 
                ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' 
                : 'border-purple-500/20 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40'
            }`}
          />
        </div>
        {errors.company && (
          <p className="text-[11px] text-rose-400 mt-1">{errors.company}</p>
        )}
      </div>

      {/* Row 2: Contact Person & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Contact Person <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="e.g. Jane Doe"
              className={`w-full pl-9 pr-3.5 py-2 text-xs bg-zinc-900/80 rounded-xl text-white placeholder-zinc-500 border transition-all ${
                errors.contactPerson 
                  ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' 
                  : 'border-purple-500/20 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40'
              }`}
            />
          </div>
          {errors.contactPerson && (
            <p className="text-[11px] text-rose-400 mt-1">{errors.contactPerson}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Email Address <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@company.com"
              className={`w-full pl-9 pr-3.5 py-2 text-xs bg-zinc-900/80 rounded-xl text-white placeholder-zinc-500 border transition-all ${
                errors.email 
                  ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' 
                  : 'border-purple-500/20 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40'
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-rose-400 mt-1">{errors.email}</p>
          )}
        </div>
      </div>

      {/* Row 3: Deal Value & Deal Stage */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Deal Value (USD) <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              type="number"
              min="1"
              step="1000"
              value={dealValue}
              onChange={(e) => setDealValue(e.target.value)}
              placeholder="150000"
              className={`w-full pl-9 pr-3.5 py-2 text-xs bg-zinc-900/80 rounded-xl text-white placeholder-zinc-500 font-mono border transition-all ${
                errors.dealValue 
                  ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' 
                  : 'border-purple-500/20 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40'
              }`}
            />
          </div>
          {errors.dealValue && (
            <p className="text-[11px] text-rose-400 mt-1">{errors.dealValue}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Deal Stage <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <Layers className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as DealStage)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-zinc-900/80 rounded-xl text-white border border-purple-500/20 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40 transition-all cursor-pointer"
            >
              {DEAL_STAGES.map((s) => (
                <option key={s} value={s} className="bg-[#121222] text-white">
                  {s}
                </option>
              ))}
            </select>
          </div>
          {errors.stage && (
            <p className="text-[11px] text-rose-400 mt-1">{errors.stage}</p>
          )}
        </div>
      </div>

      {/* Row 4: Deal Owner & Expected Closing Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Deal Owner <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              list="deal-owners-list"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="Select or enter owner"
              className={`w-full pl-9 pr-3.5 py-2 text-xs bg-zinc-900/80 rounded-xl text-white placeholder-zinc-500 border transition-all ${
                errors.owner 
                  ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' 
                  : 'border-purple-500/20 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40'
              }`}
            />
            <datalist id="deal-owners-list">
              {PRESET_OWNERS.map((o) => (
                <option key={o} value={o} />
              ))}
            </datalist>
          </div>
          {errors.owner && (
            <p className="text-[11px] text-rose-400 mt-1">{errors.owner}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Expected Closing Date <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              type="date"
              value={expectedCloseDate}
              onChange={(e) => setExpectedCloseDate(e.target.value)}
              className={`w-full pl-9 pr-3.5 py-2 text-xs bg-zinc-900/80 rounded-xl text-white placeholder-zinc-500 border transition-all ${
                errors.expectedCloseDate 
                  ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' 
                  : 'border-purple-500/20 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40'
              }`}
            />
          </div>
          {errors.expectedCloseDate && (
            <p className="text-[11px] text-rose-400 mt-1">{errors.expectedCloseDate}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-purple-500/15 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700/80 rounded-xl border border-purple-500/20 transition-all cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-purple-900/40 border border-purple-400/30 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{initialData ? 'Save Changes' : 'Create Opportunity'}</span>
        </button>
      </div>
    </form>
  );
};

export const OpportunityModal: React.FC<OpportunityModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-xl rounded-2xl bg-gradient-to-b from-[#141424] to-[#0c0c16] border border-purple-500/30 p-6 shadow-2xl shadow-purple-950/60 z-10 my-8 overflow-hidden"
          >
            {/* Ambient top glow */}
            <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-purple-500/15 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-950/70 border border-purple-500/30 text-purple-300">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {initialData ? 'Edit Opportunity' : 'New Enterprise Opportunity'}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {initialData
                      ? 'Update deal parameters and stage forecasts in the pipeline'
                      : 'Capture a qualified enterprise deal into Cortex CRM & autonomous forecasting'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-purple-500/15 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Keyed Form to re-initialize cleanly on change */}
            <OpportunityForm
              key={initialData ? initialData.id : 'new-opportunity'}
              initialData={initialData}
              onClose={onClose}
              onSubmit={onSubmit}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
