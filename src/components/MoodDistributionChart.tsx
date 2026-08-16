import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import { MoodCategoryData } from '../utils/moodAnalytics';
import { BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';

interface MoodDistributionChartProps {
  moodData: MoodCategoryData[];
  totalEntries: number;
  onSelectMoodCategory?: (category: string) => void;
}

// Custom Tooltip component for Recharts
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: MoodCategoryData;
    value: number;
  }>;
}

const CustomMoodTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl space-y-1 text-xs z-50">
        <div className="flex items-center gap-2 font-bold text-white">
          <span className="text-base">{data.emoji}</span>
          <span>{data.displayName}</span>
        </div>
        <div className="text-slate-300 flex items-center justify-between gap-4">
          <span className="text-slate-400">Occurrences:</span>
          <span className="font-semibold text-white">
            {data.count} ({data.percentage}%)
          </span>
        </div>
        <p className="text-[11px] text-slate-400 max-w-[200px] leading-tight pt-1 border-t border-slate-800">
          {data.description}
        </p>
      </div>
    );
  }
  return null;
};

export const MoodDistributionChart: React.FC<MoodDistributionChartProps> = ({
  moodData,
  totalEntries,
  onSelectMoodCategory,
}) => {
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (totalEntries === 0) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center space-y-2">
        <Activity className="w-8 h-8 text-slate-600 mx-auto" />
        <p className="text-sm font-semibold text-slate-300">No Mood Data Logged Yet</p>
        <p className="text-xs text-slate-500">
          Save translations to see real-time emotional and psychological canine mood trends.
        </p>
      </div>
    );
  }

  // Filter out categories with 0 count for the pie chart to keep it clean
  const nonZeroData = moodData.filter((d) => d.count > 0);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
      {/* Chart Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-3">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span>Detected Mood & Emotional Spectrum</span>
          </h3>
          <p className="text-[11px] text-slate-400">
            Psychological breakdown based on canine vision micro-expressions {onSelectMoodCategory ? '(click to filter scrapbook)' : ''}
          </p>
        </div>

        {/* Bar vs Pie toggle */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            id="mood-chart-bar-view-btn"
            onClick={() => setChartType('bar')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              chartType === 'bar'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Bar</span>
          </button>
          <button
            id="mood-chart-pie-view-btn"
            onClick={() => setChartType('pie')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              chartType === 'pie'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieChartIcon className="w-3.5 h-3.5" />
            <span>Donut</span>
          </button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="w-full h-64 sm:h-72">
        {chartType === 'bar' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={moodData}
              margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              onClick={(state: unknown) => {
                const s = state as { activePayload?: Array<{ payload: MoodCategoryData }> } | null;
                if (s && s.activePayload && s.activePayload.length && onSelectMoodCategory) {
                  const clickedItem = s.activePayload[0].payload;
                  if (clickedItem && clickedItem.category) {
                    onSelectMoodCategory(clickedItem.category);
                  }
                }
              }}
              onMouseMove={(state) => {
                if (state && state.activeTooltipIndex !== undefined) {
                  setActiveIndex(Number(state.activeTooltipIndex));
                }
              }}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <XAxis
                dataKey="displayName"
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                interval={0}
                tick={(props) => {
                  const { x, y, payload } = props;
                  const item = moodData.find((d) => d.displayName === payload.value);
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={0}
                        y={0}
                        dy={12}
                        textAnchor="end"
                        fill="#94a3b8"
                        fontSize={10}
                        transform="rotate(-25)"
                      >
                        {item ? `${item.emoji} ${item.displayName.split(' ')[0]}` : payload.value}
                      </text>
                    </g>
                  );
                }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomMoodTooltip />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48} className={onSelectMoodCategory ? 'cursor-pointer' : ''}>
                {moodData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                    className="transition-all duration-300"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={nonZeroData.length > 0 ? nonZeroData : [{ displayName: 'None', count: 1, color: '#334155', emoji: '🐾', percentage: 100, category: 'none', description: 'No entries' }]}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="count"
                nameKey="displayName"
                onClick={(entryData: unknown) => {
                  const item = entryData as { category?: string } | null;
                  if (onSelectMoodCategory && item && item.category) {
                    onSelectMoodCategory(item.category);
                  }
                }}
                className={onSelectMoodCategory ? 'cursor-pointer' : ''}
              >
                {nonZeroData.map((entry, index) => (
                  <Cell key={`pie-cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomMoodTooltip />} />
              <Legend
                verticalAlign="bottom"
                iconSize={8}
                formatter={(value: string) => {
                  const item = moodData.find((d) => d.displayName === value);
                  return (
                    <span className="text-slate-300 text-[11px] font-medium mr-2">
                      {item?.emoji} {value}
                    </span>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Quick Summary Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-900">
        {moodData.slice(0, 3).map((item) => (
          <button
            key={item.category}
            onClick={() => onSelectMoodCategory && onSelectMoodCategory(item.category)}
            className={`p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-left transition-all ${
              onSelectMoodCategory ? 'hover:border-indigo-500/50 hover:bg-slate-800/80 cursor-pointer' : ''
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="text-sm">{item.emoji}</span>
              <div className="truncate">
                <p className="text-[11px] font-bold text-slate-200 truncate">{item.displayName}</p>
                <p className="text-[10px] text-slate-400">{item.count} detections</p>
              </div>
            </div>
            <span
              className="text-xs font-extrabold px-2 py-0.5 rounded-md shrink-0"
              style={{ backgroundColor: `${item.color}20`, color: item.color }}
            >
              {item.percentage}%
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
