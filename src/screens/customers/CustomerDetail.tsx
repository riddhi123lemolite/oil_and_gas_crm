import type { ReactNode } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Pencil,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  FileText,
  Receipt,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EntityAvatar } from '@/components/shared/EntityAvatar';
import { EmptyState } from '@/components/shared/EmptyState';
import { ActivityTimeline } from '@/components/shared/ActivityTimeline';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useDataStore } from '@/stores/dataStore';
import { useLookups } from '@/hooks/useLookups';
import {
  CUSTOMER_SEGMENT,
  PROPOSAL_STATUS,
  INVOICE_STATUS,
  DISPATCH_STATUS,
} from '@/lib/constants';
import { formatINR, formatINRCompact, formatDate, formatPhone } from '@/lib/format';

function MiniRow({
  left,
  mid,
  right,
  badge,
  onClick,
}: {
  left: string;
  mid?: string;
  right: string;
  badge?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className="flex w-full items-center gap-3 rounded-md border border-line p-2.5 text-left transition-colors enabled:hover:bg-muted"
    >
      <div className="min-w-0 flex-1">
        <div className="num truncate text-sm font-medium text-content">
          {left}
        </div>
        {mid && <div className="truncate text-xs text-content-muted">{mid}</div>}
      </div>
      {badge}
      <span className="num shrink-0 text-sm font-semibold text-content">
        {right}
      </span>
    </button>
  );
}

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userName, itemName } = useLookups();

  const customers = useDataStore((s) => s.customers);
  const proposals = useDataStore((s) => s.proposals);
  const orders = useDataStore((s) => s.orders);
  const invoices = useDataStore((s) => s.invoices);
  const payments = useDataStore((s) => s.payments);
  const dispatches = useDataStore((s) => s.dispatches);
  const documents = useDataStore((s) => s.documents);
  const activities = useDataStore((s) => s.activities);

  const customer = customers.find((c) => c.id === id);

  if (!customer) {
    return (
      <EmptyState
        icon={Building2}
        title="Customer not found"
        actionLabel="Back to Customers"
        onAction={() => navigate('/customers')}
      />
    );
  }

  const cProposals = proposals.filter((p) => p.customerId === customer.id);
  const cOrders = orders.filter((o) => o.customerId === customer.id);
  const cInvoices = invoices.filter((i) => i.customerId === customer.id);
  const cPayments = payments.filter((p) => p.customerId === customer.id);
  const cDispatches = dispatches.filter((d) => d.customerId === customer.id);
  const cDocs = documents.filter(
    (d) => d.entityType === 'customer' && d.entityId === customer.id,
  );
  const cActivity = activities.filter(
    (a) => a.entityType === 'customer' && a.entityId === customer.id,
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title={customer.companyName}
        description={`${customer.code} · ${customer.industry ?? 'Customer account'}`}
        icon={<Building2 />}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/customers/' + customer.id + '/ledger')}>
              <CreditCard className="size-4" /> Ledger
            </Button>
            <Button onClick={() => navigate(`/customers/${customer.id}/edit`)}>
              <Pencil className="size-4" /> Edit
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Revenue" value={formatINRCompact(customer.totalRevenue)} />
        <StatCard
          label="Outstanding"
          value={formatINRCompact(customer.outstanding)}
          danger={customer.outstanding > 0}
        />
        <StatCard label="Credit Limit" value={formatINRCompact(customer.creditLimit)} />
        <StatCard label="Payment Terms" value={`${customer.paymentTermsDays} days`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center pt-6 text-center">
              <EntityAvatar name={customer.companyName} size="xl" />
              <h3 className="mt-3 font-display text-base font-semibold text-content">
                {customer.companyName}
              </h3>
              <StatusBadge def={CUSTOMER_SEGMENT[customer.segment]} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-sm">
              <Row icon={Phone} value={formatPhone(customer.phone)} />
              {customer.email && <Row icon={Mail} value={customer.email} />}
              <Row
                icon={MapPin}
                value={`${customer.city}, ${customer.state}`}
              />
              {customer.gstin && (
                <div className="border-t border-line pt-2 text-xs text-content-muted">
                  GSTIN <span className="num font-medium text-content">{customer.gstin}</span>
                  <br />
                  PAN <span className="num font-medium text-content">{customer.pan}</span>
                </div>
              )}
              <div className="text-xs text-content-muted">
                Owner: {userName(customer.ownerId)} · Since{' '}
                {formatDate(customer.createdAt)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <Tabs defaultValue="overview">
              <div className="px-2 pt-1">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="contacts">
                    Contacts ({customer.contacts.length})
                  </TabsTrigger>
                  <TabsTrigger value="proposals">
                    Proposals ({cProposals.length})
                  </TabsTrigger>
                  <TabsTrigger value="orders">
                    Orders ({cOrders.length})
                  </TabsTrigger>
                  <TabsTrigger value="invoices">
                    Invoices ({cInvoices.length})
                  </TabsTrigger>
                  <TabsTrigger value="payments">
                    Payments ({cPayments.length})
                  </TabsTrigger>
                  <TabsTrigger value="dispatches">
                    Dispatches ({cDispatches.length})
                  </TabsTrigger>
                  <TabsTrigger value="files">
                    Files ({cDocs.length})
                  </TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>
              </div>
              <CardContent>
                <TabsContent value="overview">
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <DField label="Billing Address" value={`${customer.billingAddress.line1}, ${customer.city}, ${customer.state} ${customer.pincode}`} full />
                    <DField label="Industry" value={customer.industry ?? '—'} />
                    <DField label="Segment" value={CUSTOMER_SEGMENT[customer.segment].label} />
                    <DField label="Lifetime Orders" value={String(cOrders.length)} />
                    <DField label="Last Order" value={formatDate(customer.lastOrderAt)} />
                  </dl>
                </TabsContent>

                <TabsContent value="contacts">
                  <div className="space-y-2">
                    {customer.contacts.map((c) => (
                      <div key={c.id} className="flex items-center gap-3 rounded-md border border-line p-2.5">
                        <EntityAvatar name={c.name} size="sm" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-content">{c.name}</div>
                          <div className="text-xs text-content-muted">{c.designation}</div>
                        </div>
                        <span className="num ml-auto text-xs text-content-secondary">
                          {formatPhone(c.phone)}
                        </span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="proposals">
                  <RelatedList
                    rows={cProposals}
                    empty="No proposals yet"
                    render={(p) => (
                      <MiniRow
                        key={p.id}
                        left={p.number}
                        mid={p.subject}
                        right={formatINRCompact(p.total)}
                        badge={<StatusBadge def={PROPOSAL_STATUS[p.status]} size="sm" />}
                        onClick={() => navigate(`/proposals/${p.id}`)}
                      />
                    )}
                  />
                </TabsContent>

                <TabsContent value="orders">
                  <RelatedList
                    rows={cOrders}
                    empty="No sales orders yet"
                    render={(o) => (
                      <MiniRow
                        key={o.id}
                        left={o.number}
                        mid={formatDate(o.orderDate)}
                        right={formatINRCompact(o.total)}
                        onClick={() => navigate('/orders')}
                      />
                    )}
                  />
                </TabsContent>

                <TabsContent value="invoices">
                  <RelatedList
                    rows={cInvoices}
                    empty="No invoices yet"
                    render={(inv) => (
                      <MiniRow
                        key={inv.id}
                        left={inv.number}
                        mid={`Due ${formatDate(inv.dueDate)}`}
                        right={formatINRCompact(inv.total)}
                        badge={<StatusBadge def={INVOICE_STATUS[inv.status]} size="sm" />}
                        onClick={() => navigate('/invoices')}
                      />
                    )}
                  />
                </TabsContent>

                <TabsContent value="payments">
                  <RelatedList
                    rows={cPayments}
                    empty="No payments recorded"
                    render={(p) => (
                      <MiniRow
                        key={p.id}
                        left={p.number}
                        mid={`${p.mode} · ${formatDate(p.paidAt)}`}
                        right={formatINR(p.amount)}
                      />
                    )}
                  />
                </TabsContent>

                <TabsContent value="dispatches">
                  <RelatedList
                    rows={cDispatches}
                    empty="No dispatches yet"
                    render={(d) => (
                      <MiniRow
                        key={d.id}
                        left={d.number}
                        mid={`${itemName(d.itemId)} · ${d.quantity} ${d.unit}`}
                        right=""
                        badge={<StatusBadge def={DISPATCH_STATUS[d.status]} size="sm" />}
                        onClick={() => navigate('/dispatch')}
                      />
                    )}
                  />
                </TabsContent>

                <TabsContent value="files">
                  <RelatedList
                    rows={cDocs}
                    empty="No documents uploaded"
                    render={(d) => (
                      <MiniRow
                        key={d.id}
                        left={d.name}
                        mid={d.category}
                        right={`${d.sizeKb} KB`}
                      />
                    )}
                  />
                </TabsContent>

                <TabsContent value="activity">
                  <ActivityTimeline activities={cActivity} />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>

      <p className="text-center text-xs text-content-muted">
        <Link to={`/customers/${customer.id}/documents`} className="text-brand-secondary hover:underline">
          <FileText className="mr-1 inline size-3" />
          Manage documents
        </Link>
        {'  ·  '}
        <Link to={`/customers/${customer.id}/ledger`} className="text-brand-secondary hover:underline">
          <Receipt className="mr-1 inline size-3" />
          View ledger
        </Link>
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  danger,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="card p-3.5">
      <div className="text-xs uppercase tracking-wide text-content-muted">
        {label}
      </div>
      <div
        className={`num mt-1 text-xl font-bold ${danger ? 'text-danger' : 'text-content'}`}
      >
        {value}
      </div>
    </div>
  );
}

function Row({ icon: Icon, value }: { icon: typeof Phone; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="size-4 shrink-0 text-content-muted" />
      <span className="num truncate text-content-secondary">{value}</span>
    </div>
  );
}

function DField({
  label,
  value,
  full,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <dt className="text-xs text-content-muted">{label}</dt>
      <dd className="mt-0.5 font-medium text-content">{value}</dd>
    </div>
  );
}

function RelatedList<T>({
  rows,
  empty,
  render,
}: {
  rows: T[];
  empty: string;
  render: (row: T) => ReactNode;
}) {
  if (rows.length === 0) {
    return <EmptyState compact title={empty} />;
  }
  return <div className="space-y-2">{rows.map(render)}</div>;
}
