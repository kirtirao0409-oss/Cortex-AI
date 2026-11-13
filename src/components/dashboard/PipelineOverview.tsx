import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { PipelineStage } from '../../types';

interface PipelineOverviewProps {
  data: PipelineStage[];
}

interface PipelineTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: PipelineStage;
  }>;
}

const CustomPipelineTooltip: React.FC<PipelineTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="rounded-xl bg-[#0e0e1a]/95 backdrop-blur-md border border-purple-500/30 p-3 shadow-2xl">
        <p className="text-xs font-semibold text-purple-300 mb-1">{item.stage}</p>
        <p className="text-sm font-bold text-white font-mono">{item.formattedValue}</p>
        <p className="text-xs text-zinc-400 mt-1">{item.count} Active Deals</p>
      </div>
    );
  }
  return null;
};

export const PipelineOverview: React.FC<PipelineOverviewProps> = ({ data }) => {
  const totalValue = data.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
  const totalDeals = data.reduce((acc, curr) => acc + (Number(curr.count) || 0), 0);

  const formattedTotal = totalValue >= 1000000 
    ? `$${(totalValue / 1000000).toFixed(2)}M` 
    : totalValue >= 1000 
      ? `$${(totalValue / 1000).toFixed(0)}k` 
      : `$${totalValue}`;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#121222]/90 to-[#0e0e1a]/80 backdrop-blur-xl border border-purple-500/15 p-5 lg:p-6 shadow-xl flex flex-col justify-between">
      {/* Glow */}
      <div className="absolute bottom-0 right-0 w-60 h-60 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base lg:text-lg font-bold text-white tracking-tight">
              CRM Pipeline Funnel
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-semibold text-emerald-300 bg-emerald-950/50 rounded-full border border-emerald-500/30">
              {totalDeals > 0 ? 'Live Pipeline' : 'Empty'}
            </span>
          </div>
          <span className="text-xs text-purple-300 font-mono font-semibold">
            {formattedTotal} Active
          </span>
        </div>
        <p className="text-xs text-zinc-400 mb-4">
          Distribution of {totalDeals} active enterprise opportunities across stages
        </p>

        {/* Horizontal Mini Funnel Bars */}
        <div className="space-y-2.5 mb-5">
          {data.map((stage) => {
            const percentOfTotal = totalValue > 0 ? ((stage.value / totalValue) * 100).toFixed(0) : '0';
            return (
              <div key={stage.stage} className="group">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-300 font-medium group-hover:text-purple-300 transition-colors">
                    {stage.stage}
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-zinc-400 text-[11px]">{stage.count} {stage.count === 1 ? 'deal' : 'deals'}</span>
                    <span className="text-white font-semibold">{stage.formattedValue}</span>
                  </div>
                </div>

                {/* Progress track */}
                <div className="h-2 w-full bg-zinc-900/80 rounded-full overflow-hidden border border-purple-500/10">
                  <div
                    className="h-full rounded-full transition-all duration-500 group-hover:brightness-125"
                    style={{
                      width: `${totalValue > 0 ? Math.max(Number(percentOfTotal), stage.count > 0 ? 8 : 0) : 0}%`,
                      backgroundColor: stage.color,
                      boxShadow: stage.count > 0 ? `0 0 8px ${stage.color}60` : 'none',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mini Bar Chart Distribution */}
      <div className="mt-2 pt-4 border-t border-purple-500/10">
        <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-2">
          <span>Stage Deal Volume</span>
          <span className="text-purple-300 font-medium flex items-center gap-1 font-mono">
            <TrendingUp className="w-3 h-3 text-purple-400" /> {totalDeals} Opportunities
          </span>
        </div>
        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <XAxis 
                dataKey="stage" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#71717a', fontSize: 10 }}
              />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#71717a', fontSize: 10 }}
              />
              <Tooltip content={<CustomPipelineTooltip />} cursor={{ fill: 'rgba(147, 51, 234, 0.08)' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
