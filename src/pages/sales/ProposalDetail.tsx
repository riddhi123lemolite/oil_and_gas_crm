import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Pencil,
  Mail,
  Trophy,
  XCircle,
  ShieldCheck,
  Printer,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PdfDownloadButton } from '@/components/pdf/PdfDownloadButton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input, Textarea } from '@/components/ui/input';
import { useDataStore } from '@/stores/dataStore';
import { useAuth } from '@/hooks/useAuth';
import { useLookups } from '@/hooks/useLookups';
import { PROPOSAL_STATUS } from '@/lib/constants';
import { formatINR, formatDate } from '@/lib/format';
import { sendEmail, emailConfigured, openMailClient } from '@/lib/email';
import type { BusinessDocData } from '@/components/pdf/BusinessDocPdf';

export default function ProposalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can, role } = useAuth();
  const { userName } = useLookups();

  const proposals = useDataStore((s) => s.proposals);
  const customers = useDataStore((s) => s.customers);
  const company = useDataStore((s) => s.company);
  const updateProposal = useDataStore((s) => s.update);
  const logActivity = useDataStore((s) => s.logActivity);
  const { user } = useAuth();

  const [emailOpen, setEmailOpen] = useState(false);
  const [lostOpen, setLostOpen] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sending, setSending] = useState(false);

  // Prefill the email dialog fresh each time it opens.
  useEffect(() => {
    if (!emailOpen) return;
    const p = proposals.find((x) => x.id === id);
    if (!p) return;
    const c = customers.find((x) => x.id === p.customerId);
    setEmailTo(c?.email ?? '');
    setEmailSubject(`${p.number} — ${p.subject}`);
    setEmailBody(
      `Dear ${c?.contactPerson ?? 'Customer'},\n\nPlease find our proposal ${p.number}. We look forward to your confirmation.\n\nRegards,\nOilGas CRM Sales Team`,
    );
  }, [emailOpen, id, proposals, customers]);

  const proposal = proposals.find((p) => p.id === id);
  if (!proposal) {
    return (
      <EmptyState
        icon={FileText}
        title="Proposal not found"
        actionLabel="Back to Proposals"
        onAction={() => navigate('/proposals')}
      />
    );
  }

  const customer = customers.find((c) => c.id === proposal.customerId);

  const pdfData: BusinessDocData = {
    docLabel: 'PROPOSAL',
    number: proposal.number,
    date: formatDate(proposal.proposalDate),
    validLabel: 'Valid Until',
    validValue: formatDate(proposal.validUntil),
    company,
    partyName: customer?.companyName ?? 'Customer',
    partyAddress: customer
      ? `${customer.billingAddress.line1}, ${customer.city}, ${customer.state} ${customer.pincode}`
      : '',
    partyGstin: customer?.gstin,
    subject: proposal.subject,
    items: proposal.items,
    subtotal: proposal.subtotal,
    cgst: proposal.cgst,
    sgst: proposal.sgst,
    igst: proposal.igst,
    transportCharge: proposal.transportCharge,
    total: proposal.total,
    terms: proposal.terms,
  };

  const setStatus = (status: typeof proposal.status, extra?: object) => {
    updateProposal('proposals', proposal.id, { status, ...extra });
    if (user) {
      logActivity(
        'proposal',
        proposal.id,
        'STATUS_CHANGE',
        `marked proposal ${PROPOSAL_STATUS[status].label}`,
        user.id,
      );
    }
    toast.success(`Proposal marked ${PROPOSAL_STATUS[status].label}`);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={proposal.number}
        description={proposal.subject}
        icon={<FileText />}
        actions={
          <>
            <Button variant="ghost" onClick={() => window.print()}>
              <Printer className="size-4" /> Print
            </Button>
            <PdfDownloadButton
              data={pdfData}
              filename={proposal.number.replace(/\//g, '-')}
            />
            {can('proposals', 'edit') && proposal.status === 'DRAFT' && (
              <Button
                variant="outline"
                onClick={() => navigate(`/proposals/${proposal.id}/edit`)}
              >
                <Pencil className="size-4" /> Edit
              </Button>
            )}
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge def={PROPOSAL_STATUS[proposal.status]} />
        {proposal.needsApproval && (
          <StatusBadge
            label={proposal.approvedById ? 'Approved' : 'Pending Approval'}
            tone={proposal.approvedById ? 'success' : 'warm'}
          />
        )}
        <span className="text-sm text-content-muted">
          Created by {userName(proposal.createdById)}
        </span>
      </div>

      {/* Action bar */}
      <Card>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEmailOpen(true)}
          >
            <Mail className="size-4" /> Send via Email
          </Button>
          {proposal.needsApproval &&
            !proposal.approvedById &&
            (role === 'ADMIN' || role === 'SALES_MANAGER') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  updateProposal('proposals', proposal.id, {
                    approvedById: user?.id,
                  });
                  toast.success('Proposal approved');
                }}
              >
                <ShieldCheck className="size-4" /> Approve
              </Button>
            )}
          {proposal.status !== 'WON' && proposal.status !== 'LOST' && (
            <>
              <Button
                variant="success"
                size="sm"
                onClick={() =>
                  setStatus('WON', { wonAt: new Date().toISOString() })
                }
              >
                <Trophy className="size-4" /> Mark Won
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setLostOpen(true)}
              >
                <XCircle className="size-4" /> Mark Lost
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Document preview */}
      <Card>
        <CardHeader>
          <CardTitle>{customer?.companyName ?? 'Customer'}</CardTitle>
          <span className="text-sm text-content-muted">
            {formatDate(proposal.proposalDate)} · Valid until{' '}
            {formatDate(proposal.validUntil)}
          </span>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase text-content-muted">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-right">Qty</th>
                  <th className="py-2 text-right">Rate</th>
                  <th className="py-2 text-right">GST</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {proposal.items.map((li) => (
                  <tr key={li.id} className="border-b border-line last:border-0">
                    <td className="py-2 text-content">{li.description}</td>
                    <td className="num py-2 text-right text-content-secondary">
                      {li.quantity} {li.unit}
                    </td>
                    <td className="num py-2 text-right text-content-secondary">
                      {formatINR(li.rate)}
                    </td>
                    <td className="num py-2 text-right text-content-secondary">
                      {li.gstPercent}%
                    </td>
                    <td className="num py-2 text-right font-medium text-content">
                      {formatINR(li.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="ml-auto w-full max-w-xs space-y-1 text-sm">
            <Row label="Subtotal" value={formatINR(proposal.subtotal)} />
            {proposal.transportCharge > 0 && (
              <Row label="Transport" value={formatINR(proposal.transportCharge)} />
            )}
            {proposal.cgst > 0 ? (
              <>
                <Row label="CGST" value={formatINR(proposal.cgst)} />
                <Row label="SGST" value={formatINR(proposal.sgst)} />
              </>
            ) : (
              <Row label="IGST" value={formatINR(proposal.igst)} />
            )}
            <div className="flex justify-between border-t border-line pt-1.5 text-base font-semibold">
              <span>Grand Total</span>
              <span className="num text-brand-primary dark:text-brand-secondary">
                {formatINR(proposal.total)}
              </span>
            </div>
          </div>
          {proposal.terms && (
            <p className="border-t border-line pt-3 text-xs text-content-muted">
              <span className="font-semibold text-content-secondary">
                Terms:{' '}
              </span>
              {proposal.terms}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Email dialog */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Proposal via Email</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <Input
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              placeholder="To"
            />
            <Input
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Subject"
            />
            <Textarea
              rows={4}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
            />
            {!emailConfigured && (
              <p className="text-xs text-content-muted">
                Send opens your own email app with this message ready — just
                press send there.
              </p>
            )}
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEmailOpen(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              disabled={sending}
              onClick={async () => {
                if (!emailTo.trim()) {
                  toast.error('Add a recipient email address first.');
                  return;
                }

                const afterSend = () => {
                  if (user) {
                    logActivity(
                      'proposal',
                      proposal.id,
                      'EMAIL',
                      `emailed proposal to ${emailTo}`,
                      user.id,
                    );
                  }
                  if (proposal.status === 'DRAFT') setStatus('SENT');
                  setEmailOpen(false);
                };

                // No automatic email service configured → open the user's own
                // email app with everything pre-filled (zero-setup real email).
                if (!emailConfigured) {
                  openMailClient({
                    to: emailTo.trim(),
                    subject: emailSubject,
                    message: emailBody,
                  });
                  afterSend();
                  toast.success('Opening your email app to send…');
                  return;
                }

                setSending(true);
                try {
                  await sendEmail({
                    to: emailTo.trim(),
                    subject: emailSubject,
                    message: emailBody,
                  });
                  afterSend();
                  toast.success(`Email sent to ${emailTo.trim()}`);
                } catch (err) {
                  toast.error(
                    err instanceof Error
                      ? `Could not send email: ${err.message}`
                      : 'Could not send email.',
                  );
                } finally {
                  setSending(false);
                }
              }}
            >
              <Mail className="size-4" /> {sending ? 'Sending…' : 'Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={lostOpen}
        onOpenChange={setLostOpen}
        title="Mark this proposal as Lost?"
        description="You can still view it in the Lost filter."
        destructive
        confirmLabel="Mark Lost"
        onConfirm={() =>
          setStatus('LOST', { lostAt: new Date().toISOString() })
        }
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-content-muted">{label}</span>
      <span className="num font-medium text-content">{value}</span>
    </div>
  );
}
