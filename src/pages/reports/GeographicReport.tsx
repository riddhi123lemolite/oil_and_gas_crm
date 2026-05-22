import { useMemo, useState } from 'react';
import { Map as MapIcon } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndiaMap } from '@/components/charts/IndiaMap';
import { EmptyState } from '@/components/shared/EmptyState';
import { useDataStore } from '@/stores/dataStore';
import { formatINR, formatINRCompact } from '@/lib/format';

export default function GeographicReport() {
  const { invoices, customers } = useDataStore();
  const [selected, setSelected] = useState<string | null>(null);

  const byState = useMemo(() => {
    const map: Record<string, { revenue: number; customers: number }> = {};
    for (const c of customers) {
      map[c.state] = map[c.state] ?? { revenue: 0, customers: 0 };
      const entry = map[c.state];
      if (entry) entry.customers += 1;
    }
    for (const inv of invoices) {
      const c = customers.find((x) => x.id === inv.customerId);
      if (c) {
        map[c.state] = map[c.state] ?? { revenue: 0, customers: 0 };
        const entry = map[c.state];
        if (entry) entry.revenue += inv.total;
      }
    }
    return map;
  }, [invoices, customers]);

  const geoData = useMemo(() => {
    const out: Record<string, number> = {};
    for (const [state, v] of Object.entries(byState)) out[state] = v.revenue;
    return out;
  }, [byState]);

  const ranked = useMemo(
    () =>
      Object.entries(byState)
        .map(([state, v]) => ({ state, ...v }))
        .sort((a, b) => b.revenue - a.revenue),
    [byState],
  );

  const selectedCustomers = selected
    ? customers.filter((c) => c.state === selected)
    : [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Geographic Distribution"
        description="State-wise sales volume — click a state to drill down"
        icon={<MapIcon />}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>India Sales Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <IndiaMap
              data={geoData}
              selected={selected}
              onSelect={setSelected}
              valueFormatter={formatINRCompact}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {selected ? `${selected} — Customers` : 'State Rankings'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selected ? (
              selectedCustomers.length > 0 ? (
                <div className="space-y-2">
                  {selectedCustomers.slice(0, 12).map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-md border border-line p-2 text-sm"
                    >
                      <span className="truncate text-content-secondary">
                        {c.companyName}
                      </span>
                      <span className="num font-medium text-content">
                        {formatINRCompact(c.totalRevenue)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState compact title="No customers in this state" />
              )
            ) : (
              <div className="space-y-1.5">
                {ranked.slice(0, 12).map((r, i) => (
                  <div
                    key={r.state}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span className="num w-5 text-content-muted">{i + 1}</span>
                    <span className="flex-1 text-content-secondary">
                      {r.state}
                    </span>
                    <span className="num text-xs text-content-muted">
                      {r.customers} cust.
                    </span>
                    <span className="num font-medium text-content">
                      {formatINR(r.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
