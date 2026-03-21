/**
 * PortfolioChart.jsx — Dev 2 Island
 * Owner: WH (Dev 2)
 * Mounts via: mountIsland('portfolio-chart-root', PortfolioChart)
 *
 * FIX: Added "Current: $X" label above the time-range buttons so the chart's
 * computed portfolio value is always visible and comparable to the stat card.
 * The stat card (PageController PHP) and the chart (portfolioHistory API) can
 * differ by up to a few seconds of timing — the label makes this transparent.
 *
 * FIX: Falls back gracefully when only a single data point exists (new users).
 * A single-point line chart now renders correctly instead of crashing.
 */

import { useEffect, useRef, useState } from 'react';
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

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

const TIME_RANGES = ['1W', '1M', '3M'];

const MOCK_DATA = {
  '1W': { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: [2600, 2650, 2700, 2680, 2750, 2800, 2847] },
  '1M': { labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],        values: [1200, 1850, 1600, 2400, 2100, 2847] },
  '3M': { labels: ['Jan', 'Feb', 'Mar'],                              values: [2400, 2100, 2847] },
};

export default function PortfolioChart() {
  const canvasRef         = useRef(null);
  const chartRef          = useRef(null);
  const [range, setRange] = useState('1M');

  const { data, loading, error } = useApi(
    USE_MOCK ? null : `/api/v1/dashboard/portfolio-history?range=${range}`,
    { auto: !USE_MOCK }
  );

  const chartData = USE_MOCK ? MOCK_DATA[range] : data;

  // Current value = last data point in the series
  const currentValue = chartData?.values?.length
    ? chartData.values[chartData.values.length - 1]
    : null;

  useEffect(() => {
    if (!chartData || !canvasRef.current) return;
    if (!chartData.values?.length) return;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const accent    = cssVar('--color-accent');
    const textMuted = cssVar('--color-text-muted');
    const border    = cssVar('--color-border');

    // For a single data point, show a point but no connecting line
    const isSinglePoint = chartData.values.length === 1;

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels:   chartData.labels,
        datasets: [{
          label:                'Total Portfolio Value (USD)',
          data:                 chartData.values,
          borderColor:          accent,
          backgroundColor:      `${accent}22`,
          borderWidth:          isSinglePoint ? 0 : 2,
          pointRadius:          isSinglePoint ? 6 : 4,
          pointHoverRadius:     8,
          pointBackgroundColor: accent,
          tension:              0.4,
          fill:                 true,
        }],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: cssVar('--color-surface-2'),
            borderColor:     border,
            borderWidth:     1,
            titleColor:      cssVar('--color-text-primary'),
            bodyColor:       textMuted,
            padding:         10,
            callbacks: {
              label: ctx => ` $${Number(ctx.parsed.y).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
              // Explain if only one point
              afterBody: isSinglePoint
                ? () => ['← Current value']
                : undefined,
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
              callback: v => `$${Number(v).toLocaleString()}`,
            },
            grid: { color: border },
          },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [chartData, range]);

  if (loading) return <Skeleton variant="block" height={280} label="Loading portfolio chart" />;

  if (error) {
    return (
      <p role="alert" className="text-sm text-(--color-danger)">
        Failed to load chart: {error}
      </p>
    );
  }

  return (
    <Card variant="default" padding="md" className="flex flex-col gap-3">

      {/* Header: title + current value + time range selector */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-bold text-(--color-text-primary)">
            Total Portfolio Value Over Time
          </h3>
          {currentValue !== null && (
            <p className="text-xs text-(--color-accent) font-semibold mt-0.5">
              Current:{' '}
              <span>
                ${Number(currentValue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-(--color-text-muted) font-normal ml-1">
                (wallet + assets)
              </span>
            </p>
          )}
        </div>

        {/* Time range selector */}
        <div className="flex gap-1" role="group" aria-label="Chart time range">
          {TIME_RANGES.map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              aria-pressed={range === r}
              className={`px-2.5 py-1 text-[10px] font-semibold rounded-sm transition-colors duration-150
                ${range === r
                  ? 'bg-(--color-accent) text-white'
                  : 'text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-surface-2)'
                }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div style={{ height: 280 }}>
        <canvas
          ref={canvasRef}
          aria-label="Total portfolio value over time line chart"
          role="img"
        />
      </div>

      {/* Explainer for single-point charts (new users) */}
      {chartData?.values?.length === 1 && (
        <p className="text-xs text-(--color-text-muted) text-center">
          Not enough history to show a trend yet. Check back after your next transaction.
        </p>
      )}
    </Card>
  );
}