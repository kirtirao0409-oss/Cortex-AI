import React from 'react';
import { 
  Cpu, 
  Database
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#121222]/80 backdrop-blur-xl border border-purple-500/15">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 text-[10px] font-mono text-purple-300 bg-purple-950/60 rounded border border-purple-500/30">
            SYSTEM CONTROL
          </span>
          <span className="text-xs text-zinc-400">Autonomous Policies & Permissions</span>
        </div>
        <h2 className="text-xl font-bold text-white">Platform Settings & Automation Rules</h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Configure agent autonomy thresholds, human-in-the-loop triggers, and enterprise connectors.
        </p>
      </div>

      {/* Autonomous Guardrails Section */}
      <div className="p-5 rounded-2xl bg-[#121222]/80 backdrop-blur-xl border border-purple-500/15 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold text-white">Autonomous Agent Guardrails</h3>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/40 border border-purple-500/10">
            <div>
              <h4 className="font-semibold text-white">Autonomous Deal Qualification</h4>
              <p className="text-zinc-400 text-[11px] mt-0.5">
                Automatically score incoming CRM leads and advance verified Tier-1 inbound inquiries.
              </p>
            </div>
            <span className="px-2.5 py-1 text-[11px] font-semibold text-emerald-300 bg-emerald-950/50 rounded-lg border border-emerald-500/30">
              Enabled
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/40 border border-purple-500/10">
            <div>
              <h4 className="font-semibold text-white">Human-in-the-Loop Threshold for Contracts</h4>
              <p className="text-zinc-400 text-[11px] mt-0.5">
                Require executive sign-off before generating contracts exceeding $100,000 ARR.
              </p>
            </div>
            <span className="px-2.5 py-1 text-[11px] font-semibold text-purple-300 bg-purple-950/60 rounded-lg border border-purple-500/30">
              Active ($100k)
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/40 border border-purple-500/10">
            <div>
              <h4 className="font-semibold text-white">Resume Semantic Parser Filtering</h4>
              <p className="text-zinc-400 text-[11px] mt-0.5">
                Extract technical skills and score candidate experience match against job requisition.
              </p>
            </div>
            <span className="px-2.5 py-1 text-[11px] font-semibold text-emerald-300 bg-emerald-950/50 rounded-lg border border-emerald-500/30">
              Enabled
            </span>
          </div>
        </div>
      </div>

      {/* Connected Integrations Status */}
      <div className="p-5 rounded-2xl bg-[#121222]/80 backdrop-blur-xl border border-purple-500/15 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold text-white">Data Connectors (Prototype State)</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {[
            { name: 'Stripe Billing API', status: 'Mock Connected', desc: 'Financial ARR telemetry' },
            { name: 'Enterprise CRM Sync', status: 'Mock Connected', desc: 'Deal stages & contact scoring' },
            { name: 'Greenhouse / Lever HR', status: 'Mock Connected', desc: 'Applicant tracking ingestion' },
            { name: 'GitHub & Jira Core', status: 'Mock Connected', desc: 'Sprint tracking & velocity metrics' },
          ].map((conn) => (
            <div key={conn.name} className="p-3 rounded-xl bg-zinc-900/40 border border-purple-500/10 flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">{conn.name}</span>
                <span className="text-[11px] text-zinc-400">{conn.desc}</span>
              </div>
              <span className="text-[10px] font-mono text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded border border-purple-500/20">
                {conn.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
