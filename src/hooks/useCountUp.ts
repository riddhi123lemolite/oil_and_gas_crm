import { useEffect, useRef, useState } from 'react';

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

/**
 * Animate a number from 0 → target once on mount. Starts already showing the
 * target value, so if animation can't run (reduced motion or a backgrounded
 * tab where rAF is paused) the correct figure is still displayed.
 */
export function useCountUp(target: number, duration = 1000): number {
  const [value, setValue] = useState(target);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) {
      setValue(target);
      return;
    }
    started.current = true;

    const reduced = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduced || document.hidden || target === 0) {
      setValue(target);
      return;
    }

    let raf = 0;
    const start = performance.now();
    setValue(0);
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setValue(target * easeOutCubic(p));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setValue(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}
