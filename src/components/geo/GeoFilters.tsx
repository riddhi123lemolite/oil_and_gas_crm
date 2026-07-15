import { RotateCcw } from 'lucide-react';
import type { ReactNode } from 'react';
import { SelectField } from '@/components/forms/SelectField';
import { Button } from '@/components/ui/button';
import { CUSTOMER_SEGMENT, ITEM_CATEGORY } from '@/lib/constants';
import { REGIONS } from '@/lib/geo/regions';
import { BUSINESS_UNITS, salesExecutives } from '@/lib/geo/analyticsService';
import type { GeoFilters as GeoFiltersState } from '@/lib/geo/types';
import type { User } from '@/types';

const DATE_OPTIONS = [
  { value: 'all', label: 'All time' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'quarter', label: 'This quarter' },
  { value: 'fy', label: 'This financial year' },
  { value: '12m', label: 'Last 12 months' },
];

interface GeoFiltersProps {
  filters: GeoFiltersState;
  onChange: (patch: Partial<GeoFiltersState>) => void;
  onReset: () => void;
  users: User[];
  isDirty: boolean;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wide text-content-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

export function GeoFilters({
  filters,
  onChange,
  onReset,
  users,
  isDirty,
}: GeoFiltersProps) {
  const execOptions = [
    { value: 'all', label: 'All executives' },
    ...salesExecutives(users).map((u) => ({ value: u.id, label: u.name })),
  ];
  const regionOptions = [
    { value: 'all', label: 'All regions' },
    ...REGIONS.map((r) => ({ value: r, label: r })),
  ];
  const buOptions = [
    { value: 'all', label: 'All business units' },
    ...BUSINESS_UNITS.map((b) => ({ value: b.key, label: b.label })),
  ];
  const productOptions = [
    { value: 'all', label: 'All products' },
    ...Object.entries(ITEM_CATEGORY).map(([value, { label }]) => ({
      value,
      label,
    })),
  ];
  const customerOptions = [
    { value: 'all', label: 'All customer types' },
    ...Object.entries(CUSTOMER_SEGMENT).map(([value, { label }]) => ({
      value,
      label,
    })),
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <Field label="Date range">
        <SelectField
          value={filters.dateRange}
          onChange={(v) => onChange({ dateRange: v as GeoFiltersState['dateRange'] })}
          options={DATE_OPTIONS}
        />
      </Field>
      <Field label="Region">
        <SelectField
          value={filters.region}
          onChange={(v) => onChange({ region: v as GeoFiltersState['region'] })}
          options={regionOptions}
        />
      </Field>
      <Field label="Sales executive">
        <SelectField
          value={filters.salesExecId}
          onChange={(v) => onChange({ salesExecId: v })}
          options={execOptions}
        />
      </Field>
      <Field label="Business unit">
        <SelectField
          value={filters.businessUnit}
          onChange={(v) => onChange({ businessUnit: v })}
          options={buOptions}
        />
      </Field>
      <Field label="Product type">
        <SelectField
          value={filters.productType}
          onChange={(v) =>
            onChange({ productType: v as GeoFiltersState['productType'] })
          }
          options={productOptions}
        />
      </Field>
      <Field label="Customer type">
        <SelectField
          value={filters.customerType}
          onChange={(v) =>
            onChange({ customerType: v as GeoFiltersState['customerType'] })
          }
          options={customerOptions}
        />
      </Field>
      {isDirty && (
        <div className="col-span-2 flex justify-end sm:col-span-3 lg:col-span-6">
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="size-3.5" /> Reset filters
          </Button>
        </div>
      )}
    </div>
  );
}
