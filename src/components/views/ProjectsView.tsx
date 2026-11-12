import React, { useState } from 'react';
import { 
  Plus, 
  TrendingUp, 
  CheckCircle2, 
  Pencil, 
  Trash2,
  FolderKanban,
  User
} from 'lucide-react';
import { DEMO_PROJECT_LIST } from '../../data/mockData';
import type { ProjectItem } from '../../types';
import { ProjectModal } from '../projects/ProjectModal';

const STORAGE_KEY = 'cortex_projects';

const loadProjects = (): ProjectItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load projects from localStorage', e);
  }
  return DEMO_PROJECT_LIST;
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  if (dateStr.includes('-')) {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }
  return dateStr;
};

export const ProjectsView: React.FC = () => {
  const [projects, setProjects] = useState<ProjectItem[]>(loadProjects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const saveProjectsToStorage = (updated: ProjectItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save projects to localStorage', e);
    }
  };

  const handleSaveProject = (
    data: Omit<ProjectItem, 'id' | 'createdAt'> & { id?: string }
  ) => {
    if (data.id) {
      // Update existing project
      const updated = projects.map((p) =>
        p.id === data.id ? { ...p, ...data } : p
      );
      setProjects(updated);
      saveProjectsToStorage(updated);
      setNotification(`Project "${data.name}" updated successfully.`);
    } else {
      // Create new project
      const newProject: ProjectItem = {
        ...data,
        id: `proj-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      const updated = [newProject, ...projects];
      setProjects(updated);
      saveProjectsToStorage(updated);
      setNotification(`Project "${newProject.name}" created successfully.`);
    }

    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleDeleteProject = (id: string, name: string) => {
    const updated = projects.filter((p) => (p.id ? p.id !== id : p.name !== id));
    setProjects(updated);
    saveProjectsToStorage(updated);
    setNotification(`Project "${name}" removed.`);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleOpenCreateModal = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (proj: ProjectItem) => {
    setEditingProject(proj);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#121222]/80 backdrop-blur-xl border border-purple-500/15">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-mono text-purple-300 bg-purple-950/60 rounded border border-purple-500/30">
              PROJECTS & DELIVERY
            </span>
            <span className="text-xs text-zinc-400">Autonomous Sprint Health & Risk Forecasting</span>
          </div>
          <h2 className="text-xl font-bold text-white">Active Initiatives & Delivery Sprints</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            {projects.length} active initiatives across enterprise teams. Automated velocity tracking and blocker detection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-md shadow-purple-950/50 transition-all cursor-pointer hover:border-purple-400/40 border border-purple-500/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Initiative</span>
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

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((proj) => (
          <div 
            key={proj.id || proj.name}
            className="p-5 rounded-2xl bg-[#121222]/80 backdrop-blur-xl border border-purple-500/15 hover:border-purple-500/30 transition-all shadow-lg flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] text-zinc-400 font-mono uppercase">{proj.team}</span>
                    {proj.priority && (
                      <span className={`px-1.5 py-0.5 text-[9px] font-semibold rounded font-mono uppercase border ${
                        proj.priority === 'Critical' 
                          ? 'bg-rose-950/70 text-rose-300 border-rose-500/30' 
                          : proj.priority === 'High' 
                          ? 'bg-amber-950/70 text-amber-300 border-amber-500/30' 
                          : proj.priority === 'Medium' 
                          ? 'bg-purple-950/70 text-purple-300 border-purple-500/30' 
                          : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                      }`}>
                        {proj.priority}
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-purple-200 transition-colors">
                    {proj.name}
                  </h4>
                  {proj.manager && (
                    <span className="text-[11px] text-purple-300/80 mt-0.5 flex items-center gap-1 font-mono">
                      <User className="w-3 h-3 text-purple-400/80 inline" /> Lead: {proj.manager}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`px-2.5 py-0.5 text-[10px] font-medium rounded-full ${
                    proj.status === 'On Track' || proj.status === 'Completed'
                      ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30'
                      : proj.status === 'On Hold'
                      ? 'bg-amber-950/50 text-amber-300 border border-amber-500/30'
                      : 'bg-purple-900/40 text-purple-200 border border-purple-500/25'
                  }`}>
                    {proj.status}
                  </span>

                  {/* Actions for Edit and Delete */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      title="Edit Initiative"
                      onClick={() => handleOpenEditModal(proj)}
                      className="p-1 text-zinc-400 hover:text-purple-300 hover:bg-purple-500/15 rounded-lg transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Delete Initiative"
                      onClick={() => handleDeleteProject(proj.id, proj.name)}
                      className="p-1 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/15 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {proj.description && (
                <p className="text-xs text-zinc-400 mt-2 mb-3 line-clamp-2 leading-relaxed">
                  {proj.description}
                </p>
              )}
            </div>

            {/* Progress bar */}
            <div>
              <div className="mt-2 mb-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-400 text-[11px]">Milestone Completion</span>
                  <span className="text-white font-mono font-semibold">{proj.progress}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-purple-500/10">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-purple-500/10 text-xs text-zinc-400">
                <span className="text-[11px] font-mono">Target: {formatDate(proj.due)}</span>
                <span className="text-purple-300 text-[11px] flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Velocity: Nominal
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Autonomous Delivery Status */}
      <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/15 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <FolderKanban className="w-4 h-4 text-purple-400" />
          <span>
            Delivery Agent: <strong className="text-white">Active</strong> — {projects.length} initiatives tracked with autonomous burn-down analytics and blocker mitigation.
          </span>
        </div>
        <span className="font-mono text-purple-300 text-[11px]">Cortex PM Core v2.4</span>
      </div>

      {/* Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveProject}
        initialData={editingProject}
      />
    </div>
  );
};
