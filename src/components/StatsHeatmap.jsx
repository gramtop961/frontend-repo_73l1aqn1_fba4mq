import React, { useMemo } from 'react';

function generateWeeks(days = 84) {
  const today = new Date();
  const grid = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    grid.push(d);
  }
  return grid;
}

export default function StatsHeatmap({ stats = {}, accent = 'indigo-500' }) {
  const days = useMemo(() => generateWeeks(84), []); // 12 weeks

  const maxCount = Math.max(1, ...Object.values(stats));

  const intensity = (dateKey) => {
    const c = stats[dateKey] || 0;
    if (c === 0) return 'bg-slate-200/50 dark:bg-slate-700/40';
    const pct = c / maxCount;
    if (pct > 0.75) return 'bg-emerald-600';
    if (pct > 0.5) return 'bg-emerald-500';
    if (pct > 0.25) return 'bg-emerald-400';
    return 'bg-emerald-300';
  };

  return (
    <div className="rounded-2xl p-5 border bg-white/70 dark:bg-white/5 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="font-medium">Productivity Heatmap</div>
        <div className="text-xs text-slate-500">Last 12 weeks</div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <div className="grid grid-flow-col auto-cols-max gap-1">
          {/* columns of 7 days */}
          {Array.from({ length: Math.ceil(days.length / 7) }).map((_, col) => (
            <div key={col} className="grid grid-rows-7 gap-1">
              {days.slice(col * 7, col * 7 + 7).map((d) => {
                const key = d.toISOString().slice(0, 10);
                return <div key={key} className={`w-3.5 h-3.5 rounded-[3px] ${intensity(key)}`} title={`${key}: ${stats[key] || 0} session(s)`} />;
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 text-xs text-slate-500">
        Each completed focus session fills a square. Build your streak over time.
      </div>
    </div>
  );
}
