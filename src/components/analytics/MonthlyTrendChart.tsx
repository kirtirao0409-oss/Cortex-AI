import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Legend 
} from 'recharts';
import { Calendar } from 'lucide-react';
import { EmptyAnalyticsState } from './EmptyAnalyticsState';

export interface MonthlyTrendDataPoint {
  month: string;
  pipelineValueK: number;
  dealsCount: number;
  projectsCount: number;
}

interface MonthlyTrendChartProps {
  data: MonthlyTrendDataPoint[];
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

const CustomTrendTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl bg-[#0e0e1a]/95 backdrop-blur-md border border-purple-500/30 p-3 shadow-2xl">
        <p className="text-xs font-semibold text-purple-300 mb-1.5 font-mono">
          Month: {label}
        </p>
        <div className="space-y-1 text-xs">
          {payload.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: item.color }} 
                />
                {item.name}:
              </span>
              <span className="font-mono font-semibold text-white">
                {item.name.includes('Pipeline') ? `$${item.value.toLocaleString()}k` : item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({ data }) => {
  const hasData = data.some((d) => d.pipelineValueK > 0 || d.dealsCount > 0 || d.projectsCount > 0);

  if (!hasData) {
    return (
      <div className="rounded-2xl bg-[#121222]/80 backdrop-blur-xl border border-purple-500/15 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">Cross-Module Trajectory Trends</h3>
            <span className="text-[10px] font-mono text-purple-300/80 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/25">
              Monthly Timeline
            </span>
          </div>
        </div>
        <EmptyAnalyticsState
          title="No Trend Data in Range"
          description="Insufficient date records found for the selected time horizon. Adjust filters to view monthly deal and initiative trajectories."
          icon={Calendar}
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#121222]/80 backdrop-blur-xl border border-purple-500/15 p-5 lg:p-6 shadow-xl flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm lg:text-base font-bold text-white">
              Cross-Module Trajectory Trends
            </h3>
            <span className="text-[10px] font-mono text-purple-300/80 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/25">
              Temporal Analytics
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Monthly pipeline deal pacing alongside initiative delivery volume
          </p>
        </div>
        <span className="text-[11px] font-mono text-zinc-400">
          Source: Live Opportunity & Project timestamps
        </span>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="analyticsPipelineGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="analyticsProjectsGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e1065" opacity={0.25} vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="#71717a" 
              fontSize={11} 
              tickLine={false} 
            />
            <YAxis 
              stroke="#71717a" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `$${val}k`}
            />
            <Tooltip content={<CustomTrendTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} 
              iconType="circle"
            />
            <Area 
              type="monotone" 
              dataKey="pipelineValueK" 
              name="Pipeline Value ($k)" 
              stroke="#a855f7" 
              strokeWidth={2}
              fill="url(#analyticsPipelineGlow)" 
            />
            <Area 
              type="monotone" 
              dataKey="projectsCount" 
              name="Active Initiatives" 
              stroke="#06b6d4" 
              strokeWidth={2}
              fill="url(#analyticsProjectsGlow)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-purple-500/10 text-xs text-zinc-400 mt-2">
        <span>Timeline: <strong className="text-white font-mono">{data[0]?.month} — {data[data.length - 1]?.month}</strong></span>
        <span>Aggregation: <strong className="text-purple-300 font-mono">Monthly Calendar Cohorts</strong></span>
      </div>
    </div>
  );
};

