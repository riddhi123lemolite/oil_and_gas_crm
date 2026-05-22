import {
  Bar,
  BarChart as ReBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartTooltip } from './ChartTooltip';

interface BarChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  barKey: string;
  barName?: string;
  color?: string;
  height?: number;
  horizontal?: boolean;
  valueFormatter?: (v: number) => string;
}

export function BarChart({
  data,
  xKey,
  barKey,
  barName = 'Value',
  color = '#0F3D5C',
  height = 280,
  horizontal,
  valueFormatter,
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart
        data={data}
        layout={horizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 8, right: 12, left: horizontal ? 12 : 0, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          vertical={horizontal}
          horizontal={!horizontal}
        />
        {horizontal ? (
          <>
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                valueFormatter ? valueFormatter(Number(v)) : String(v)
              }
            />
            <YAxis
              type="category"
              dataKey={xKey}
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              axisLine={false}
              tickLine={false}
              width={120}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              axisLine={false}
              tickLine={false}
              width={56}
              tickFormatter={(v) =>
                valueFormatter ? valueFormatter(Number(v)) : String(v)
              }
            />
          </>
        )}
        <Tooltip
          content={<ChartTooltip formatter={valueFormatter} />}
          cursor={{ fill: 'var(--bg-muted)' }}
        />
        <Bar
          dataKey={barKey}
          name={barName}
          fill={color}
          radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
          maxBarSize={44}
        />
      </ReBarChart>
    </ResponsiveContainer>
  );
}
