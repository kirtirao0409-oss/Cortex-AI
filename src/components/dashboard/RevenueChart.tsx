import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { Sparkles } from 'lucide-react';
import type { MonthlyRevenue } from '../../types';

interface RevenueChartProps {
  data: MonthlyRevenue[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl bg-[#0e0e1a]/95 backdrop-blur-md border border-purple-500/30 p-3 shadow-2xl">
        <p className="text-xs font-semibold text-purple-300 mb-1.5 font-mono">
          Month: {label}
        </p>
        <div className="space-y-1">
          {payload.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: item.color }} 
                />
                {item.name}:
              </span>
              <span className="font-mono font-semibold text-white">
                ${(item.value / 1000).toFixed(0)}k
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const [timeframe, setTimeframe] = useState<'6M' | '1Y' | 'QTD'>('6M');

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#121222]/90 to-[#0e0e1a]/80 backdrop-blur-xl border border-purple-500/15 p-5 lg:p-6 shadow-xl">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-72 h-72 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base lg:text-lg font-bold text-white tracking-tight">
              Revenue Velocity & Forecast
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-semibold text-purple-300 bg-purple-900/40 rounded-full border border-purple-500/30 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-purple-400" />
              AI Model: v3.2
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Monthly gross ARR trajectory including autonomous upsell optimizations
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center self-start sm:self-auto bg-zinc-900/80 p-1 rounded-xl border border-purple-500/20">
          {(['6M', '1Y', 'QTD'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                timeframe === period
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/15">
        <div>
          <span className="text-[11px] text-zinc-400 block">Current ARR Run Rate</span>
          <span className="text-lg font-bold text-white font-mono">$15.41M</span>
        </div>
        <div>
          <span className="text-[11px] text-zinc-400 block">Autonomous Uplift</span>
          <span className="text-lg font-bold text-purple-300 font-mono">+$284.5k</span>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span className="text-[11px] text-zinc-400 block">Forecast Accuracy</span>
          <span className="text-lg font-bold text-emerald-400 font-mono">98.4%</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9333ea" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#9333ea" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="indigoGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(147, 51, 234, 0.08)" vertical={false} />
            <XAxis 
              dataKey="month" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: '#71717a', fontSize: 11 }} 
            />
            <YAxis 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: '#71717a', fontSize: 11 }}
              tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              name="Realized Revenue"
              stroke="#a855f7" 
              strokeWidth={2.5} 
              fillOpacity={1} 
              fill="url(#purpleGradient)" 
            />
            <Area 
              type="monotone" 
              dataKey="projected" 
              name="Baseline Target"
              stroke="#6366f1" 
              strokeWidth={1.8} 
              strokeDasharray="4 4"
              fillOpacity={1} 
              fill="url(#indigoGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend footer */}
      <div className="flex items-center justify-end gap-6 mt-4 pt-3 border-t border-purple-500/10 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="w-3 h-1 bg-purple-500 rounded-full" />
          <span>Realized Revenue</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-1 bg-indigo-500 rounded-full border border-dashed border-indigo-300" />
          <span>Baseline Target</span>
        </div>
      </div>
    </div>
  );
};
