import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { geoCentroid } from 'd3-geo';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { makeColorScale } from '@/lib/geo/color';
import { normalizeStateName } from '@/lib/geo/regions';
import type { GeoMetric } from '@/lib/geo/metrics';
import type { StateAnalytics } from '@/lib/geo/types';

const GEO_URL = '/geo/india-states.geo.json';
const HOME = { coordinates: [82.5, 22.6] as [number, number], zoom: 1 };
const MAX_ZOOM = 6;

interface View {
  coordinates: [number, number];
  zoom: number;
}

interface IndiaChoroplethProps {
  data: Record<string, StateAnalytics>;
  metric: GeoMetric;
  max: number;
  lowColor: string;
  lineColor: string;
  selected: string | null;
  onSelect: (state: string | null) => void;
  onHover: (state: StateAnalytics | null, x: number, y: number) => void;
}

const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export function IndiaChoropleth({
  data,
  metric,
  max,
  lowColor,
  lineColor,
  selected,
  onSelect,
  onHover,
}: IndiaChoroplethProps) {
  const [view, setView] = useState<View>(HOME);
  const [ready, setReady] = useState(false);
  const centroids = useRef<Record<string, [number, number]>>({});
  const rafRef = useRef<number | null>(null);
  // Mirror of `view` so the tween always reads the CURRENT viewport, and a
  // flag so the library's own move events don't fight our programmatic tween.
  const viewRef = useRef<View>(HOME);
  const programmatic = useRef(false);
  const tweenId = useRef(0);

  const colorScale = useMemo(
    () => makeColorScale(lowColor, metric.hue, max),
    [lowColor, metric.hue, max],
  );

  const applyView = useCallback((v: View) => {
    viewRef.current = v;
    setView(v);
  }, []);

  // Smoothly tween the viewport toward a target zoom/center. A safety timeout
  // guarantees we still land on the target even if rAF is throttled (e.g. the
  // tab is backgrounded), so the viewport never gets stuck mid-transition.
  const animateTo = useCallback(
    (target: View) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const id = ++tweenId.current;
      const from = { ...viewRef.current };
      const start = performance.now();
      const duration = 600;
      programmatic.current = true;
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        programmatic.current = false;
      };
      const step = (now: number) => {
        if (id !== tweenId.current) return;
        const p = Math.min(1, (now - start) / duration);
        const e = easeInOutCubic(p);
        applyView({
          zoom: from.zoom + (target.zoom - from.zoom) * e,
          coordinates: [
            from.coordinates[0] +
              (target.coordinates[0] - from.coordinates[0]) * e,
            from.coordinates[1] +
              (target.coordinates[1] - from.coordinates[1]) * e,
          ],
        });
        if (p < 1) rafRef.current = requestAnimationFrame(step);
        else finish();
      };
      rafRef.current = requestAnimationFrame(step);
      window.setTimeout(() => {
        if (id === tweenId.current && !done) {
          applyView(target);
          finish();
        }
      }, duration + 150);
    },
    [applyView],
  );

  // Zoom in when a state is selected; zoom home when cleared.
  useEffect(() => {
    if (selected && centroids.current[selected]) {
      animateTo({ coordinates: centroids.current[selected], zoom: 3.4 });
    } else if (!selected) {
      animateTo(HOME);
    }
  }, [selected, animateTo]);

  // Accept viewport changes from user gestures, but ignore the echo the
  // library emits while we're driving a programmatic tween.
  const handleMoveEnd = useCallback((pos: View) => {
    if (programmatic.current) return;
    viewRef.current = pos;
    setView(pos);
  }, []);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative w-full"
    >
      {!ready && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="skeleton size-40 rounded-full" />
        </div>
      )}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [82.5, 22.6], scale: 1050 }}
        width={800}
        height={640}
        style={{ width: '100%', height: 'auto' }}
      >
        <ZoomableGroup
          center={view.coordinates}
          zoom={view.zoom}
          minZoom={1}
          maxZoom={MAX_ZOOM}
          onMoveEnd={handleMoveEnd}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) => {
              if (geographies.length && !ready) {
                // Cache centroids once, and flip the loading flag next tick.
                for (const geo of geographies) {
                  const name = normalizeStateName(geo.properties.name);
                  centroids.current[name] = geoCentroid(geo) as [number, number];
                }
                queueMicrotask(() => setReady(true));
              }
              return geographies.map((geo) => {
                const name = normalizeStateName(geo.properties.name);
                const row = data[name];
                const isSelected = selected === name;
                const fill = row ? colorScale(row[metric.key]) : lowColor;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    tabIndex={-1}
                    onMouseEnter={(e) =>
                      row && onHover(row, e.clientX, e.clientY)
                    }
                    onMouseMove={(e) =>
                      row && onHover(row, e.clientX, e.clientY)
                    }
                    onMouseLeave={() => onHover(null, 0, 0)}
                    onClick={() => row && onSelect(isSelected ? null : name)}
                    style={{
                      default: {
                        fill,
                        stroke: isSelected ? metric.hue : lineColor,
                        strokeWidth: isSelected ? 1.4 : 0.5,
                        outline: 'none',
                        transition:
                          'fill 0.45s ease, stroke 0.2s ease, opacity 0.2s ease',
                        opacity: row ? 1 : 0.5,
                        cursor: row ? 'pointer' : 'default',
                      },
                      hover: {
                        fill,
                        stroke: metric.hue,
                        strokeWidth: 1.2,
                        outline: 'none',
                        opacity: row ? 0.88 : 0.5,
                        cursor: row ? 'pointer' : 'default',
                      },
                      pressed: {
                        fill,
                        stroke: metric.hue,
                        strokeWidth: 1.4,
                        outline: 'none',
                      },
                    }}
                  />
                );
              });
            }}
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </motion.div>
  );
}
