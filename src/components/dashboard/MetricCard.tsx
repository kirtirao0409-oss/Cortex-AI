import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { KpiMetric } from '../../types';

interface MetricCardProps {
  metric: KpiMetric;
  index: number;
}

export const MetricCard: React.FC<MetricCardProps> = ({ metric, index }) => {
  const Icon = metric.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08, ease: 'easeOut' }}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#121222]/90 to-[#0e0e1a]/80 backdrop-blur-xl border border-purple-500/15 p-5 hover:border-purple-500/35 hover:shadow-xl hover:shadow-purple-950/30 transition-all duration-300"
    >
      {/* Subtle top edge gradient line */}
      <div 
        className="absolute top-0 left-0 right-0 h-[2px] opacity-70 group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(90deg, transparent, ${metric.color}, transparent)`,
        }}
      />

      {/* Background ambient radial glow */}
      <div 
        className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity"
        style={{ backgroundColor: metric.color }}
      />

      {/* Card Header: Title & Icon */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">
          {metric.title}
        </span>
        <div 
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-purple-500/20 shadow-inner group-hover:scale-105 transition-transform"
          style={{
            backgroundColor: `${metric.color}15`,
            color: metric.color,
          }}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2 mb-2">
        <h3 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-sans">
          {metric.value}
        </h3>
      </div>

      {/* Change & Period */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
            metric.isPositive
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}
        >
          {metric.isPositive ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : (
            <ArrowDownRight className="w-3 h-3" />
          )}
          {metric.change}
        </span>
        <span className="text-[11px] text-zinc-500 truncate">{metric.period}</span>
      </div>

      {/* Subtext info */}
      <div className="pt-2 border-t border-purple-500/10">
        <p className="text-[11px] text-purple-200/60 truncate">
          {metric.subtext}
        </p>
      </div>
    </motion.div>
  );
};
