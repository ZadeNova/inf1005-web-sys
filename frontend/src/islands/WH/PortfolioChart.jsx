/**
 * PortfolioChart.jsx — Dev 2 Island
 * Owner: Dev 2
 * Mounts via: mountIsland('portfolio-chart-root', PortfolioChart)
 * PHP view: backend/src/Views/dashboard.php
 * Page entry: src/pages/dashboard.jsx
 *
 * Line chart showing the current user's portfolio value over time.
 * Uses Chart.js — must be installed: npm install chart.js
 *
 * RULES:
 *   ✅ Import atoms from '../../shared/atoms/'
 *   ✅ USE_MOCK flag respected
 *   ✅ loading / error / success states required
 *   ❌ No hardcoded hex values — use cssVar() helper below
 *
 * API endpoint (when USE_MOCK = false):
 *   GET /api/v1/dashboard/portfolio-history
 *   Returns: { labels: string[], values: number[] }
 */

import { useEffect, useRef } from 'react';
import Card     from '../../shared/atoms/Card.jsx';
import Skeleton from '../../shared/atoms/Skeleton.jsx';
import { useApi }   from '../../shared/hooks/useApi.js';
import { USE_MOCK } from '../../shared/mockAssets.js';

import {
  Chart,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Tooltip,
  Filler,
} from 'chart.js';

Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip, Filler);

/* Reads live CSS variable — works across all three theme modes */
function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/* Mock portfolio history */
const MOCK_DATA = {
  labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
  values: [1200, 1850, 1600, 2400, 2100, 2847],
};

export default function PortfolioChart() {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  const { data, loading, error } = useApi(
    USE_MOCK ? null : '/api/v1/dashboard/portfolio-history',
    { auto: !USE_MOCK }
  );

  const chartData = USE_MOCK ? MOCK_DATA : data;

  useEffect(() => {
    if (!chartData || !canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const accent    = cssVar('--color-accent');
    const textMuted = cssVar('--color-text-muted');
    const border    = cssVar('--color-border');

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels:   chartData.labels,
        datasets: [{
          label:           'Portfolio Value (USD)',
          data:            chartData.values,
          borderColor:     accent,
          backgroundColor: `${accent}22`,
          borderWidth:     2,
          pointRadius:     4,
          pointHoverRadius: 7,
          tension:         0.4,
          fill:            true,
        }],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: cssVar('--color-surface-2'),
            borderColor:     border,
            borderWidth:     1,
            titleColor:      cssVar('--color-text-primary'),
            bodyColor:       textMuted,
            callbacks: {
              label: ctx => ` $${ctx.parsed.y.toLocaleString()}`,
            },
          },
        },
        scales: {
          x: {
            ticks: { color: textMuted, font: { size: 11 } },
            grid:  { color: border },
          },
          y: {
            ticks: {
              color: textMuted,
              font:  { size: 11 },
              callback: v => `$${v.toLocaleString()}`,
            },
            grid: { color: border },
          },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [chartData]);

  if (loading) return <Skeleton variant="block" height={240} label="Loading portfolio chart" />;

  if (error) {
    return (
      <p role="alert" className="text-sm text-(--color-danger)">
        Failed to load chart: {error}
      </p>
    );
  }

  return (
    <Card variant="default" padding="md" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-(--color-text-primary)">
          Portfolio Value
        </h3>
        {/* TODO Dev 2: add time range selector (1W / 1M / 3M) */}
      </div>
      <div style={{ height: 220 }}>
        <canvas ref={canvasRef} aria-label="Portfolio value over time" role="img" />
      </div>
    </Card>
  );
}
