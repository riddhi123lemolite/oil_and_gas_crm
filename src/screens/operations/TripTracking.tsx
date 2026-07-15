import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation, MapPin, Truck, CheckCircle2, Circle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { useDataStore } from '@/stores/dataStore';
import { useLookups } from '@/hooks/useLookups';
import { DISPATCH_STATUS, DISPATCH_FLOW } from '@/lib/constants';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';

const LANDMARKS = [
  'Departed Hazira Terminal',
  'Crossed Surat toll plaza',
  'At Kim weighbridge',
  'Near Bharuch bypass',
  'On NH-48 near Vadodara',
  'Approaching destination city',
];

export default function TripTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { customerName, itemName, routeLabel } = useLookups();
  const dispatches = useDataStore((s) => s.dispatches);
  const [tick, setTick] = useState(0);

  // Simulated GPS — advances the landmark index every few seconds.
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => (t + 1) % LANDMARKS.length), 4000);
    return () => clearInterval(timer);
  }, []);

  if (!id) {
    const active = dispatches.filter(
      (d) => d.status === 'IN_TRANSIT' || d.status === 'LOADING',
    );
    return (
      <div className="space-y-5">
        <PageHeader
          title="Trip Tracking"
          description={`${active.length} tankers currently on the move`}
          icon={<Navigation />}
        />
        {active.length === 0 ? (
          <EmptyState icon={Truck} title="No active trips" description="Dispatches in transit will appear here." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {active.map((d) => (
              <button
                key={d.id}
                onClick={() => navigate(`/trips/${d.id}`)}
                className="card p-4 text-left transition-shadow hover:shadow-pop"
              >
                <div className="flex items-center justify-between">
                  <span className="num font-semibold text-content">
                    {d.number}
                  </span>
                  <StatusBadge def={DISPATCH_STATUS[d.status]} size="sm" />
                </div>
                <p className="mt-1 text-sm text-content-secondary">
                  {customerName(d.customerId)}
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-content-muted">
                  <MapPin className="size-3.5" />
                  {d.currentLocation ?? LANDMARKS[tick]}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const dispatch = dispatches.find((d) => d.id === id);
  if (!dispatch) {
    return (
      <EmptyState
        icon={Truck}
        title="Dispatch not found"
        actionLabel="Back to Trips"
        onAction={() => navigate('/trips')}
      />
    );
  }

  const currentStageIndex = DISPATCH_FLOW.indexOf(
    dispatch.status === 'IN_TRANSIT' ? 'IN_TRANSIT' : dispatch.status,
  );
  const liveLocation =
    dispatch.status === 'IN_TRANSIT'
      ? LANDMARKS[tick]
      : dispatch.currentLocation ?? '—';

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Trip ${dispatch.number}`}
        description={`${customerName(dispatch.customerId)} · ${routeLabel(dispatch.routeId)}`}
        icon={<Navigation />}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Live Status</CardTitle>
            <StatusBadge def={DISPATCH_STATUS[dispatch.status]} />
          </CardHeader>
          <CardContent>
            {dispatch.status === 'IN_TRANSIT' && (
              <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-brand-secondary/30 bg-brand-secondary/10 p-3">
                <span className="relative flex size-3">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-secondary opacity-60" />
                  <span className="relative inline-flex size-3 rounded-full bg-brand-secondary" />
                </span>
                <span className="text-sm font-medium text-content">
                  {liveLocation}
                </span>
                <span className="ml-auto text-xs text-content-muted">
                  Simulated GPS · updates live
                </span>
              </div>
            )}
            <div className="space-y-0">
              {DISPATCH_FLOW.map((stage, i) => {
                const done = i <= currentStageIndex;
                return (
                  <div key={stage} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      {done ? (
                        <CheckCircle2 className="size-6 text-brand-accent" />
                      ) : (
                        <Circle className="size-6 text-content-muted" />
                      )}
                      {i < DISPATCH_FLOW.length - 1 && (
                        <div
                          className={cn(
                            'w-px flex-1',
                            i < currentStageIndex ? 'bg-brand-accent' : 'bg-line',
                          )}
                        />
                      )}
                    </div>
                    <div className="pb-6">
                      <p
                        className={cn(
                          'text-sm font-medium',
                          done ? 'text-content' : 'text-content-muted',
                        )}
                      >
                        {DISPATCH_STATUS[stage].label}
                      </p>
                      <p className="text-xs text-content-muted">
                        {stage === 'SCHEDULED' && formatDateTime(dispatch.scheduledAt)}
                        {stage === 'LOADING' && formatDateTime(dispatch.loadedAt)}
                        {stage === 'IN_TRANSIT' && formatDateTime(dispatch.dispatchedAt)}
                        {stage === 'DELIVERED' && formatDateTime(dispatch.deliveredAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-sm">
            <Row label="Product" value={itemName(dispatch.itemId)} />
            <Row label="Quantity" value={`${dispatch.quantity} ${dispatch.unit}`} />
            <Row label="Vehicle" value={dispatch.vehicleNo ?? '—'} />
            <Row label="Driver" value={dispatch.driverName ?? '—'} />
            <Row label="Driver Phone" value={dispatch.driverPhone ?? '—'} />
            <Row label="Route" value={routeLabel(dispatch.routeId)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-content-muted">{label}</span>
      <span className="num text-right font-medium text-content">{value}</span>
    </div>
  );
}
