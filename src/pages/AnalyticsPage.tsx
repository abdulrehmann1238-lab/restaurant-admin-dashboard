import { useEffect, useState } from 'react';
import {
  CalendarRange,
  Download,
  Info,
  TrendingUp,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '../components/ui/Button';
import { useRestaurant } from '../context/RestaurantContext';
import { useToast } from '../context/ToastContext';
import { fetchSalesSummary } from '../services/analyticsService';
import type { DateRangeKey, SalesSummary } from '../types';
import { exportToCsv, formatCompactCurrency, formatCurrency } from '../utils/format';

const ANALYTICS_RANGES: Array<{ key: DateRangeKey; label: string }> = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: '7d', label: 'Last 7 Days' },
  { key: '30d', label: 'Last 30 Days' },
  { key: 'month', label: 'This Month' },
  { key: 'custom', label: 'Custom Range' },
];

export function AnalyticsPage() {
  const { activeRestaurantId, activeRestaurant, settings } = useRestaurant();
  const { showToast } = useToast();

  const [range, setRange] = useState<DateRangeKey>('7d');
  const [customStart, setCustomStart] = useState('2026-11-05');
  const [customEnd, setCustomEnd] = useState('2026-11-11');
  const [summary, setSummary] = useState<SalesSummary | null>(null);

  useEffect(() => {
    let active = true;
    void fetchSalesSummary(activeRestaurantId, range).then((data) => {
      if (active) setSummary(data);
    });
    return () => {
      active = false;
    };
  }, [activeRestaurantId, range]);

  const handleExportCsv = () => {
    if (!summary) return;
    const rangeLabel =
      ANALYTICS_RANGES.find((r) => r.key === range)?.label ?? range;

    const headers = ['Section', 'Label', 'Metric 1', 'Metric 2', 'Notes'];
    const rows: Array<Array<string | number>> = [
      ['Summary', 'Restaurant', activeRestaurant.name, rangeLabel, ''],
      ['Summary', 'Total Revenue', summary.totalRevenue.toFixed(2), `${summary.revenueChangePct}% change`, settings.currency],
      ['Summary', 'Gross Sales', summary.grossSales.toFixed(2), '', settings.currency],
      ['Summary', 'Net Sales', summary.netSales.toFixed(2), '', settings.currency],
      ['Summary', 'Total Orders', summary.totalOrders, `${summary.ordersChangePct}% change`, ''],
      ['Summary', 'Average Order Value', summary.averageOrderValue.toFixed(2), `${summary.aovChangePct}% change`, settings.currency],
      ['Summary', 'Refunds', summary.refunds.toFixed(2), `${summary.refundCount} refunds`, settings.currency],
      ...summary.series.map((pt) => [
        'Revenue Series',
        pt.label,
        pt.current.toFixed(2),
        pt.previous.toFixed(2),
        `${pt.orders} orders`,
      ]),
      ...summary.breakdown.map((b) => [
        'Order Type',
        b.type,
        b.revenue.toFixed(2),
        `${b.percentage}%`,
        `${b.orders} orders`,
      ]),
      ...summary.topProducts.map((p) => [
        'Best-Selling Product',
        p.name,
        p.revenue.toFixed(2),
        `${p.unitsSold} units`,
        `${p.sharePercent}% of sales`,
      ]),
    ];

    const slug = activeRestaurant.name.toLowerCase().replace(/\s+/g, '-');
    exportToCsv(`${slug}-sales-${range}.csv`, headers, rows);
    showToast({
      title: 'Sales report exported',
      description: `Downloaded ${slug}-sales-${range}.csv`,
      variant: 'success',
    });
  };

  const maxShare = Math.max(
    ...(summary?.topProducts.map((p) => p.sharePercent) ?? [20]),
    1,
  );

  return (
    <div className="space-y-6">
      {/* Header + Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] sm:text-[26px] font-semibold tracking-tight text-[var(--text-primary)]">
            Sales &amp; Analytics
          </h2>
          <p className="mt-1 text-[14px] text-[var(--text-secondary)]">
            Understand your revenue, orders, and restaurant performance.
          </p>
        </div>

        <Button
          onClick={handleExportCsv}
          disabled={!summary}
          icon={<Download className="h-4 w-4" />}
        >
          Export Report
        </Button>
      </div>

      {/* Date Filter Pills */}
      <section className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="Analytics date range"
            className="flex flex-wrap items-center gap-1.5"
          >
            {ANALYTICS_RANGES.map((item) => {
              const active = range === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setRange(item.key)}
                  className={`h-8 rounded-lg px-3 text-[13px] font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-[var(--brand-primary)] text-white'
                      : 'border border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {range === 'custom' && (
            <div className="flex flex-wrap items-center gap-2 text-[13px]">
              <CalendarRange className="h-4 w-4 text-[var(--brand-primary)]" />
              <input
                type="date"
                aria-label="Custom range start date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="h-8 rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] px-2.5 text-[12.5px] text-[var(--text-primary)]"
              />
              <span className="text-[var(--text-muted)]">to</span>
              <input
                type="date"
                aria-label="Custom range end date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="h-8 rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] px-2.5 text-[12.5px] text-[var(--text-primary)]"
              />
            </div>
          )}
        </div>
      </section>

      {/* 6 Revenue Metrics */}
      <section aria-label="Revenue summary metrics" className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4">
          <p className="text-[11.5px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Total Revenue
          </p>
          <p className="mt-2 text-[20px] font-semibold tabular-nums text-[var(--text-primary)]">
            {formatCurrency(summary?.totalRevenue ?? 0, settings.currency)}
          </p>
          <p className="mt-1 inline-flex items-center gap-1 text-[12px] font-medium text-[var(--status-success)] tabular-nums">
            <TrendingUp className="h-3 w-3" />+{summary?.revenueChangePct ?? 0}%
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4">
          <p className="text-[11.5px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Gross Sales
          </p>
          <p className="mt-2 text-[20px] font-semibold tabular-nums text-[var(--text-primary)]">
            {formatCurrency(summary?.grossSales ?? 0, settings.currency)}
          </p>
          <p className="mt-1 text-[12px] text-[var(--text-secondary)]">Before discounts &amp; fees</p>
        </div>

        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4">
          <p className="text-[11.5px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Net Sales
          </p>
          <p className="mt-2 text-[20px] font-semibold tabular-nums text-[var(--text-primary)]">
            {formatCurrency(summary?.netSales ?? 0, settings.currency)}
          </p>
          <p className="mt-1 text-[12px] text-[var(--text-secondary)]">After refunds</p>
        </div>

        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4">
          <p className="text-[11.5px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Total Orders
          </p>
          <p className="mt-2 text-[20px] font-semibold tabular-nums text-[var(--text-primary)]">
            {summary?.totalOrders.toLocaleString() ?? 0}
          </p>
          <p className="mt-1 inline-flex items-center gap-1 text-[12px] font-medium text-[var(--status-success)] tabular-nums">
            <TrendingUp className="h-3 w-3" />+{summary?.ordersChangePct ?? 0}%
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4">
          <p className="text-[11.5px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Avg Order Value
          </p>
          <p className="mt-2 text-[20px] font-semibold tabular-nums text-[var(--text-primary)]">
            {formatCurrency(summary?.averageOrderValue ?? 0, settings.currency)}
          </p>
          <p className="mt-1 inline-flex items-center gap-1 text-[12px] font-medium text-[var(--status-success)] tabular-nums">
            <TrendingUp className="h-3 w-3" />+{summary?.aovChangePct ?? 0}%
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4">
          <p className="text-[11.5px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Refunds
          </p>
          <p className="mt-2 text-[20px] font-semibold tabular-nums text-[var(--status-danger)]">
            {formatCurrency(summary?.refunds ?? 0, settings.currency)}
          </p>
          <p className="mt-1 text-[12px] tabular-nums text-[var(--text-secondary)]">
            {summary?.refundCount ?? 0} {summary?.refundCount === 1 ? 'order' : 'orders'}
          </p>
        </div>
      </section>

      {/* Revenue Performance Chart + Order Type Breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <section className="xl:col-span-8 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">
                Revenue Performance
              </h3>
              <p className="text-[13px] text-[var(--text-secondary)]">
                {range === 'custom'
                  ? `Custom window (${customStart} to ${customEnd})`
                  : `${ANALYTICS_RANGES.find((r) => r.key === range)?.label} revenue vs. prior period`}
              </p>
            </div>
            <div className="flex items-center gap-4 text-[12.5px]">
              <span className="inline-flex items-center gap-1.5 text-[var(--text-primary)]">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--brand-primary)]" />
                Current
              </span>
              <span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--text-muted)]" />
                Previous Period
              </span>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={summary?.series ?? []}
                margin={{ top: 8, right: 10, left: -8, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="analyticsRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#526B58" stopOpacity={0.24} />
                    <stop offset="100%" stopColor="#526B58" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border-color)"
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v: number) => formatCompactCurrency(v, settings.currency)}
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-color)',
                    borderRadius: '10px',
                    boxShadow: 'var(--shadow-md)',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                  }}
                  formatter={(value: number, name: string) => [
                    formatCurrency(value, settings.currency),
                    name === 'current' ? 'Current Period' : 'Previous Period',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="previous"
                  stroke="#A0A69F"
                  strokeWidth={1.75}
                  strokeDasharray="4 4"
                  fill="transparent"
                />
                <Area
                  type="monotone"
                  dataKey="current"
                  stroke="#526B58"
                  strokeWidth={2.25}
                  fill="url(#analyticsRevGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Donut Chart Breakdown by Order Type */}
        <section className="xl:col-span-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">
              Revenue Breakdown
            </h3>
            <p className="text-[13px] text-[var(--text-secondary)]">
              Share by fulfillment channel
            </p>
          </div>

          <div className="my-4 h-[190px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary?.breakdown ?? []}
                  dataKey="revenue"
                  nameKey="type"
                  innerRadius={56}
                  outerRadius={80}
                  paddingAngle={3}
                  stroke="none"
                >
                  {(summary?.breakdown ?? []).map((entry) => (
                    <Cell key={entry.type} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-color)',
                    borderRadius: '10px',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                  }}
                  formatter={(value: number) =>
                    formatCurrency(value, settings.currency)
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="space-y-2.5 border-t border-[var(--border-color)] pt-4">
            {(summary?.breakdown ?? []).map((item) => (
              <li
                key={item.type}
                className="flex items-center justify-between text-[13.5px]"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-[var(--text-primary)]">
                    {item.type}
                  </span>
                  <span className="text-[12px] text-[var(--text-secondary)] tabular-nums">
                    ({item.orders})
                  </span>
                </div>
                <div className="text-right tabular-nums">
                  <span className="font-semibold text-[var(--text-primary)]">
                    {formatCurrency(item.revenue, settings.currency)}
                  </span>
                  <span className="ml-2 text-[12px] text-[var(--text-secondary)]">
                    {item.percentage}%
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Best-Selling Products + Sales Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <section className="xl:col-span-8 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] overflow-hidden">
          <div className="border-b border-[var(--border-color)] px-5 py-4">
            <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">
              Best-Selling Products
            </h3>
            <p className="text-[13px] text-[var(--text-secondary)]">
              Ranked by revenue contribution for the selected period
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-[var(--bg-elevated)] text-[11.5px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  <th className="py-3 pl-5 pr-3">Product</th>
                  <th className="py-3 px-3 text-right">Units Sold</th>
                  <th className="py-3 px-3 text-right">Revenue</th>
                  <th className="py-3 pl-3 pr-5 w-[220px]">Share of Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-[13.5px]">
                {(summary?.topProducts ?? []).map((product, index) => (
                  <tr key={product.id} className="hover:bg-[var(--bg-hover)]/50">
                    <td className="py-3.5 pl-5 pr-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--bg-elevated)] text-[12px] font-semibold tabular-nums text-[var(--text-secondary)] shrink-0">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">
                            {product.name}
                          </p>
                          <p className="text-[12px] text-[var(--text-secondary)]">
                            {product.category}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right tabular-nums text-[var(--text-primary)]">
                      {product.unitsSold.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-semibold tabular-nums text-[var(--text-primary)]">
                      {formatCurrency(product.revenue, settings.currency)}
                    </td>
                    <td className="py-3.5 pl-3 pr-5">
                      <div className="flex items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
                          <div
                            className="h-full rounded-full bg-[var(--brand-primary)] transition-all duration-300"
                            style={{
                              width: `${Math.min(100, (product.sharePercent / maxShare) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="w-11 text-right text-[12.5px] font-medium tabular-nums text-[var(--text-secondary)]">
                          {product.sharePercent}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Sales Insights */}
        <section className="xl:col-span-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">
                Sales Insights
              </h3>
              <p className="text-[12.5px] text-[var(--text-secondary)]">
                Summary highlights from selected period
              </p>
            </div>
            <Info className="h-4 w-4 text-[var(--text-muted)]" />
          </div>

          <ul className="space-y-3">
            {(summary?.insights ?? []).map((insight) => {
              const toneClasses =
                insight.tone === 'positive'
                  ? 'border-[var(--status-success)]/20 bg-[var(--status-success-bg)]/60'
                  : insight.tone === 'warm'
                    ? 'border-[var(--warm-accent)]/25 bg-[var(--bg-warm)]/60'
                    : 'border-[var(--border-color)] bg-[var(--bg-elevated)]';
              return (
                <li
                  key={insight.id}
                  className={`rounded-xl border px-4 py-3.5 text-[13.5px] leading-relaxed text-[var(--text-primary)] ${toneClasses}`}
                >
                  {insight.text}
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}

