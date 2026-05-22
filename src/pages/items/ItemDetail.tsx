import { useParams, useNavigate } from 'react-router-dom';
import { Package, Pencil } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TrendChart } from '@/components/charts/TrendChart';
import { useDataStore } from '@/stores/dataStore';
import { useAuth } from '@/hooks/useAuth';
import { useLookups } from '@/hooks/useLookups';
import { ITEM_CATEGORY, DISPATCH_STATUS } from '@/lib/constants';
import { formatINR, formatNumber, formatPercent, formatDate } from '@/lib/format';

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canSeeMargins } = useAuth();
  const { customerName } = useLookups();
  const items = useDataStore((s) => s.items);
  const dispatches = useDataStore((s) => s.dispatches);

  const item = items.find((i) => i.id === id);
  if (!item) {
    return (
      <EmptyState
        icon={Package}
        title="Item not found"
        actionLabel="Back to Items"
        onAction={() => navigate('/items')}
      />
    );
  }

  const priceData = item.priceHistory.map((p) => ({
    month: format(parseISO(p.date), 'MMM yy'),
    rate: p.rate,
  }));
  const recentDispatches = dispatches
    .filter((d) => d.itemId === item.id)
    .slice(0, 8);
  const margin = item.rate - (item.costRate ?? 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title={item.name}
        description={`${item.code} · HSN ${item.hsnCode}`}
        icon={<Package />}
        actions={
          <Button onClick={() => navigate(`/items/${item.id}/edit`)}>
            <Pencil className="size-4" /> Edit
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Selling Rate" value={`${formatINR(item.rate)}`} />
        <Stat label="GST" value={formatPercent(item.gstPercent)} />
        {canSeeMargins && (
          <Stat label="Margin" value={`${formatINR(margin)}/${item.unit}`} good />
        )}
        <Stat
          label="Stock"
          value={`${formatNumber(item.stockTotal)} ${item.unit}`}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Price History</CardTitle>
            <span className="text-xs text-content-muted">
              Rate per {item.unit}, last 12 months
            </span>
          </CardHeader>
          <CardContent>
            <TrendChart
              data={priceData}
              xKey="month"
              series={[{ key: 'rate', name: 'Rate', color: '#E87722' }]}
              valueFormatter={(v) => formatINR(v)}
              height={240}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Specifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-sm">
            <Row label="Category" value={ITEM_CATEGORY[item.category].label} />
            <Row label="Group" value={item.group ?? '—'} />
            <Row label="Unit" value={item.unit} />
            <Row label="Warehouse" value={item.warehouse} />
            <Row
              label="Status"
              value={item.active ? 'Active' : 'Inactive'}
            />
            {item.specifications && (
              <p className="border-t border-line pt-2 text-xs text-content-muted">
                {item.specifications}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Dispatches</CardTitle>
        </CardHeader>
        <CardContent>
          {recentDispatches.length === 0 ? (
            <EmptyState compact title="No dispatches for this item" />
          ) : (
            <div className="space-y-2">
              {recentDispatches.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-3 rounded-md border border-line p-2.5 text-sm"
                >
                  <span className="num font-medium text-content">
                    {d.number}
                  </span>
                  <span className="truncate text-content-muted">
                    {customerName(d.customerId)}
                  </span>
                  <span className="num ml-auto text-content-secondary">
                    {d.quantity} {d.unit}
                  </span>
                  <StatusBadge def={DISPATCH_STATUS[d.status]} size="sm" />
                  <span className="text-xs text-content-muted">
                    {formatDate(d.scheduledAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  good,
}: {
  label: string;
  value: string;
  good?: boolean;
}) {
  return (
    <div className="card p-3.5">
      <div className="text-xs uppercase tracking-wide text-content-muted">
        {label}
      </div>
      <div
        className={`num mt-1 text-xl font-bold ${good ? 'text-success' : 'text-content'}`}
      >
        {value}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-content-muted">{label}</span>
      <span className="text-right font-medium text-content">{value}</span>
    </div>
  );
}
