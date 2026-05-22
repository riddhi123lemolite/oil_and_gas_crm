import { formatNumber } from '@/lib/format';

export interface FunnelStage {
  label: string;
  value: number;
  color: string;
}

interface FunnelChartProps {
  stages: FunnelStage[];
  valueSuffix?: string;
}

/** A simple horizontal funnel — each stage scaled to the largest. */
export function FunnelChart({ stages, valueSuffix }: FunnelChartProps) {
  const max = Math.max(...stages.map((s) => s.value), 1);
  const first = stages[0]?.value ?? 0;

  return (
    <div className="space-y-2">
      {stages.map((stage, i) => {
        const widthPct = Math.max((stage.value / max) * 100, 6);
        const conv =
          first > 0 ? ((stage.value / first) * 100).toFixed(0) : '0';
        return (
          <div key={stage.label} className="flex items-center gap-3">
            <div className="w-28 shrink-0 text-right text-xs font-medium text-content-secondary">
              {stage.label}
            </div>
            <div className="flex-1">
              <div
                className="flex h-9 items-center justify-between rounded-md px-3 text-white transition-all"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: stage.color,
                  minWidth: 90,
                }}
              >
                <span className="num text-sm font-semibold">
                  {formatNumber(stage.value)}
                  {valueSuffix}
                </span>
              </div>
            </div>
            <div className="w-12 shrink-0 text-xs font-medium text-content-muted">
              {i === 0 ? '100%' : `${conv}%`}
            </div>
          </div>
        );
      })}
    </div>
  );
}
