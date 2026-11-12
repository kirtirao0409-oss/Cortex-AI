import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Briefcase, 
  Building2, 
  Clock, 
  Users, 
  Calendar, 
  FileText,
  UserPlus
} from 'lucide-react';
import type { EmploymentType, HrmsRequisition } from '../../types';

interface RequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<HrmsRequisition, 'id' | 'applicants' | 'status' | 'createdAt'>) => void;
}

const EMPLOYMENT_TYPES: EmploymentType[] = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship'
];

const PRESET_DEPARTMENTS = [
  'Applied Intelligence',
  'Core Product',
  'Enterprise Sales',
  'Legal & Ops',
  'Data Infrastructure',
  'Security & Auth',
  'People & Culture',
  'Finance & Strategy'
];

interface FormErrors {
  role?: string;
  department?: string;
  employmentType?: string;
  openings?: string;
  targetDate?: string;
  description?: string;
}

const getDefaultTargetDate = (): string => {
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 30);
  return defaultDate.toISOString().split('T')[0];
};

interface RequisitionFormProps {
  onClose: () => void;
  onSubmit: (data: Omit<HrmsRequisition, 'id' | 'applicants' | 'status' | 'createdAt'>) => void;
}

const RequisitionForm: React.FC<RequisitionFormProps> = ({ onClose, onSubmit }) => {
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('Applied Intelligence');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('Full-time');
  const [openings, setOpenings] = useState('1');
  const [targetDate, setTargetDate] = useState(getDefaultTargetDate());
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!role.trim()) {
      newErrors.role = 'Job title is required';
    }

    if (!department.trim()) {
      newErrors.department = 'Department is required';
    }

    if (!employmentType) {
      newErrors.employmentType = 'Employment type is required';
    }

    const parsedOpenings = parseInt(openings, 10);
    if (!openings || isNaN(parsedOpenings) || parsedOpenings < 1) {
      newErrors.openings = 'Please specify at least 1 opening';
    }

    if (!targetDate) {
      newErrors.targetDate = 'Target date is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Job description is required';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const parsedOpenings = parseInt(openings, 10);

    onSubmit({
      role: role.trim(),
      department: department.trim(),
      employmentType,
      openings: parsedOpenings,
      targetDate,
      description: description.trim(),
    });

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Row 1: Job Title */}
      <div>
        <label className="block text-xs font-medium text-zinc-300 mb-1.5">
          Job Title <span className="text-purple-400">*</span>
        </label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Lead Autonomous Agent Engineer"
            className={`w-full pl-9 pr-3.5 py-2 text-xs bg-zinc-900/80 rounded-xl text-white placeholder-zinc-500 border transition-all ${
              errors.role 
                ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' 
                : 'border-purple-500/20 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40'
            }`}
          />
        </div>
        {errors.role && (
          <p className="text-[11px] text-rose-400 mt-1">{errors.role}</p>
        )}
      </div>

      {/* Row 2: Department & Employment Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Department <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              list="department-options"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Select or enter department"
              className={`w-full pl-9 pr-3.5 py-2 text-xs bg-zinc-900/80 rounded-xl text-white placeholder-zinc-500 border transition-all ${
                errors.department 
                  ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' 
                  : 'border-purple-500/20 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40'
              }`}
            />
            <datalist id="department-options">
              {PRESET_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept} />
              ))}
            </datalist>
          </div>
          {errors.department && (
            <p className="text-[11px] text-rose-400 mt-1">{errors.department}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Employment Type <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-zinc-900/80 rounded-xl text-white border border-purple-500/20 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40 transition-all cursor-pointer"
            >
              {EMPLOYMENT_TYPES.map((type) => (
                <option key={type} value={type} className="bg-[#121222] text-white">
                  {type}
                </option>
              ))}
            </select>
          </div>
          {errors.employmentType && (
            <p className="text-[11px] text-rose-400 mt-1">{errors.employmentType}</p>
          )}
        </div>
      </div>

      {/* Row 3: Openings & Target Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Number of Openings <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              type="number"
              min="1"
              max="50"
              value={openings}
              onChange={(e) => setOpenings(e.target.value)}
              placeholder="1"
              className={`w-full pl-9 pr-3.5 py-2 text-xs bg-zinc-900/80 rounded-xl text-white placeholder-zinc-500 font-mono border transition-all ${
                errors.openings 
                  ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' 
                  : 'border-purple-500/20 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40'
              }`}
            />
          </div>
          {errors.openings && (
            <p className="text-[11px] text-rose-400 mt-1">{errors.openings}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Target Date <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className={`w-full pl-9 pr-3.5 py-2 text-xs bg-zinc-900/80 rounded-xl text-white placeholder-zinc-500 border transition-all ${
                errors.targetDate 
                  ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' 
                  : 'border-purple-500/20 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40'
              }`}
            />
          </div>
          {errors.targetDate && (
            <p className="text-[11px] text-rose-400 mt-1">{errors.targetDate}</p>
          )}
        </div>
      </div>

      {/* Row 4: Job Description */}
      <div>
        <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
          <span>Job Description <span className="text-purple-400">*</span></span>
          <span className="text-[10px] text-zinc-500 font-mono">Parsed by Talent Intake Agent</span>
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Outline core responsibilities, key technologies, and candidate profile requirements..."
            className={`w-full pl-9 pr-3.5 py-2 text-xs bg-zinc-900/80 rounded-xl text-white placeholder-zinc-500 border transition-all resize-none ${
              errors.description 
                ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' 
                : 'border-purple-500/20 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40'
            }`}
          />
        </div>
        {errors.description && (
          <p className="text-[11px] text-rose-400 mt-1">{errors.description}</p>
        )}
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
          <UserPlus className="w-3.5 h-3.5" />
          <span>Create Requisition</span>
        </button>
      </div>
    </form>
  );
};

export const RequisitionModal: React.FC<RequisitionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
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
                    Open New Requisition
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Launch candidate sourcing and autonomous screening for a new position
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

            {/* Form */}
            <RequisitionForm
              onClose={onClose}
              onSubmit={onSubmit}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

