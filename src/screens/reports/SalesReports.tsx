import { useMemo, useState } from 'react';
import { BarChart3, Download } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  SegmentTabs,
  SegmentList,
  SegmentTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { BarChart } from '@/components/charts/BarChart';
import { useDataStore } from '@/stores/dataStore';
import { useLookups } from '@/hooks/useLookups';
import { monthlySales, topBy } from '@/lib/analytics';
import { exportToExcel } from '@/lib/excel';
import { formatINR, formatINRCompact } from '@/lib/format';
import { ITEM_CATEGORY_COLOR } from '@/lib/constants';
import type { ItemCategory } from '@/types';

export default function SalesReports() {
  const { invoices, items, customers } = useDataStore();
  const { userName } = useLookups();
  const [tab, setTab] = useState('month');

  const byMonth = useMemo(
    () => monthlySales(invoices, 12).map((m) => ({ label: m.month, value: m.sales })),
    [invoices],
  );

  const byProduct = useMemo(() => {
    const map = new Map<ItemCategory, number>();
    for (const inv of invoices)
      for (const li of inv.items) {
        const item = items.find((i) => i.id === li.itemId);
        if (item) map.set(item.category, (map.get(item.category) ?? 0) + li.amount);
      }
    return [...map.entries()].map(([cat, value]) => ({
      label: cat.replace('_', ' '),
      value,
    }));
  }, [invoices, items]);

  const byRegion = useMemo(() => {
    const map = new Map<string, number>();
    for (const inv of invoices) {
      const c = customers.find((x) => x.id === inv.customerId);
      if (c) map.set(c.state, (map.get(c.state) ?? 0) + inv.total);
    }
    return [...map.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [invoices, customers]);

  const bySalesperson = useMemo(
    () =>
      topBy(invoices, (i) => i.createdById, (i) => i.total, 12).map((r) => ({
        label: userName(r.label),
        value: r.value,
      })),
    [invoices, userName],
  );

  const datasets: Record<string, { label: string; value: number }[]> = {
    month: byMonth,
    product: byProduct,
    region: byRegion,
    salesperson: bySalesperson,
  };
  const current = datasets[tab] ?? [];

  const download = () => {
    exportToExcel(
      current.map((r) => ({ Dimension: r.label, Revenue: r.value })),
      `sales-report-${tab}`,
      'Sales Report',
    );
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sales Reports"
        description="Revenue breakdowns across every dimension"
        icon={<BarChart3 />}
        actions={
          <Button variant="outline" onClick={download}>
            <Download className="size-4" /> Export Excel
          </Button>
        }
      />

      <SegmentTabs value={tab} onValueChange={setTab}>
        <SegmentList>
          <SegmentTrigger value="month">By Month</SegmentTrigger>
          <SegmentTrigger value="product">By Product</SegmentTrigger>
          <SegmentTrigger value="region">By Region</SegmentTrigger>
          <SegmentTrigger value="salesperson">By Salesperson</SegmentTrigger>
        </SegmentList>

        {(['month', 'product', 'region', 'salesperson'] as const).map((key) => (
          <TabsContent key={key} value={key} className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">
                  Revenue by {key}
                </CardTitle>
                <span className="num text-sm text-content-muted">
                  Total{' '}
                  {formatINRCompact(
                    (datasets[key] ?? []).reduce((s, r) => s + r.value, 0),
                  )}
                </span>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={datasets[key] ?? []}
                  xKey="label"
                  barKey="value"
                  barName="Revenue"
                  color={
                    key === 'product'
                      ? ITEM_CATEGORY_COLOR.GLYCOL
                      : '#0F3D5C'
                  }
                  horizontal={key !== 'month'}
                  valueFormatter={formatINRCompact}
                  height={key === 'month' ? 280 : 360}
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </SegmentTabs>

      <Card>
        <CardHeader>
          <CardTitle>Detail Table</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr className="text-left text-[11px] uppercase text-content-muted">
                <th className="px-4 py-2.5">Dimension</th>
                <th className="px-4 py-2.5 text-right">Revenue</th>
                <th className="px-4 py-2.5 text-right">Share</th>
              </tr>
            </thead>
            <tbody>
              {current.map((r) => {
                const total = current.reduce((s, x) => s + x.value, 0);
                return (
                  <tr key={r.label} className="border-b border-line last:border-0">
                    <td className="px-4 py-2.5 text-content">{r.label}</td>
                    <td className="num px-4 py-2.5 text-right text-content-secondary">
                      {formatINR(r.value)}
                    </td>
                    <td className="num px-4 py-2.5 text-right text-content-muted">
                      {total ? ((r.value / total) * 100).toFixed(1) : '0'}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
