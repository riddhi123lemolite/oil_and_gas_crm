import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartTooltip } from './ChartTooltip';

export interface DonutSlice {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSlice[];
  height?: number;
  centerLabel?: string;
  centerValue?: string;
  valueFormatter?: (v: number) => string;
}

export function DonutChart({
  data,
  height = 240,
  centerLabel,
  centerValue,
  valueFormatter,
}: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row">
      <div className="relative" style={{ width: height, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="var(--bg-surface)"
              strokeWidth={2}
            >
              {data.map((slice) => (
                <Cell key={slice.name} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip formatter={valueFormatter} />} />
          </PieChart>
        </ResponsiveContainer>
        {(centerLabel || centerValue) && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            {centerValue && (
              <span className="num text-xl font-bold text-content">
                {centerValue}
              </span>
            )}
            {centerLabel && (
              <span className="text-[10px] uppercase tracking-wide text-content-muted">
                {centerLabel}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex-1 space-y-1.5">
        {data.map((slice) => (
          <div key={slice.name} className="flex items-center gap-2 text-sm">
            <span
              className="size-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: slice.color }}
            />
            <span className="truncate text-content-secondary">
              {slice.name}
            </span>
            <span className="num ml-auto shrink-0 font-medium text-content">
              {total > 0 ? ((slice.value / total) * 100).toFixed(1) : '0'}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
