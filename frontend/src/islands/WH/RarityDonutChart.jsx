/**
 * RarityDonutChart.jsx — Dev 2 Island
 * Owner: WH (Dev 2)
 * Extracted from: frontend/src/pages/dashboard.jsx
 * Mounts via: mountIsland('rarity-donut-chart-root', RarityDonutChart)
 * PHP view: backend/src/Views/dashboard.php
 *
 * Doughnut chart — portfolio breakdown by rarity tier.
 * Uses Chart.js (already installed).
 *
 * API endpoint (when USE_MOCK = false):
 *   GET /api/v1/user/portfolio
 *   Returns: { portfolio: [{ rarity, ... }, ...] }
 */

import { useEffect, useRef, useMemo } from 'react';
import Card     from '../../shared/atoms/Card.jsx';
import Skeleton from '../../shared/atoms/Skeleton.jsx';
import { useApi }   from '../../shared/hooks/useApi.js';
import { mockAssets, USE_MOCK } from '../../shared/mockAssets.js';

import {
  Chart,
  ArcElement,
  DoughnutController,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(ArcElement, DoughnutController, Tooltip, Legend);

/* Paul Tol palette — colourblind-safe, matches colorblind CSS var theme */
const RARITY_COLORS = {
    // DB Title Case values
    'Common':    '#94a3b8',
    'Rare':      '#60a5fa',
    'Legendary': '#f59e0b',
    // Uppercase for mock data
    'COMMON':      '#94a3b8',
    'UNCOMMON':    '#4ade80',
    'RARE':        '#60a5fa',
    'ULTRA_RARE':  '#c084fc',
    'SECRET_RARE': '#f59e0b',
};

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export default function RarityDonutChart() {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  const { data, loading, error } = useApi(
    USE_MOCK ? null : '/api/v1/user/portfolio',
    { auto: !USE_MOCK }
  );

  const rarityCounts = useMemo(() => {
    const source = USE_MOCK
      ? mockAssets
      : (data?.portfolio ?? []);

    return source.reduce((acc, a) => {
      acc[a.rarity] = (acc[a.rarity] ?? 0) + 1;
      return acc;
    }, {});
  }, [data]);

  useEffect(() => {
    if (!canvasRef.current || Object.keys(rarityCounts).length === 0) return;
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }

    const labels    = Object.keys(rarityCounts);
    const values    = Object.values(rarityCounts);
    const colors    = labels.map(r => RARITY_COLORS[r] ?? '#94a3b8');
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
