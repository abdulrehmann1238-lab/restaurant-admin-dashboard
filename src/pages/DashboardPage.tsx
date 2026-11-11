import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowUpRight,
  Calendar,
  ChefHat,
  Clock,
  DollarSign,
  Plus,
  Receipt,
  Search,
  ShoppingBag,
  TrendingUp,
  UserPlus,
  Utensils,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { MenuItemModal } from '../components/common/MenuItemModal';
import { OrderDetailDrawer } from '../components/common/OrderDetailDrawer';
import { OrderStatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useRestaurant } from '../context/RestaurantContext';
import { fetchSalesSummary } from '../services/analyticsService';
import type { ActivityItem, DateRangeKey, Order, OrderStatus, SalesSummary } from '../types';
import {
  formatCompactCurrency,
  formatCurrency,
  formatDisplayTime,
  formatTodayLabel,
} from '../utils/format';

const CHART_RANGES: Array<{ key: DateRangeKey; label: string }> = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: '90d', label: '90 Days' },
];

const ACTIVITY_ICONS: Record<ActivityItem['type'], React.ReactNode> = {
  order_new: <Receipt className="h-3.5 w-3.5 text-[var(--warm-accent)]" />,
  order_ready: <ChefHat className="h-3.5 w-3.5 text-[var(--status-success)]" />,
  menu_updated: <Utensils className="h-3.5 w-3.5 text-[var(--brand-primary)]" />,
  staff_created: <UserPlus className="h-3.5 w-3.5 text-[var(--status-info)]" />,
};

export function DashboardPage() {
  const {
    activeRestaurantId,
    activeRestaurant,
    orders,
    menuItems,
    activities,
    settings,
  } = useRestaurant();

  const [chartRange, setChartRange] = useState<DateRangeKey>(settings.defaultDateRange);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [todayKpi, setTodayKpi] = useState<SalesSummary | null>(null);

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderStatus>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;
    void fetchSalesSummary(activeRestaurantId, 'today').then((res) => {
      if (active) setTodayKpi(res);
    });
    return () => {
      active = false;
    };
  }, [activeRestaurantId]);

  useEffect(() => {
    let active = true;
    void fetchSalesSummary(activeRestaurantId, chartRange).then((res) => {
      if (active) setSummary(res);
    });
    return () => {
      active = false;
    };
  }, [activeRestaurantId, chartRange]);

  const liveCounts = useMemo(() => {
    const pending = orders.filter((o) => o.status === 'pending').length;
    const preparing = orders.filter((o) => o.status === 'preparing').length;
    const active = pending + preparing;
    return { pending, preparing, active };
  }, [orders]);

  const recentOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    return orders
      .filter((o) => {
        const matchesStatus =
          orderStatusFilter === 'all' || o.status === orderStatusFilter;
        const matchesSearch =
          !q ||
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q);
        return matchesStatus && matchesSearch;
      })
      .slice(0, 6);
  }, [orders, orderSearch, orderStatusFilter]);

  const popularDishes = useMemo(() => {
    return [...menuItems]
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 4);
  }, [menuItems]);

  const selectedOrder: Order | null = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] sm:text-[27px] font-semibold tracking-tight text-[var(--text-primary)]">
            Good morning, Alex.
          </h2>
          <p className="mt-1 text-[14.5px] text-[var(--text-secondary)]">
            Here&apos;s what&apos;s happening at{' '}
            <span className="font-medium text-[var(--text-primary)]">
              {activeRestaurant.name}
            </span>{' '}
            today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 text-[13px] text-[var(--text-secondary)]">
            <Calendar className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
            <span>{formatTodayLabel(settings.dateFormat)}</span>
          </div>

          <select
            aria-label="Dashboard chart date range"
            value={chartRange}
            onChange={(e) => setChartRange(e.target.value as DateRangeKey)}
            className="h-9 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 text-[13px] font-medium text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none cursor-pointer"
          >
            {CHART_RANGES.map((r) => (
              <option key={r.key} value={r.key}>
                {r.label}
              </option>
            ))}
          </select>

          <Button
            onClick={() => setAddMenuOpen(true)}
            icon={<Plus className="h-4 w-4" />}
          >
            New Menu Item
          </Button>
        </div>
      </div>

      {/* Four KPI Cards */}
      <section aria-label="Key performance indicators" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1 — Today's Revenue */}
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 transition-colors hover:border-[var(--border-strong)]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Today&apos;s Revenue
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bg-subtle-green)] text-[var(--brand-primary)]">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-[26px] font-semibold tracking-tight tabular-nums text-[var(--text-primary)]">
            {formatCurrency(todayKpi?.totalRevenue ?? 4285.5, settings.currency)}
          </p>
          <div className="mt-2 flex items-center justify-between text-[12.5px]">
            <span className="inline-flex items-center gap-1 font-medium text-[var(--status-success)] tabular-nums">
              <TrendingUp className="h-3.5 w-3.5" />+
              {todayKpi?.revenueChangePct ?? 12.8}% vs yesterday
            </span>
          </div>
        </div>

        {/* Card 2 — Total Orders */}
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 transition-colors hover:border-[var(--border-strong)]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Total Orders
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bg-subtle-green)] text-[var(--brand-primary)]">
              <ShoppingBag className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-[26px] font-semibold tracking-tight tabular-nums text-[var(--text-primary)]">
            {todayKpi?.totalOrders ?? 128}
          </p>
          <div className="mt-2 flex items-center justify-between text-[12.5px]">
            <span className="inline-flex items-center gap-1 font-medium text-[var(--status-success)] tabular-nums">
              <TrendingUp className="h-3.5 w-3.5" />+
              {todayKpi?.ordersChangePct ?? 8.2}% vs yesterday
            </span>
          </div>
        </div>

        {/* Card 3 — Average Order Value */}
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 transition-colors hover:border-[var(--border-strong)]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Average Order Value
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bg-warm)] text-[var(--warm-accent)]">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-[26px] font-semibold tracking-tight tabular-nums text-[var(--text-primary)]">
            {formatCurrency(todayKpi?.averageOrderValue ?? 33.48, settings.currency)}
          </p>
          <div className="mt-2 flex items-center justify-between text-[12.5px]">
            <span className="inline-flex items-center gap-1 font-medium text-[var(--status-success)] tabular-nums">
              <TrendingUp className="h-3.5 w-3.5" />+
              {todayKpi?.aovChangePct ?? 4.6}% vs yesterday
            </span>
          </div>
        </div>

        {/* Card 4 — Active Orders */}
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 transition-colors hover:border-[var(--border-strong)]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Active Orders
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bg-warm)] text-[var(--warm-accent)]">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-[26px] font-semibold tracking-tight tabular-nums text-[var(--text-primary)]">
            {liveCounts.active}
          </p>
          <p className="mt-2 text-[12.5px] font-medium text-[var(--text-secondary)] tabular-nums">
            <span className="text-[var(--warm-accent)]">{liveCounts.preparing} preparing</span>
            {' · '}
            <span className="text-[var(--status-warning)]">{liveCounts.pending} pending</span>
          </p>
        </div>
      </section>

      {/* Revenue Overview Chart + Popular Items Today */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Revenue Chart */}
        <section className="xl:col-span-8 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">
                Revenue Overview
              </h3>
              <p className="text-[13px] text-[var(--text-secondary)]">
                Track your restaurant&apos;s performance over time.
              </p>
            </div>

            <div
              role="tablist"
              aria-label="Revenue timeframe"
              className="inline-flex rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] p-0.5 self-start sm:self-auto"
            >
              {CHART_RANGES.map((tab) => {
                const active = chartRange === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setChartRange(tab.key)}
                    className={`rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors cursor-pointer ${
                      active
                        ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[var(--shadow-xs)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-6 text-[13px]">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--brand-primary)]" />
              <span className="text-[var(--text-secondary)]">Selected Period:</span>
              <span className="font-semibold tabular-nums text-[var(--text-primary)]">
                {formatCurrency(summary?.totalRevenue ?? 0, settings.currency)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--border-strong)]" />
              <span className="text-[var(--text-secondary)]">Previous Period comparison</span>
            </div>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={summary?.series ?? []}
                margin={{ top: 8, right: 10, left: -8, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revCurrentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#526B58" stopOpacity={0.22} />
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
                    name === 'current' ? 'Revenue' : 'Previous Period',
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
                  fill="url(#revCurrentGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Popular Items Today */}
        <section className="xl:col-span-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">
                  Popular Items Today
                </h3>
                <p className="text-[12.5px] text-[var(--text-secondary)]">
                  Top performing dishes by order count
                </p>
              </div>
              <Link
                to="/dashboard/menu"
                className="text-[12.5px] font-medium text-[var(--brand-primary)] hover:underline"
              >
                Full menu
              </Link>
            </div>

            <ul className="divide-y divide-[var(--border-color)]">
              {popularDishes.map((dish) => (
                <li key={dish.id} className="flex items-center justify-between gap-3 py-3 first:pt-1 last:pb-1">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={dish.imageUrl}
                      alt={dish.name}
                      loading="lazy"
                      className="h-11 w-11 rounded-lg object-cover border border-[var(--border-color)] shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-medium text-[var(--text-primary)]">
                        {dish.name}
                      </p>
                      <p className="text-[12px] text-[var(--text-secondary)]">
                        {dish.category} ·{' '}
                        <span className="tabular-nums">{dish.orderCount} sold</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13.5px] font-semibold tabular-nums text-[var(--text-primary)]">
                      {formatCurrency(dish.orderCount * dish.price, settings.currency)}
                    </p>
                    <p className="text-[11.5px] tabular-nums text-[var(--text-muted)]">
                      {formatCurrency(dish.price, settings.currency)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* Recent Orders + Operational Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Recent Orders Table */}
        <section className="xl:col-span-8 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] px-5 py-4">
            <div>
              <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">
                Recent Orders
              </h3>
              <p className="text-[12.5px] text-[var(--text-secondary)]">
                Click any order to inspect items or update kitchen status
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="search"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search ID or guest..."
                  aria-label="Search recent orders"
                  className="h-8 w-44 rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] pl-8 pr-2.5 text-[12.5px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)] focus:outline-none"
                />
              </div>

              <select
                aria-label="Filter recent orders by status"
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value as 'all' | OrderStatus)}
                className="h-8 rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] px-2.5 text-[12.5px] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="completed">Completed</option>
              </select>

              <Link
                to="/dashboard/orders"
                className="inline-flex h-8 items-center rounded-lg border border-[var(--border-color)] px-3 text-[12.5px] font-medium text-[var(--brand-primary)] hover:bg-[var(--bg-subtle-green)] transition-colors"
              >
                View All Orders
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-[var(--bg-elevated)] text-[11.5px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  <th className="py-3 pl-5 pr-3">Order ID</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Items</th>
                  <th className="py-3 px-3">Order Type</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Time</th>
                  <th className="py-3 pl-3 pr-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-[13.5px]">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-10 text-center text-[13.5px] text-[var(--text-secondary)]"
                    >
                      No orders match your filter.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => {
                    const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
                    return (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrderId(order.id)}
                        className="hover:bg-[var(--bg-hover)]/70 transition-colors cursor-pointer"
                      >
                        <td className="py-3 pl-5 pr-3 font-semibold tabular-nums text-[var(--text-primary)] whitespace-nowrap">
                          {order.orderNumber}
                        </td>
                        <td className="py-3 px-3 text-[var(--text-primary)] whitespace-nowrap">
                          {order.customerName}
                        </td>
                        <td className="py-3 px-3 tabular-nums text-[var(--text-secondary)] whitespace-nowrap">
                          {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </td>
                        <td className="py-3 px-3 text-[var(--text-secondary)] whitespace-nowrap">
                          {order.orderType}
                        </td>
                        <td className="py-3 px-3 text-right font-medium tabular-nums text-[var(--text-primary)] whitespace-nowrap">
                          {formatCurrency(order.total, settings.currency)}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="py-3 px-3 tabular-nums text-[12.5px] text-[var(--text-secondary)] whitespace-nowrap">
                          {formatDisplayTime(order.orderTime, settings.timeFormat)}
                        </td>
                        <td className="py-3 pl-3 pr-5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrderId(order.id);
                            }}
                            className="text-[12.5px] font-medium text-[var(--brand-primary)] hover:underline cursor-pointer"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Operational Activity Feed */}
        <section className="xl:col-span-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">
                Operational Activity
              </h3>
              <p className="text-[12.5px] text-[var(--text-secondary)]">
                Recent shift updates across the floor
              </p>
            </div>
            <Activity className="h-4 w-4 text-[var(--text-muted)]" />
          </div>

          <ul className="space-y-3.5">
            {activities.slice(0, 6).map((act) => (
              <li
                key={act.id}
                className="flex items-start gap-3 rounded-lg border border-[var(--border-color)]/70 bg-[var(--bg-elevated)] p-3"
              >
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[var(--border-color)] bg-[var(--bg-surface)]">
                  {ACTIVITY_ICONS[act.type]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[13px] font-medium text-[var(--text-primary)]">
                      {act.title}
                    </p>
                    <span className="text-[11.5px] text-[var(--text-muted)] shrink-0">
                      {act.timeLabel}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12.5px] text-[var(--text-secondary)] truncate">
                    {act.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Quick Action Modals */}
      <MenuItemModal open={addMenuOpen} onClose={() => setAddMenuOpen(false)} />
      <OrderDetailDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrderId(null)}
      />
    </div>
  );
}
