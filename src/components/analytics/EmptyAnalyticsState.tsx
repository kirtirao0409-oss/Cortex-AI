import React from 'react';
import { BarChart3 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface EmptyAnalyticsStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export const EmptyAnalyticsState: React.FC<EmptyAnalyticsStateProps> = ({
  title,
  description,
  icon: Icon = BarChart3,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-zinc-900/30 border border-purple-500/10 text-center my-2">
      <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/20 text-purple-400 mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <h4 className="text-xs font-semibold text-white mb-1">{title}</h4>
      <p className="text-[11px] text-zinc-400 max-w-sm leading-relaxed">{description}</p>
    </div>
  );
};
