/**
 * RarityDonutChart.jsx — Dev 2 Island
 * Owner: WH (Dev 2)
 * Mounts via: mountIsland('rarity-donut-chart-root', RarityDonutChart)
 * PHP view: backend/src/Views/dashboard.php
 */

import { useEffect, useRef, useMemo } from 'react';
import Card     from '../../shared/atoms/Card.jsx';
import Skeleton from '../../shared/atoms/Skeleton.jsx';
import { useApi }   from '../../shared/hooks/useApi.js';

import {
  Chart,
  ArcElement,
  DoughnutController,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(ArcElement, DoughnutController, Tooltip, Legend);

// FIX: normalise any incoming rarity string to a single lookup key
// Handles DB Title Case ('Ultra Rare'), SCREAMING_SNAKE ('ULTRA_RARE'),
// and anything in between.
function normaliseRarity(raw) {
  if (!raw) return 'COMMON';
  return raw.toUpperCase().replace(/\s+/g, '_');
}

// FIX: keyed by normalised SCREAMING_SNAKE — covers all 5 rarity tiers
const RARITY_COLORS = {
  COMMON:      '#94a3b8',
  UNCOMMON:    '#4ade80',
  RARE:        '#60a5fa',
  ULTRA_RARE:  '#c084fc',
  SECRET_RARE: '#f59e0b',
  // DB also uses 'Legendary' as a legacy value in the ENUM — map it too
  LEGENDARY:   '#f59e0b',
};

// Human-readable labels for the legend
const RARITY_LABELS = {
  COMMON:      'Common',
  UNCOMMON:    'Uncommon',
  RARE:        'Rare',
  ULTRA_RARE:  'Ultra Rare',
  SECRET_RARE: 'Secret Rare',
  LEGENDARY:   'Legendary',
};

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export default function RarityDonutChart() {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  const { data, loading, error } = useApi('/api/v1/user/portfolio');
  const rarityCounts = useMemo(() => {
    const source = (data?.portfolio ?? []);

    return source.reduce((acc, a) => {
      const key = normaliseRarity(a.rarity);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
  }, [data]);

  useEffect(() => {
    if (!canvasRef.current || Object.keys(rarityCounts).length === 0) return;
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }

    const keys      = Object.keys(rarityCounts);
    const values    = Object.values(rarityCounts);
    // Use human-readable labels in the legend
    const labels    = keys.map(k => RARITY_LABELS[k] ?? k);
    const colors    = keys.map(k => RARITY_COLORS[k] ?? '#94a3b8');
    const textMuted = cssVar('--color-text-muted');
    const surface2  = cssVar('--color-surface-2');
    const border    = cssVar('--color-border');

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data:            values,
          backgroundColor: colors,
          borderColor:     border,
          borderWidth:     2,
          hoverOffset:     6,
        }],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color:    textMuted,
              font:     { size: 11 },
              boxWidth: 12,
              padding:  10,
            },
          },
          tooltip: {
            backgroundColor: surface2,
            borderColor:     border,
            borderWidth:     1,
            titleColor:      cssVar('--color-text-primary'),
            bodyColor:       textMuted,
            callbacks: {
              label: ctx =>
                ` ${ctx.label}: ${ctx.parsed} asset${ctx.parsed !== 1 ? 's' : ''}`,
            },
          },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [rarityCounts]);

  if (loading) return <Skeleton variant="card" label="Loading rarity chart" />;

  if (error) {
    return (
      <Card variant="default" padding="md">
        <p role="alert" className="text-sm text-(--color-danger)">
          Failed to load chart: {error}
        </p>
      </Card>
    );
  }

  if (Object.keys(rarityCounts).length === 0) {
    return (
      <Card variant="default" padding="md" className="flex flex-col gap-3">
        <h3 className="text-sm font-bold text-(--color-text-primary)">
          Portfolio by Rarity
        </h3>
        <div className="flex items-center justify-center" style={{ height: 200 }}>
          <p className="text-sm text-(--color-text-muted)">
            No assets in portfolio yet.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="md" className="flex flex-col gap-3">
      <h3 className="text-sm font-bold text-(--color-text-primary)">
        Portfolio by Rarity
      </h3>
      <div style={{ height: 200 }}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Doughnut chart showing portfolio breakdown by rarity tier"
        />
      </div>
    </Card>
  );
}