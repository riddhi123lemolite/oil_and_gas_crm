// ---------------------------------------------------------------------------
// Indicative market prices for the customer dashboard.
//
// These are static reference values for the demo. To show live prices, replace
// the arrays below with a fetch from a commodities/fuel-price API (e.g. an oil
// price feed for Brent/WTI and a fuel-retail API for petrol/diesel).
// ---------------------------------------------------------------------------

export interface PriceTicker {
  name: string;
  price: number;
  unit: string;
  /** % change vs previous close. */
  change: number;
  currency: 'USD' | 'INR';
}

export const OIL_BENCHMARKS: PriceTicker[] = [
  { name: 'Brent Crude', price: 82.41, unit: '/bbl', change: 0.82, currency: 'USD' },
  { name: 'WTI Crude', price: 78.12, unit: '/bbl', change: 0.61, currency: 'USD' },
  { name: 'Indian Basket', price: 80.05, unit: '/bbl', change: 0.44, currency: 'USD' },
  { name: 'Natural Gas', price: 2.14, unit: '/MMBtu', change: -1.18, currency: 'USD' },
];

export const FUEL_PRICES: PriceTicker[] = [
  { name: 'Petrol (Mumbai)', price: 104.21, unit: '/L', change: 0.0, currency: 'INR' },
  { name: 'Diesel (Mumbai)', price: 92.15, unit: '/L', change: 0.11, currency: 'INR' },
  { name: 'LPG (19kg comm.)', price: 1805.0, unit: '/cyl', change: -0.5, currency: 'INR' },
  { name: 'CNG (Mumbai)', price: 75.0, unit: '/kg', change: 0.0, currency: 'INR' },
  { name: 'ATF / Jet Fuel', price: 96500, unit: '/kL', change: 1.12, currency: 'INR' },
];

/** Format a market price in its OWN currency (not the app display currency). */
export function formatMarket(t: PriceTicker): string {
  const symbol = t.currency === 'USD' ? '$' : '₹';
  const locale = t.currency === 'USD' ? 'en-US' : 'en-IN';
  return `${symbol}${t.price.toLocaleString(locale, {
    maximumFractionDigits: 2,
  })}${t.unit}`;
}
