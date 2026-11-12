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
import { Users } from 'lucide-react';
import { EmptyAnalyticsState } from './EmptyAnalyticsState';

export interface HrmsStatusDataPoint {
  status: string;
  count: number;
  applicants: number;
  color: string;
}

interface HrmsStatusChartProps {
  data: HrmsStatusDataPoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: HrmsStatusDataPoint;
  }>;
}

const CustomHrmsTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="rounded-xl bg-[#0e0e1a]/95 backdrop-blur-md border border-purple-500/30 p-3 shadow-2xl">
        <p className="text-xs font-semibold text-purple-300 mb-1">{item.status}</p>
        <p className="text-sm font-bold text-white font-mono">{item.count} {item.count === 1 ? 'Requisition' : 'Requisitions'}</p>
        <p className="text-[11px] text-zinc-400 mt-0.5">{item.applicants} Candidates Screened</p>
      </div>
    );
  }
  return null;
};

export const HrmsStatusChart: React.FC<HrmsStatusChartProps> = ({ data }) => {
  const hasData = data.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <div className="rounded-2xl bg-[#121222]/80 backdrop-blur-xl border border-purple-500/15 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">Requisitions by Status</h3>
            <span className="text-[10px] font-mono text-purple-300/80 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/25">
              Live HRMS
            </span>
          </div>
        </div>
        <EmptyAnalyticsState
          title="No Requisitions Found"
          description="No HRMS requisitions match the selected criteria. Open requisitions in HRMS to view candidate intake status."
          icon={Users}
        />
      </div>
    );
  }

  const totalOpenings = data.reduce((acc, curr) => acc + curr.count, 0);
  const totalApplicants = data.reduce((acc, curr) => acc + curr.applicants, 0);

  return (
    <div className="rounded-2xl bg-[#121222]/80 backdrop-blur-xl border border-purple-500/15 p-5 shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-white">Requisitions by Status</h3>
            <span className="text-[10px] font-mono text-purple-300/80 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/25">
              Live HRMS
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Talent intake & screening workflow progress from active HRMS data
          </p>
        </div>
        <span className="font-mono text-xs font-semibold text-emerald-300">
          {totalApplicants} Candidates
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e1065" opacity={0.25} vertical={false} />
            <XAxis 
              dataKey="status" 
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
              allowDecimals={false}
            />
            <Tooltip content={<CustomHrmsTooltip />} cursor={{ fill: 'rgba(168, 85, 247, 0.08)' }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((entry) => (
                <Cell 
                  key={entry.status} 
                  fill={entry.color}
                  style={{ filter: 'drop-shadow(0px 2px 8px rgba(99, 102, 241, 0.25))' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-purple-500/10 text-xs text-zinc-400 mt-2">
        <span>Active Requisitions: <strong className="text-white font-mono">{totalOpenings}</strong></span>
        <span>Total Screened: <strong className="text-purple-300 font-mono">{totalApplicants}</strong></span>
      </div>
    </div>
  );
};

