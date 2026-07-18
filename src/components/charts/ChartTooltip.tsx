import type { TooltipProps } from 'recharts';

/** Shared dark-mode-aware tooltip for Recharts charts. */
export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: TooltipProps<number, string> & {
  formatter?: (value: number) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="glass-tooltip rounded-xl border px-3 py-2 backdrop-blur-xl backdrop-saturate-150">
      {label != null && (
        <div className="mb-1 text-xs font-semibold text-content">{label}</div>
      )}
      <div className="space-y-0.5">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-content-secondary">{entry.name}</span>
            <span className="num ml-auto font-medium text-content">
              {formatter
                ? formatter(Number(entry.value))
                : Number(entry.value).toLocaleString('en-IN')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
