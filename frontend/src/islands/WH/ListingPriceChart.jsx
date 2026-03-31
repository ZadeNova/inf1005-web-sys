/**
 * ListingPriceChart.jsx — WH Island
 * Mounts via: mountIsland('listing-price-chart-root', ListingPriceChart)
 * PHP view: backend/src/Views/listing.php
 *
 * API: GET /api/v1/market/listings/{id}/price-history
 * Response: { history: [{ price: float, soldAt: string }] }
 */

import { useEffect, useRef } from 'react';
import Card    from '../../shared/atoms/Card.jsx';
import Skeleton from '../../shared/atoms/Skeleton.jsx';
import { useApi } from '../../shared/hooks/useApi.js';

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

export default function ListingPriceChart({ listingId }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  const { data, loading, error } = useApi(
    listingId ? `/api/v1/market/listings/${listingId}/price-history` : null,
    { auto: !!listingId }
  );

  const history = data?.history ?? [];

  useEffect(() => {
    if (!canvasRef.current || history.length < 2) return;
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }

    const accent    = cssVar('--color-accent');
    const textMuted = cssVar('--color-text-muted');
    const border    = cssVar('--color-border');

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: history.map(h =>
          new Date(h.soldAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        ),
        datasets: [{
          label: 'Sale Price (USD)',
          // FIX: parseFloat because price may come as string from MySQL DECIMAL
          data:             history.map(h => parseFloat(h.price)),
          borderColor:      accent,
          backgroundColor:  `${accent}22`,
          borderWidth:      2,
          pointRadius:      4,
          pointHoverRadius: 7,
          tension:          0.3,
          fill:             true,
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
              label: ctx => ` $${ctx.parsed.y.toFixed(2)}`,
            },
          },
        },
        scales: {
          x: { ticks: { color: textMuted, font: { size: 11 } }, grid: { color: border } },
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
  }, [history]);

  if (loading) return <Skeleton variant="block" height={240} label="Loading price history" />;

  if (error) return (
    <p role="alert" className="text-sm text-(--color-danger)">
      Failed to load price history: {error}
    </p>
  );

  if (history.length < 2) {
    return (
      <Card variant="inset" padding="lg" className="text-center">
        <p className="text-sm text-(--color-text-muted)">
          Not enough trade history yet.
        </p>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="md">
      <div style={{ height: 240 }}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Asset price history line chart"
        />
      </div>
    </Card>
  );
}
