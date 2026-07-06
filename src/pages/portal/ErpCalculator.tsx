import { useState } from 'react';
import { Calculator, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { formatNumber } from '@/lib/format';
import { generateId } from '@/lib/utils';

interface Tank {
  id: string;
  note: string;
  price: string;
  density: string;
  litre: string;
}

const emptyTank = (note = ''): Tank => ({
  id: generateId('tank'),
  note,
  price: '',
  density: '',
  litre: '',
});

const num = (s: string): number => {
  const v = parseFloat(s);
  return Number.isFinite(v) ? v : 0;
};

const inr = (v: number): string =>
  `₹${v.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export default function ErpCalculator() {
  const [tanks, setTanks] = useState<Tank[]>([emptyTank('Tank 1'), emptyTank('Tank 2'), emptyTank('Tank 3')]);
  const [tankNo, setTankNo] = useState('');

  const rows = tanks.map((t) => {
    const priceN = num(t.price);
    const densityN = num(t.density);
    const litreN = num(t.litre);
    const kg = (litreN * densityN) / 1000; // kg = (litre × density) / 1000
    const lineTotal = priceN * litreN; // price × litre
    return { ...t, litreN, kg, lineTotal };
  });

  const totalLitre = rows.reduce((s, r) => s + r.litreN, 0);
  const totalKg = rows.reduce((s, r) => s + r.kg, 0);
  const totalPrice = rows.reduce((s, r) => s + r.lineTotal, 0);
  const avgPrice = totalLitre ? totalPrice / totalLitre : 0; // Total Price ÷ Total Litre
  const avgDensity = totalLitre ? (totalKg / totalLitre) * 1000 : 0; // weighted density

  const update = (id: string, field: keyof Tank, value: string) =>
    setTanks((ts) => ts.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  const remove = (id: string) => setTanks((ts) => ts.filter((t) => t.id !== id));
  const addTank = () => {
    setTanks((ts) => [...ts, emptyTank(tankNo.trim() ? `Tank ${tankNo.trim()}` : `Tank ${ts.length + 1}`)]);
    setTankNo('');
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="ERP Calculator"
        description="Density, weight and blended-price costing across tanks — instantly."
        icon={<Calculator />}
      />

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <SummaryTile label="Total Litre" value={`${formatNumber(totalLitre, 2)} L`} />
        <SummaryTile label="Total Kg" value={`${formatNumber(totalKg, 2)} kg`} />
        <SummaryTile label="Avg Density" value={`${formatNumber(avgDensity, 2)} g/L`} accent="#0891B2" />
        <SummaryTile label="Avg Price" value={`${inr(avgPrice)} /L`} accent="#00A878" />
        <SummaryTile label="Total Price" value={inr(totalPrice)} accent="#E87722" />
      </div>

      {/* Tank table */}
      <div className="card overflow-hidden">
        <div className="hidden grid-cols-[1.4fr_repeat(4,1fr)_auto] gap-3 border-b border-line bg-muted px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-content-muted md:grid">
          <span>Notes / Info</span>
          <span className="text-right">Price (₹/L)</span>
          <span className="text-right">Density (g/L)</span>
          <span className="text-right">Litre</span>
          <span className="text-right">Kg</span>
          <span className="w-9" />
        </div>

        <div className="divide-y divide-line">
          {rows.map((r, i) => (
            <div
              key={r.id}
              className="grid grid-cols-1 gap-3 px-4 py-3 md:grid-cols-[1.4fr_repeat(4,1fr)_auto] md:items-center"
            >
              <input
                className="input-base"
                placeholder={`Tank ${i + 1} — notes / info`}
                value={r.note}
                onChange={(e) => update(r.id, 'note', e.target.value)}
              />
              <NumCell label="Price (₹/L)" value={r.price} onChange={(v) => update(r.id, 'price', v)} />
              <NumCell label="Density (g/L)" value={r.density} onChange={(v) => update(r.id, 'density', v)} />
              <NumCell label="Litre" value={r.litre} onChange={(v) => update(r.id, 'litre', v)} />
              <div className="flex items-center justify-between md:justify-end">
                <span className="text-xs text-content-muted md:hidden">Kg</span>
                <span className="num font-semibold text-success">{formatNumber(r.kg, 2)}</span>
              </div>
              <button
                onClick={() => remove(r.id)}
                className="justify-self-end rounded-md p-2 text-danger transition-colors hover:bg-danger/10"
                aria-label="Remove tank"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add tank */}
        <div className="flex items-center gap-3 border-t border-line bg-muted/40 px-4 py-3">
          <input
            className="input-base max-w-xs"
            placeholder="Tank No"
            value={tankNo}
            onChange={(e) => setTankNo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTank()}
          />
          <button
            onClick={addTank}
            className="inline-flex items-center gap-2 rounded-md bg-brand-secondary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-secondary/90"
          >
            <Plus className="size-4" /> Add Tank
          </button>
        </div>
      </div>

      <p className="text-xs text-content-muted">
        Formulas: <span className="num">kg = (litre × density) ÷ 1000</span> ·{' '}
        <span className="num">Avg Price = Total Price ÷ Total Litre</span> ·{' '}
        <span className="num">Avg Density = (Total Kg ÷ Total Litre) × 1000</span>
      </p>
    </div>
  );
}

function SummaryTile({ label, value, accent = '#0F3D5C' }: { label: string; value: string; accent?: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-content-muted">{label}</div>
      <div className="num mt-1 text-xl font-semibold" style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
}

function NumCell({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-2 md:block">
      <span className="text-xs text-content-muted md:hidden">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        className="input-base w-full text-right md:w-full"
        placeholder="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
