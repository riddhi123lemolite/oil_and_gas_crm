import type { ProposalItem } from '@/types';

const COMPANY_STATE = 'Gujarat';

export interface GstTotals {
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  gstTotal: number;
  transportCharge: number;
  total: number;
  intraState: boolean;
}

/**
 * Compute GST for a proposal/invoice. Intra-state (buyer in Gujarat) splits
 * into CGST + SGST; inter-state uses a single IGST line.
 */
export function calculateGst(
  lineItems: ProposalItem[],
  buyerState: string,
  transportCharge = 0,
): GstTotals {
  const intraState = buyerState === COMPANY_STATE;
  const subtotal = lineItems.reduce((sum, li) => sum + li.amount, 0);

  let gstTotal = 0;
  for (const li of lineItems) {
    gstTotal += (li.amount * li.gstPercent) / 100;
  }
  // Transport is taxed at the standard 18% slab.
  gstTotal += transportCharge * 0.18;
  gstTotal = Math.round(gstTotal);

  const cgst = intraState ? Math.round(gstTotal / 2) : 0;
  const sgst = intraState ? gstTotal - cgst : 0;
  const igst = intraState ? 0 : gstTotal;

  return {
    subtotal,
    cgst,
    sgst,
    igst,
    gstTotal,
    transportCharge,
    total: subtotal + transportCharge + gstTotal,
    intraState,
  };
}

/** Compute the amount for a single line (qty × rate − discount). */
export function lineAmount(
  quantity: number,
  rate: number,
  discountPercent: number,
): number {
  return Math.round(quantity * rate * (1 - discountPercent / 100));
}
