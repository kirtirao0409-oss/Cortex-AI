import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  FolderKanban, 
  Building2, 
  User, 
  Calendar, 
  AlertCircle, 
  FileText, 
  Flag, 
  CheckCircle2 
} from 'lucide-react';
import type { ProjectItem, ProjectPriority, ProjectStatus } from '../../types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<ProjectItem, 'id' | 'createdAt'> & { id?: string }) => void;
  initialData?: ProjectItem | null;
}

const PRIORITIES: ProjectPriority[] = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES: ProjectStatus[] = ['Planning', 'In Progress', 'On Hold', 'Completed'];

const PRESET_TEAMS = [
  'Core Agent Team',
  'Security & Auth',
  'Data Infrastructure',
  'HR Technology',
  'Applied Intelligence',
  'Enterprise Solutions',
  'Platform Core'
];

const PRESET_MANAGERS = [
  'Alex Mercer',
  'Sarah Chen',
  'Marcus Vance',
  'Elena Rostova',
  'David Kim'
];

interface FormErrors {
  name?: string;
  team?: string;
  due?: string;
  startDate?: string;
}

const getTodayString = (): string => new Date().toISOString().split('T')[0];

const getDefaultDueDate = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
};

interface ProjectFormProps {
  initialData?: ProjectItem | null;
  onClose: () => void;
  onSubmit: (data: Omit<ProjectItem, 'id' | 'createdAt'> & { id?: string }) => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ initialData, onClose, onSubmit }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [team, setTeam] = useState(initialData?.team || 'Core Agent Team');
  const [manager, setManager] = useState(initialData?.manager || 'Alex Mercer');
  const [description, setDescription] = useState(initialData?.description || '');
  const [startDate, setStartDate] = useState(initialData?.startDate || getTodayString());
  const [due, setDue] = useState(initialData?.due || getDefaultDueDate());
  const [priority, setPriority] = useState<ProjectPriority>(initialData?.priority || 'Medium');
  const [status, setStatus] = useState<ProjectStatus>(
    (initialData?.status as ProjectStatus) || 'Planning'
  );
  const [progress, setProgress] = useState(initialData?.progress ?? 0);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!team.trim()) {
      newErrors.team = 'Department / Team is required';
    }

    if (!due) {
      newErrors.due = 'Due date is required';
    }

    if (startDate && due) {
      const start = new Date(startDate);
      const end = new Date(due);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end < start) {
        newErrors.due = 'Due date cannot be before start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      id: initialData?.id,
      name: name.trim(),
      team: team.trim(),
      manager: manager.trim() || undefined,
      description: description.trim() || undefined,
      startDate: startDate || undefined,
      due,
      priority,
      status,
      progress: Math.min(100, Math.max(0, Number(progress) || 0)),
    });

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Row 1: Project Name */}
      <div>
        <label className="block text-xs font-medium text-zinc-300 mb-1.5">
          Project Name <span className="text-purple-400">*</span>
        </label>
        <div className="relative">
          <FolderKanban className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Autonomous Telemetry Pipeline v2"
            className={`w-full pl-9 pr-3.5 py-2 text-xs bg-zinc-900/80 rounded-xl text-white placeholder-zinc-500 border transition-all ${
              errors.name 
                ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' 
                : 'border-purple-500/20 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40'
            }`}
          />
        </div>
        {errors.name && (
          <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 inline" /> {errors.name}
          </p>
        )}
      </div>

      {/* Row 2: Department / Team & Project Manager */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Department / Team <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              list="project-teams-list"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              placeholder="Select or enter team"
              className={`w-full pl-9 pr-3.5 py-2 text-xs bg-zinc-900/80 rounded-xl text-white placeholder-zinc-500 border transition-all ${
                errors.team 
                  ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' 
                  : 'border-purple-500/20 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40'
              }`}
            />
            <datalist id="project-teams-list">
              {PRESET_TEAMS.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>
          {errors.team && (
            <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 inline" /> {errors.team}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Project Manager
          </label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              list="project-managers-list"
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              placeholder="e.g. Alex Mercer"
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-zinc-900/80 rounded-xl text-white placeholder-zinc-500 border border-purple-500/20 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40 transition-all"
            />
            <datalist id="project-managers-list">
              {PRESET_MANAGERS.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </div>
        </div>
      </div>

      {/* Row 3: Priority & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Priority
          </label>
          <div className="relative">
            <Flag className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as ProjectPriority)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-zinc-900/80 rounded-xl text-white border border-purple-500/20 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40 transition-all cursor-pointer"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p} className="bg-[#121222] text-white">
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Status
          </label>
          <div className="relative">
            <CheckCircle2 className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-zinc-900/80 rounded-xl text-white border border-purple-500/20 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40 transition-all cursor-pointer"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s} className="bg-[#121222] text-white">
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Row 4: Start Date & Due Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Start Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-zinc-900/80 rounded-xl text-white placeholder-zinc-500 border border-purple-500/20 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Due Date <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
            <input
              type="date"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              className={`w-full pl-9 pr-3.5 py-2 text-xs bg-zinc-900/80 rounded-xl text-white placeholder-zinc-500 border transition-all ${
                errors.due 
                  ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' 
                  : 'border-purple-500/20 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40'
              }`}
            />
          </div>
          {errors.due && (
            <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 inline" /> {errors.due}
            </p>
          )}
        </div>
      </div>

      {/* Row 5: Initial Milestone Progress */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <label className="font-medium text-zinc-300">
            Milestone Progress
          </label>
          <span className="font-mono text-purple-300 font-semibold">{progress}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="w-full accent-purple-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
        />
      </div>

      {/* Row 6: Description */}
      <div>
        <label className="block text-xs font-medium text-zinc-300 mb-1.5">
          Description
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Define sprint objectives, velocity milestones, and deliverables..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-zinc-900/80 rounded-xl text-white placeholder-zinc-500 border border-purple-500/20 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40 transition-all resize-none"
          />
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
          <span>{initialData ? 'Save Changes' : 'Create Project'}</span>
        </button>
      </div>
    </form>
  );
};

export const ProjectModal: React.FC<ProjectModalProps> = ({
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
                  <FolderKanban className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {initialData ? 'Edit Initiative' : 'New Project Initiative'}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {initialData 
                      ? 'Update sprint parameters and autonomous milestone targets' 
                      : 'Launch a delivery sprint tracked by Cortex Autonomous PM Agents'}
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
            <ProjectForm
              key={initialData ? initialData.id : 'new-project'}
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

