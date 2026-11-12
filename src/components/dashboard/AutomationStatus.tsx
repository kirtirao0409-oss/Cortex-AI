import React from 'react';
import { Cpu } from 'lucide-react';
import { DEMO_AUTOMATION_SUMMARY } from '../../data/mockData';

export const AutomationStatus: React.FC = () => {
  const totalSavedHours = DEMO_AUTOMATION_SUMMARY.reduce((acc, curr) => acc + curr.savedHours, 0);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950/40 via-violet-950/30 to-indigo-950/40 border border-purple-500/20 p-5 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg shadow-purple-950/60 border border-purple-400/30">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-bold text-white">
                Autonomous Workforce Summary
              </h4>
              <span className="px-2 py-0.5 text-[10px] font-semibold text-purple-300 bg-purple-900/60 rounded-full border border-purple-500/30">
                Active Cycle
              </span>
            </div>
            <p className="text-xs text-zinc-300">
              Cortex agents have saved <strong className="text-white font-mono">{totalSavedHours} hours</strong> of manual enterprise operations this week.
            </p>
          </div>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-zinc-900/50 border border-purple-500/15">
            <span className="text-[10px] uppercase font-mono text-zinc-400 block">Agent Precision</span>
            <span className="text-sm font-bold text-purple-300 font-mono">99.4%</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-zinc-900/50 border border-purple-500/15">
            <span className="text-[10px] uppercase font-mono text-zinc-400 block">Avg Response</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">1.2s</span>
          </div>
          <div className="col-span-2 sm:col-span-1 px-3.5 py-2 rounded-xl bg-zinc-900/50 border border-purple-500/15">
            <span className="text-[10px] uppercase font-mono text-zinc-400 block">Integrations</span>
            <span className="text-sm font-bold text-white font-mono">8 Synced</span>
          </div>
        </div>
      </div>
    </div>
  );
};
