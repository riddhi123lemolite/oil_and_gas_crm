// ============================================================================
// Colour-ramp helpers for the choropleth.
//
// The ramp blends from a theme surface colour (the low end) to the metric's
// palette hue (the high end), producing solid, crisp fills that read well in
// both light and dark themes and drive a matching gradient legend.
// ============================================================================

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): Rgb {
  let h = hex.trim().replace('#', '');
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** Linear blend between two hex colours. `t` is clamped to [0, 1]. */
export function mix(low: string, high: string, t: number): string {
  const c = Math.max(0, Math.min(1, t));
  const a = hexToRgb(low);
  const b = hexToRgb(high);
  const r = Math.round(a.r + (b.r - a.r) * c);
  const g = Math.round(a.g + (b.g - a.g) * c);
  const bl = Math.round(a.b + (b.b - a.b) * c);
  return `rgb(${r}, ${g}, ${bl})`;
}

/**
 * Build a value→colour scale for one metric. Values are normalised against
 * `max` and eased so mid-range states stay distinguishable.
 */
export function makeColorScale(low: string, hue: string, max: number) {
  return (value: number): string => {
    if (max <= 0 || value <= 0) return low;
    const t = Math.pow(value / max, 0.7);
    return mix(low, hue, t);
  };
}

/** Evenly spaced gradient stops for the legend bar. */
export function gradientStops(low: string, hue: string, steps = 6): string[] {
  return Array.from({ length: steps }, (_, i) =>
    mix(low, hue, Math.pow(i / (steps - 1), 0.7)),
  );
}
