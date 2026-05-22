import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { EntityAvatar } from '@/components/shared/EntityAvatar';
import { useDataStore } from '@/stores/dataStore';
import { CUSTOMER_SEGMENT } from '@/lib/constants';
import { formatINRCompact } from '@/lib/format';
import type { CustomerSegment } from '@/types';

export default function CustomerSegments() {
  const navigate = useNavigate();
  const customers = useDataStore((s) => s.customers);

  const grouped = useMemo(() => {
    const map = new Map<CustomerSegment, typeof customers>();
    for (const c of customers) {
      const list = map.get(c.segment) ?? [];
      list.push(c);
      map.set(c.segment, list);
    }
    return map;
  }, [customers]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Customer Segments"
        description="Customers auto-grouped by value and engagement"
        icon={<Layers />}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {(Object.keys(CUSTOMER_SEGMENT) as CustomerSegment[]).map((seg) => {
          const list = grouped.get(seg) ?? [];
          const revenue = list.reduce((s, c) => s + c.totalRevenue, 0);
          return (
            <Card key={seg}>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-base font-semibold text-content">
                      {CUSTOMER_SEGMENT[seg].label}
                    </h3>
                    <p className="text-xs text-content-muted">
                      {list.length} customers ·{' '}
                      {formatINRCompact(revenue)} revenue
                    </p>
                  </div>
                  <span className="num text-2xl font-bold text-brand-primary dark:text-brand-secondary">
                    {list.length}
                  </span>
                </div>
                <div className="mt-3 space-y-1.5">
                  {list.slice(0, 4).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => navigate(`/customers/${c.id}`)}
                      className="flex w-full items-center gap-2 rounded-md p-1.5 text-left hover:bg-muted"
                    >
                      <EntityAvatar name={c.companyName} size="xs" />
                      <span className="truncate text-sm text-content-secondary">
                        {c.companyName}
                      </span>
                      <span className="num ml-auto text-xs text-content-muted">
                        {formatINRCompact(c.totalRevenue)}
                      </span>
                    </button>
                  ))}
                  {list.length > 4 && (
                    <button
                      onClick={() => navigate('/customers')}
                      className="flex items-center gap-1 px-1.5 text-xs font-medium text-brand-secondary hover:underline"
                    >
                      View all {list.length} <ArrowRight className="size-3" />
                    </button>
                  )}
                  {list.length === 0 && (
                    <p className="px-1.5 py-2 text-xs text-content-muted">
                      No customers in this segment.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
