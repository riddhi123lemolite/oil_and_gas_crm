// ---------------------------------------------------------------------------
// ERP costing engine — the single source of truth for tank calculations,
// used by both the ERP Calculator page and the AI assistant.
// ---------------------------------------------------------------------------

export interface ErpTank {
  price: number;
  density: number;
  litre: number;
}

export interface ErpTankResult {
  kg: number;
  lineTotal: number;
}

export interface ErpResult {
  perTank: ErpTankResult[];
  totalLitre: number;
  totalKg: number;
  totalPrice: number;
  avgPrice: number;
  avgDensity: number;
}

export function computeErp(tanks: ErpTank[]): ErpResult {
  const perTank: ErpTankResult[] = tanks.map((t) => ({
    kg: (t.litre * t.density) / 1000, // kg = (litre × density) / 1000
    lineTotal: t.price * t.litre, // price × litre
  }));
  const totalLitre = tanks.reduce((s, t) => s + t.litre, 0);
  const totalKg = perTank.reduce((s, p) => s + p.kg, 0);
  const totalPrice = perTank.reduce((s, p) => s + p.lineTotal, 0);
  const avgPrice = totalLitre ? totalPrice / totalLitre : 0; // Total Price ÷ Total Litre
  const avgDensity = totalLitre ? (totalKg / totalLitre) * 1000 : 0; // weighted density
  return { perTank, totalLitre, totalKg, totalPrice, avgPrice, avgDensity };
}
