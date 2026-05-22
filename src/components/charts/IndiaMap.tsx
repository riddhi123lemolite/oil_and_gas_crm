import { useMemo } from 'react';
import { Tooltip } from '@/components/ui/tooltip';

// A tile-grid representation of India — each state a cell positioned
// approximately by geography. Self-contained, dark-mode aware, and works
// as a clickable choropleth without any external map data.
interface StateTile {
  name: string;
  abbr: string;
  col: number;
  row: number;
}

const TILES: StateTile[] = [
  { name: 'Himachal Pradesh', abbr: 'HP', col: 3, row: 0 },
  { name: 'Punjab', abbr: 'PB', col: 2, row: 1 },
  { name: 'Haryana', abbr: 'HR', col: 3, row: 1 },
  { name: 'Uttarakhand', abbr: 'UK', col: 4, row: 1 },
  { name: 'Rajasthan', abbr: 'RJ', col: 2, row: 2 },
  { name: 'Delhi', abbr: 'DL', col: 3, row: 2 },
  { name: 'Uttar Pradesh', abbr: 'UP', col: 4, row: 2 },
  { name: 'Bihar', abbr: 'BR', col: 5, row: 2 },
  { name: 'Assam', abbr: 'AS', col: 7, row: 2 },
  { name: 'Gujarat', abbr: 'GJ', col: 1, row: 3 },
  { name: 'Madhya Pradesh', abbr: 'MP', col: 3, row: 3 },
  { name: 'Jharkhand', abbr: 'JH', col: 5, row: 3 },
  { name: 'West Bengal', abbr: 'WB', col: 6, row: 3 },
  { name: 'Maharashtra', abbr: 'MH', col: 2, row: 4 },
  { name: 'Chhattisgarh', abbr: 'CG', col: 4, row: 4 },
  { name: 'Odisha', abbr: 'OD', col: 5, row: 4 },
  { name: 'Goa', abbr: 'GA', col: 1, row: 5 },
  { name: 'Telangana', abbr: 'TG', col: 3, row: 5 },
  { name: 'Karnataka', abbr: 'KA', col: 2, row: 6 },
  { name: 'Andhra Pradesh', abbr: 'AP', col: 3, row: 6 },
  { name: 'Kerala', abbr: 'KL', col: 2, row: 7 },
  { name: 'Tamil Nadu', abbr: 'TN', col: 3, row: 7 },
];

interface IndiaMapProps {
  data: Record<string, number>;
  selected?: string | null;
  onSelect?: (state: string | null) => void;
  valueFormatter?: (v: number) => string;
}

export function IndiaMap({
  data,
  selected,
  onSelect,
  valueFormatter,
}: IndiaMapProps) {
  const max = useMemo(
    () => Math.max(...Object.values(data), 1),
    [data],
  );

  const cell = 44;
  const gap = 5;
  const cols = 9;
  const rows = 8;

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${cols * (cell + gap)} ${rows * (cell + gap)}`}
        className="w-full max-w-[380px]"
      >
        {TILES.map((tile) => {
          const value = data[tile.name] ?? 0;
          const intensity = value / max;
          const isSelected = selected === tile.name;
          const x = tile.col * (cell + gap);
          const y = tile.row * (cell + gap);
          return (
            <Tooltip
              key={tile.name}
              content={
                <span>
                  <strong>{tile.name}</strong>
                  {' — '}
                  {valueFormatter
                    ? valueFormatter(value)
                    : value.toLocaleString('en-IN')}
                </span>
              }
            >
              <g
                className="cursor-pointer"
                onClick={() =>
                  onSelect?.(isSelected ? null : tile.name)
                }
              >
                <rect
                  x={x}
                  y={y}
                  width={cell}
                  height={cell}
                  rx={6}
                  fill={
                    intensity > 0.02
                      ? '#0F3D5C'
                      : 'var(--bg-muted)'
                  }
                  fillOpacity={
                    intensity > 0.02 ? 0.2 + intensity * 0.8 : 1
                  }
                  stroke={isSelected ? '#E87722' : 'var(--border)'}
                  strokeWidth={isSelected ? 2.5 : 1}
                />
                <text
                  x={x + cell / 2}
                  y={y + cell / 2 + 3}
                  textAnchor="middle"
                  className="select-none text-[10px] font-semibold"
                  fill={intensity > 0.5 ? '#fff' : 'var(--text-secondary)'}
                >
                  {tile.abbr}
                </text>
              </g>
            </Tooltip>
          );
        })}
      </svg>
      <div className="mt-2 flex items-center gap-2 text-[10px] text-content-muted">
        <span>Low</span>
        <div className="flex">
          {[0.2, 0.4, 0.6, 0.8, 1].map((o) => (
            <span
              key={o}
              className="size-3"
              style={{ backgroundColor: '#0F3D5C', opacity: o }}
            />
          ))}
        </div>
        <span>High</span>
        {selected && (
          <button
            onClick={() => onSelect?.(null)}
            className="ml-2 font-medium text-brand-secondary hover:underline"
          >
            Clear filter ({selected})
          </button>
        )}
      </div>
    </div>
  );
}
