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
import { FolderKanban } from 'lucide-react';
import { EmptyAnalyticsState } from './EmptyAnalyticsState';

export interface ProjectStatusDataPoint {
  status: string;
  count: number;
  avgProgress: number;
  color: string;
}

interface ProjectsStatusChartProps {
  data: ProjectStatusDataPoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ProjectStatusDataPoint;
  }>;
}

const CustomProjectTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="rounded-xl bg-[#0e0e1a]/95 backdrop-blur-md border border-purple-500/30 p-3 shadow-2xl">
        <p className="text-xs font-semibold text-purple-300 mb-1">{item.status}</p>
        <p className="text-sm font-bold text-white font-mono">{item.count} {item.count === 1 ? 'Initiative' : 'Initiatives'}</p>
        <p className="text-[11px] text-zinc-400 mt-0.5">Avg Progress: {item.avgProgress}%</p>
      </div>
    );
  }
  return null;
};

export const ProjectsStatusChart: React.FC<ProjectsStatusChartProps> = ({ data }) => {
  const hasData = data.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <div className="rounded-2xl bg-[#121222]/80 backdrop-blur-xl border border-purple-500/15 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">Projects by Status</h3>
            <span className="text-[10px] font-mono text-purple-300/80 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/25">
              Live Projects
            </span>
          </div>
        </div>
        <EmptyAnalyticsState
          title="No Initiatives Found"
          description="No projects match the selected filter. Create new delivery initiatives in Projects to view sprint status analytics."
          icon={FolderKanban}
        />
      </div>
    );
  }

  const totalProjects = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="rounded-2xl bg-[#121222]/80 backdrop-blur-xl border border-purple-500/15 p-5 shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-white">Projects by Status</h3>
            <span className="text-[10px] font-mono text-purple-300/80 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/25">
              Live Projects
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Delivery initiative status breakdown and sprint velocity health
          </p>
        </div>
        <span className="font-mono text-xs font-semibold text-purple-300">
          {totalProjects} Active Initiatives
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
            <Tooltip content={<CustomProjectTooltip />} cursor={{ fill: 'rgba(168, 85, 247, 0.08)' }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((entry) => (
                <Cell 
                  key={entry.status} 
                  fill={entry.color} 
                  style={{ filter: 'drop-shadow(0px 2px 8px rgba(168, 85, 247, 0.25))' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-purple-500/10 text-xs text-zinc-400 mt-2">
        <span>Tracked Initiatives: <strong className="text-white font-mono">{totalProjects}</strong></span>
        <span>Sprint Velocity: <strong className="text-emerald-400 font-mono">Nominal</strong></span>
      </div>
    </div>
  );
};

