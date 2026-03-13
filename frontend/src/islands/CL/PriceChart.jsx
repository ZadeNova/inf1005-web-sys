/**
 * PriceChart.jsx — Lead Island
 * Mounts via: mountIsland('price-chart-root', PriceChart)
 * PHP view: backend/src/Views/home.php
 * Page entry: src/pages/home.jsx
 *
 * Renders a Chart.js line chart showing collection floor price history.
 * Uses Chart.js via CDN-safe import pattern.
 *
 * API endpoint (when USE_MOCK = false):
 *   GET /api/v1/market/price-history
 *   Returns: { labels: string[], datasets: [{ label, data: number[] }] }
 */

import { useEffect, useRef, useState } from 'react';
import Card     from '../../shared/atoms/Card.jsx';
import Skeleton from '../../shared/atoms/Skeleton.jsx';
import { useApi }              from '../../shared/hooks/useApi.js';
import { mockPriceChartData, USE_MOCK } from '../../shared/mockAssets.js';

/* Chart.js must be installed: npm install chart.js */
import {
  Chart,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

Chart.register(
  LineElement, PointElement, LineController,
  CategoryScale, LinearScale, Tooltip, Legend, Filler
);

/* Read CSS variable from :root — resolves across all three themes */
function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

const TIME_RANGES = ['1W', '1M', '3M', '6M', '1Y'];

export default function PriceChart() {
  const canvasRef   = useRef(null);
  const chartRef    = useRef(null);
  const [range, setRange] = useState('1M');

  const { data, loading, error } = useApi(
    USE_MOCK ? null : `/api/v1/market/price-history?range=${range}`,
    { auto: !USE_MOCK }
  );

  const chartData = USE_MOCK ? mockPriceChartData : data;

  /* Build / rebuild chart when data or range changes */
  useEffect(() => {
    if (!chartData || !canvasRef.current) return;

    /* Destroy previous instance to avoid canvas reuse error */
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const accent   = cssVar('--color-accent');
    const success  = cssVar('--color-success');
    const textMuted = cssVar('--color-text-muted');
    const border   = cssVar('--color-border');

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: chartData.datasets.map((ds, i) => ({
          label:           ds.label,
          data:            ds.data,
          borderColor:     i === 0 ? accent : success,
          backgroundColor: i === 0
            ? `${accent}22`
            : `${success}22`,
          borderWidth:     2,
          pointRadius:     3,
          pointHoverRadius: 6,
          tension:         0.4,
          fill:            true,
        })),
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            labels: {
              color:    textMuted,
              font:     { size: 11 },
              boxWidth: 12,
            },
          },
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

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [chartData, range]);

  if (loading) return <Skeleton variant="block" height={280} label="Loading price chart" />;

  if (error) {
    return (
      <p role="alert" className="text-sm text-(--color-danger)">
        Failed to load chart: {error}
      </p>
    );
  }

  return (
    <Card variant="default" padding="md" className="flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-(--color-text-primary)">
          Collection Floor Prices
        </h3>

        {/* Time range selector */}
        <div className="flex gap-1">
          {TIME_RANGES.map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`
                px-2.5 py-1 text-[10px] font-semibold rounded-sm
                transition-colors duration-150
                ${range === r
                  ? 'bg-(--color-accent) text-white'
                  : 'text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-surface-2)'
                }
              `}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div style={{ height: 240 }}>
        <canvas ref={canvasRef} aria-label="Collection floor price chart" role="img" />
      </div>
    </Card>
  );
}
