import { useEffect, useRef, useState } from 'react';
import { OIL_BENCHMARKS, FUEL_PRICES, type PriceTicker } from '@/lib/market';

export interface LiveTicker extends PriceTicker {
  base: number;
  history: number[];
  lastUpdated: number;
}

const REFRESH_MS = 8000;
const HISTORY = 24;

function seed(t: PriceTicker): LiveTicker {
  return { ...t, base: t.price, history: [t.price], lastUpdated: Date.now() };
}

function tick(t: LiveTicker): LiveTicker {
  // Small random walk to simulate a live feed (replace with a real API call).
  const drift = (Math.random() - 0.5) * 0.006; // ±0.3%
  const price = Math.max(0.01, t.price * (1 + drift));
  const change = ((price - t.base) / t.base) * 100;
  const history = [...t.history, price].slice(-HISTORY);
  return { ...t, price, change, history, lastUpdated: Date.now() };
}

/**
 * Auto-refreshing oil + fuel tickers. Uses a simulated feed for the demo;
 * swap `tick`/`seed` for a real commodities/fuel-price API when available.
 */
export function useLiveMarket() {
  const [oil, setOil] = useState<LiveTicker[]>(() => OIL_BENCHMARKS.map(seed));
  const [fuel, setFuel] = useState<LiveTicker[]>(() => FUEL_PRICES.map(seed));
  const [failed] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    timer.current = setInterval(() => {
      setOil((prev) => prev.map(tick));
      setFuel((prev) => prev.map(tick));
    }, REFRESH_MS);
    return () => clearInterval(timer.current);
  }, []);

  return { oil, fuel, failed };
}
