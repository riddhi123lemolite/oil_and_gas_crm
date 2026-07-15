import { useEffect, useState } from 'react';
import { useThemeStore } from '@/stores/themeStore';

/**
 * Read a CSS custom property (e.g. `--bg-muted`) as a resolved value and keep
 * it in sync when the theme toggles. Used to feed theme-aware colours into
 * SVG fills that can't reference Tailwind classes directly.
 */
export function useCssVar(name: string, fallback = '#000000'): string {
  const theme = useThemeStore((s) => s.theme);
  const [value, setValue] = useState(fallback);

  useEffect(() => {
    const resolved = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
    setValue(resolved || fallback);
  }, [name, fallback, theme]);

  return value;
}
