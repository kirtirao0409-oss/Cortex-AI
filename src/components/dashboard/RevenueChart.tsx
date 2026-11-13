import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { Sparkles, Calendar, TrendingUp } from 'lucide-react';
import type { CrmOpportunity, MonthlyRevenue } from '../../types';

interface RevenueChartProps {
  opportunities?: CrmOpportunity[];
  data?: MonthlyRevenue[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      label: string;
      pipeline: number;
      weighted: number;
      closedWon: number;
      count: number;
    };
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="rounded-xl bg-[#0e0e1a]/95 backdrop-blur-md border border-purple-500/30 p-3.5 shadow-2xl">
        <p className="text-xs font-semibold text-purple-300 mb-2 font-mono flex items-center gap-1.5">
          <Calendar className="w-3 h-3 text-purple-400" />
          Closing Period: {label || item.label}
        </p>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Scheduled Pipeline:
            </span>
            <span className="font-mono font-semibold text-white">
              ${(item.pipeline / 1000).toFixed(0)}k
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              Weighted Forecast:
            </span>
            <span className="font-mono font-semibold text-indigo-300">
              ${(item.weighted / 1000).toFixed(0)}k
            </span>
          </div>
          {item.closedWon > 0 && (
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Closed Won:
              </span>
              <span className="font-mono font-semibold text-emerald-400">
                ${(item.closedWon / 1000).toFixed(0)}k
              </span>
            </div>
          )}
          <div className="pt-1.5 border-t border-purple-500/10 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
            <span>Volume</span>
            <span>{item.count} {item.count === 1 ? 'opportunity' : 'opportunities'}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const formatCurrency = (val: number): string => {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
  return `$${val}`;
};

export const RevenueChart: React.FC<RevenueChartProps> = ({ opportunities, data }) => {
  const [timeframe, setTimeframe] = useState<'All' | 'Q4 2026' | '2027+'>('All');

  // Filter opportunities by target closing date
  const filteredOpps = useMemo(() => {
    if (!opportunities) return [];
    if (timeframe === 'Q4 2026') {
      return opportunities.filter(o => o.expectedCloseDate && o.expectedCloseDate.startsWith('2026-1'));
    }
    if (timeframe === '2027+') {
      return opportunities.filter(o => o.expectedCloseDate && o.expectedCloseDate.startsWith('2027'));
    }
    return opportunities;
  }, [opportunities, timeframe]);

  // Aggregate monthly closing trajectory directly from actual opportunities
  const chartData = useMemo(() => {
    if (opportunities && opportunities.length > 0) {
      const bucketMap = new Map<string, { label: string; monthSort: string; pipeline: number; weighted: number; closedWon: number; count: number }>();

      filteredOpps.forEach((opp) => {
        const dateStr = opp.expectedCloseDate || opp.createdAt || '2026-11';
        const monthKey = dateStr.slice(0, 7);
        const [y, m] = monthKey.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const mIndex = parseInt(m, 10) - 1;
        const label = (mIndex >= 0 && mIndex < 12) ? `${monthNames[mIndex]} '${y.slice(2)}` : monthKey;

        if (!bucketMap.has(monthKey)) {
          bucketMap.set(monthKey, {
            label,
            monthSort: monthKey,
            pipeline: 0,
            weighted: 0,
            closedWon: 0,
            count: 0,
          });
        }

        const bucket = bucketMap.get(monthKey)!;
        const val = Number(opp.dealValue) || 0;
        const prob = parseFloat(String(opp.probability || '50%').replace(/[^0-9.]/g, '')) || 50;
        const weightedVal = Math.round(val * (prob / 100));

        bucket.pipeline += val;
        bucket.weighted += weightedVal;
        if (opp.stage === 'Closed Won') {
          bucket.closedWon += val;
        }
        bucket.count += 1;
      });

      return Array.from(bucketMap.values()).sort((a, b) => a.monthSort.localeCompare(b.monthSort));
    }

    // Fallback if opportunities prop is absent
    if (data && data.length > 0) {
      return data.map((d) => ({
        label: d.month,
        monthSort: d.month,
        pipeline: d.projected,
        weighted: Math.round(d.projected * 0.75),
        closedWon: d.revenue,
        count: 1,
      }));
    }

    return [];
  }, [opportunities, filteredOpps, data]);

  // Real summary metrics computed from actual records
  const totalPipeline = useMemo(() => {
    if (opportunities) {
      return filteredOpps.reduce((sum, o) => sum + (Number(o.dealValue) || 0), 0);
    }
    return data ? data.reduce((sum, d) => sum + d.projected, 0) : 0;
  }, [opportunities, filteredOpps, data]);

  const weightedPipeline = useMemo(() => {
    if (opportunities) {
      return filteredOpps.reduce((sum, o) => {
        const prob = parseFloat(String(o.probability || '50%').replace(/[^0-9.]/g, '')) || 50;
        return sum + Math.round((Number(o.dealValue) || 0) * (prob / 100));
      }, 0);
    }
    return Math.round(totalPipeline * 0.7);
  }, [opportunities, filteredOpps, totalPipeline]);

  const closedWonRevenue = useMemo(() => {
    if (opportunities) {
      return filteredOpps
        .filter((o) => o.stage === 'Closed Won')
        .reduce((sum, o) => sum + (Number(o.dealValue) || 0), 0);
    }
    return data ? data[data.length - 1]?.revenue || 0 : 0;
  }, [opportunities, filteredOpps, data]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#121222]/90 to-[#0e0e1a]/80 backdrop-blur-xl border border-purple-500/15 p-5 lg:p-6 shadow-xl">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-72 h-72 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base lg:text-lg font-bold text-white tracking-tight">
              Pipeline Velocity & Closing Schedule
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-semibold text-purple-300 bg-purple-900/40 rounded-full border border-purple-500/30 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-purple-400" />
              Live Pipeline Data
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Target closing schedule and probability-weighted pipeline calculated from active opportunities
          </p>
        </div>

        {/* Timeframe Filters */}
        <div className="flex items-center self-start sm:self-auto bg-zinc-900/80 p-1 rounded-xl border border-purple-500/20">
          {(['All', 'Q4 2026', '2027+'] as const).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
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

      {/* Honest Metrics Row (Computed from actual data) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/15">
        <div>
          <span className="text-[11px] text-zinc-400 block">Total Pipeline Target</span>
          <span className="text-lg font-bold text-white font-mono">{formatCurrency(totalPipeline)}</span>
        </div>
        <div>
          <span className="text-[11px] text-zinc-400 block">Weighted Forecast</span>
          <span className="text-lg font-bold text-purple-300 font-mono">{formatCurrency(weightedPipeline)}</span>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span className="text-[11px] text-zinc-400 block">Closed Won Realized</span>
          <span className="text-lg font-bold text-emerald-400 font-mono">{formatCurrency(closedWonRevenue)}</span>
        </div>
      </div>

      {/* Chart Canvas or Honest Empty State */}
      {chartData.length > 0 ? (
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9333ea" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#9333ea" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="indigoGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(147, 51, 234, 0.08)" vertical={false} />
              <XAxis 
                dataKey="label" 
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
                dataKey="pipeline" 
                name="Scheduled Pipeline"
                stroke="#a855f7" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#purpleGradient)" 
              />
              <Area 
                type="monotone" 
                dataKey="weighted" 
                name="Weighted Expected"
                stroke="#6366f1" 
                strokeWidth={1.8} 
                strokeDasharray="4 4"
                fillOpacity={1} 
                fill="url(#indigoGradient)" 
              />
              <Area 
                type="monotone" 
                dataKey="closedWon" 
                name="Closed Won"
                stroke="#22c55e" 
                strokeWidth={2} 
                fillOpacity={0} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 sm:h-72 w-full flex flex-col items-center justify-center text-center p-6 rounded-xl bg-purple-950/10 border border-dashed border-purple-500/20">
          <div className="w-12 h-12 rounded-2xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
            <TrendingUp className="w-6 h-6 text-purple-400/70" />
          </div>
          <h4 className="text-sm font-semibold text-white">No Pipeline Closing Schedule Available</h4>
          <p className="text-xs text-zinc-400 max-w-sm mt-1 leading-relaxed">
            There are currently no active opportunities in this timeframe. Add or update records in CRM to view live closing velocity and weighted forecast trends.
          </p>
        </div>
      )}

      {/* Legend footer */}
      {chartData.length > 0 && (
        <div className="flex flex-wrap items-center justify-end gap-5 mt-4 pt-3 border-t border-purple-500/10 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-purple-500 rounded-full" />
            <span>Scheduled Pipeline</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-indigo-500 rounded-full border border-dashed border-indigo-300" />
            <span>Weighted Forecast</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-emerald-400 rounded-full" />
            <span>Closed Won Realized</span>
          </div>
        </div>
      )}
    </div>
  );
};
