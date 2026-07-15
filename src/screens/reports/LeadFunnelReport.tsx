import { useMemo } from 'react';
import { Filter } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FunnelChart } from '@/components/charts/FunnelChart';
import { useDataStore } from '@/stores/dataStore';
import { pipelineCounts } from '@/lib/analytics';
import { LEAD_SOURCE } from '@/lib/constants';
import { formatNumber } from '@/lib/format';
import type { LeadSource } from '@/types';

export default function LeadFunnelReport() {
  const leads = useDataStore((s) => s.leads);

  const counts = useMemo(() => pipelineCounts(leads), [leads]);

  const stages = [
    { label: 'New', value: counts.NEW + counts.CONTACTED, color: '#2563EB' },
    { label: 'Qualified', value: counts.QUALIFIED, color: '#3B82F6' },
    { label: 'Proposal Sent', value: counts.PROPOSAL_SENT, color: '#0F3D5C' },
    { label: 'Negotiation', value: counts.NEGOTIATION, color: '#E87722' },
    { label: 'Won', value: counts.WON, color: '#16A34A' },
  ];

  const bySource = useMemo(() => {
    const map = new Map<LeadSource, { total: number; won: number }>();
    for (const l of leads) {
      const e = map.get(l.source) ?? { total: 0, won: 0 };
      e.total += 1;
      if (l.status === 'WON') e.won += 1;
      map.set(l.source, e);
    }
    return [...map.entries()].sort((a, b) => b[1].total - a[1].total);
  }, [leads]);

  const totalLeads = leads.length;
  const won = counts.WON;
  const lost = counts.LOST;
  const conversion = totalLeads ? ((won / totalLeads) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-5">
      <PageHeader
        title="Lead Funnel Report"
        description="Conversion analysis across the pipeline"
        icon={<Filter />}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total Leads" value={formatNumber(totalLeads)} />
        <Stat label="Won" value={formatNumber(won)} good />
        <Stat label="Lost" value={formatNumber(lost)} danger />
        <Stat label="Conversion" value={`${conversion}%`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pipeline Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <FunnelChart stages={stages} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conversion by Lead Source</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr className="text-left text-[11px] uppercase text-content-muted">
                <th className="px-4 py-2.5">Source</th>
                <th className="px-4 py-2.5 text-right">Total Leads</th>
                <th className="px-4 py-2.5 text-right">Won</th>
                <th className="px-4 py-2.5 text-right">Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {bySource.map(([source, e]) => (
                <tr key={source} className="border-b border-line last:border-0">
                  <td className="px-4 py-2.5 text-content">
                    {LEAD_SOURCE[source]}
                  </td>
                  <td className="num px-4 py-2.5 text-right text-content-secondary">
                    {e.total}
                  </td>
                  <td className="num px-4 py-2.5 text-right text-content-secondary">
                    {e.won}
                  </td>
                  <td className="num px-4 py-2.5 text-right font-medium text-content">
                    {e.total ? ((e.won / e.total) * 100).toFixed(1) : '0'}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  good,
  danger,
}: {
  label: string;
  value: string;
  good?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="card p-3.5">
      <div className="text-xs uppercase tracking-wide text-content-muted">
        {label}
      </div>
      <div
        className={`num mt-1 text-xl font-bold ${
          good ? 'text-success' : danger ? 'text-danger' : 'text-content'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
