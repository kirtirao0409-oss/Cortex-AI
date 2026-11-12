import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell,
  CartesianGrid 
} from 'recharts';
import { Layers } from 'lucide-react';
import { EmptyAnalyticsState } from './EmptyAnalyticsState';

export interface StageDataPoint {
  stage: string;
  count: number;
  value: number;
  formattedValue: string;
  color: string;
}

interface OpportunitiesStageChartProps {
  data: StageDataPoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: StageDataPoint;
  }>;
}

const CustomStageTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="rounded-xl bg-[#0e0e1a]/95 backdrop-blur-md border border-purple-500/30 p-3 shadow-2xl">
        <p className="text-xs font-semibold text-purple-300 mb-1">{item.stage}</p>
        <p className="text-sm font-bold text-white font-mono">{item.formattedValue}</p>
        <p className="text-[11px] text-zinc-400 mt-0.5">{item.count} Active {item.count === 1 ? 'Deal' : 'Deals'}</p>
      </div>
    );
  }
  return null;
};

export const OpportunitiesStageChart: React.FC<OpportunitiesStageChartProps> = ({ data }) => {
  const hasData = data.some((d) => d.count > 0 || d.value > 0);

  if (!hasData) {
    return (
      <div className="rounded-2xl bg-[#121222]/80 backdrop-blur-xl border border-purple-500/15 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">Opportunities by Stage</h3>
            <span className="text-[10px] font-mono text-purple-300/80 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/25">
              Live CRM
            </span>
          </div>
        </div>
        <EmptyAnalyticsState
          title="No Opportunities in Range"
          description="No active CRM opportunities match the current date or stage filters. Add deals in CRM to populate this chart."
          icon={Layers}
        />
      </div>
    );
  }

  const totalValue = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="rounded-2xl bg-[#121222]/80 backdrop-blur-xl border border-purple-500/15 p-5 shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-white">Opportunities by Stage</h3>
            <span className="text-[10px] font-mono text-purple-300/80 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/25">
              Live CRM
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Pipeline value distribution calculated from live CRM opportunities
          </p>
        </div>
        <span className="font-mono text-xs font-semibold text-purple-300">
          ${(totalValue / 1000).toLocaleString()}k Total
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e1065" opacity={0.25} vertical={false} />
            <XAxis 
              dataKey="stage" 
              stroke="#71717a" 
              fontSize={10} 
              tickLine={false}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis 
              stroke="#71717a" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomStageTooltip />} cursor={{ fill: 'rgba(168, 85, 247, 0.08)' }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((entry) => (
                <Cell 
                  key={entry.stage} 
                  fill={entry.color} 
                  style={{ filter: 'drop-shadow(0px 2px 8px rgba(147, 51, 234, 0.25))' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-3 border-t border-purple-500/10 mt-2">
        {data.map((s) => (
          <div key={s.stage} className="text-center">
            <span className="text-[10px] text-zinc-400 block truncate">{s.stage}</span>
            <span className="text-xs font-mono font-bold text-white block">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

