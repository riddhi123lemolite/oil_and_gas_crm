import { useMemo, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendChart } from '@/components/charts/TrendChart';
import { BarChart } from '@/components/charts/BarChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { SelectField } from '@/components/forms/SelectField';
import { useDataStore } from '@/stores/dataStore';
import { useLookups } from '@/hooks/useLookups';
import { monthlySales, topBy } from '@/lib/analytics';
import { formatINRCompact } from '@/lib/format';
import { ITEM_CATEGORY_COLOR } from '@/lib/constants';
import type { ItemCategory } from '@/types';

export default function SalesAnalytics() {
  const { invoices, items, customers, users } = useDataStore();
  const { userName } = useLookups();
  const [grain, setGrain] = useState('12');

  const trend = useMemo(
    () =>
      monthlySales(invoices, Number(grain)).map((m) => ({
        month: m.month,
        sales: m.sales,
        orders: m.orders * 50000,
      })),
    [invoices, grain],
  );

  const byProduct = useMemo(() => {
    const map = new Map<ItemCategory, number>();
    for (const inv of invoices) {
      for (const li of inv.items) {
        const item = items.find((i) => i.id === li.itemId);
        if (item)
          map.set(item.category, (map.get(item.category) ?? 0) + li.amount);
      }
    }
    return [...map.entries()].map(([cat, value]) => ({
      name: cat.replace('_', ' '),
      value,
      color: ITEM_CATEGORY_COLOR[cat],
    }));
  }, [invoices, items]);

  const byRegion = useMemo(() => {
    const map = new Map<string, number>();
    for (const inv of invoices) {
      const cust = customers.find((c) => c.id === inv.customerId);
      if (cust) map.set(cust.state, (map.get(cust.state) ?? 0) + inv.total);
    }
    return [...map.entries()]
      .map(([state, value]) => ({ state, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [invoices, customers]);

  const bySalesperson = useMemo(
    () =>
      topBy(
        invoices,
        (i) => i.createdById,
        (i) => i.total,
        8,
      ).map((r) => ({ name: userName(r.label), value: r.value })),
    [invoices, userName],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sales Analytics"
        description="Period-over-period performance across products, regions and team"
        icon={<TrendingUp />}
        actions={
          <div className="w-40">
            <SelectField
              value={grain}
              onChange={setGrain}
              options={[
                { value: '6', label: 'Last 6 Months' },
                { value: '12', label: 'Last 12 Months' },
              ]}
            />
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <TrendChart
            data={trend}
            xKey="month"
            series={[{ key: 'sales', name: 'Revenue', color: '#0F3D5C' }]}
            valueFormatter={formatINRCompact}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales by Product Category</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart data={byProduct} valueFormatter={formatINRCompact} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sales by Region</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={byRegion}
              xKey="state"
              barKey="value"
              barName="Revenue"
              color="#E87722"
              horizontal
              valueFormatter={formatINRCompact}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales by Salesperson</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart
            data={bySalesperson}
            xKey="name"
            barKey="value"
            barName="Revenue"
            color="#0891B2"
            horizontal
            valueFormatter={formatINRCompact}
          />
          <p className="mt-2 text-xs text-content-muted">
            Based on {invoices.length} invoices across {customers.length}{' '}
            customers and {users.length} team members.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
