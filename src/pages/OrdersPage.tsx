import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import { OrderDetailDrawer } from '../components/common/OrderDetailDrawer';
import { OrderStatusBadge, PaymentStatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useRestaurant } from '../context/RestaurantContext';
import type { Order, OrderStatus, OrderType, PaymentStatus } from '../types';
import { formatCurrency, formatDateString, formatDisplayTime } from '../utils/format';

const PAGE_SIZE = 8;

type DateFilterOption = 'all' | 'today' | 'yesterday' | '7d';

export function OrdersPage() {
  const { orders, settings, changeOrderStatus } = useRestaurant();
  const location = useLocation();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | OrderType>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | PaymentStatus>('all');
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('all');
  const [page, setPage] = useState(1);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Order | null>(null);

  useEffect(() => {
    const state = location.state as { highlightOrderId?: string } | null;
    if (state?.highlightOrderId) {
      setSelectedOrderId(state.highlightOrderId);
    }
  }, [location.state]);

  const counts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      preparing: orders.filter((o) => o.status === 'preparing').length,
      ready: orders.filter((o) => o.status === 'ready').length,
      completed: orders.filter((o) => o.status === 'completed').length,
    };
  }, [orders]);

  const todayIso = new Date().toISOString().slice(0, 10);
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayIso = yesterdayDate.toISOString().slice(0, 10);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysIso = sevenDaysAgo.toISOString().slice(0, 10);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (typeFilter !== 'all' && o.orderType !== typeFilter) return false;
      if (paymentFilter !== 'all' && o.paymentStatus !== paymentFilter) return false;

      if (dateFilter === 'today' && o.isoDate !== todayIso) return false;
      if (dateFilter === 'yesterday' && o.isoDate !== yesterdayIso) return false;
      if (dateFilter === '7d' && o.isoDate < sevenDaysIso) return false;

      if (
        q &&
        !o.orderNumber.toLowerCase().includes(q) &&
        !o.customerName.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [
    orders,
    search,
    statusFilter,
    typeFilter,
    paymentFilter,
    dateFilter,
    todayIso,
    yesterdayIso,
    sevenDaysIso,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedOrders = filteredOrders.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const hasActiveFilters =
    search !== '' ||
    statusFilter !== 'all' ||
    typeFilter !== 'all' ||
    paymentFilter !== 'all' ||
    dateFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setTypeFilter('all');
    setPaymentFilter('all');
    setDateFilter('all');
    setPage(1);
  };

  const handleQuickAction = async (
    e: React.MouseEvent,
    orderId: string,
    nextStatus: OrderStatus,
  ) => {
    e.stopPropagation();
    setBusyOrderId(orderId);
    try {
      await changeOrderStatus(orderId, nextStatus);
    } finally {
      setBusyOrderId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectTarget) return;
    setBusyOrderId(rejectTarget.id);
    try {
      await changeOrderStatus(rejectTarget.id, 'rejected');
      setRejectTarget(null);
    } finally {
      setBusyOrderId(null);
    }
  };

  const summaryCards: Array<{
    key: 'all' | OrderStatus;
    label: string;
    count: number;
    accent: string;
  }> = [
    { key: 'all', label: 'All Orders', count: counts.all, accent: 'text-[var(--text-primary)]' },
    { key: 'pending', label: 'Pending', count: counts.pending, accent: 'text-[var(--status-warning)]' },
    { key: 'preparing', label: 'Preparing', count: counts.preparing, accent: 'text-[var(--warm-accent)]' },
    { key: 'ready', label: 'Ready', count: counts.ready, accent: 'text-[var(--status-success)]' },
    { key: 'completed', label: 'Completed', count: counts.completed, accent: 'text-[var(--brand-primary)]' },
  ];

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );

  const renderInlineActions = (order: Order) => {
    const isBusy = busyOrderId === order.id;
    return (
      <div className="flex items-center justify-end gap-1.5">
        {order.status === 'pending' && (
          <>
            <Button
              size="sm"
              loading={isBusy}
              onClick={(e) => handleQuickAction(e, order.id, 'accepted')}
              icon={<Check className="h-3.5 w-3.5" />}
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={isBusy}
              onClick={(e) => {
                e.stopPropagation();
                setRejectTarget(order);
              }}
              aria-label={`Reject ${order.orderNumber}`}
              className="text-[var(--status-danger)] hover:bg-[var(--status-danger-bg)] px-2"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
        {order.status === 'accepted' && (
          <Button
            size="sm"
            variant="warm"
            loading={isBusy}
            onClick={(e) => handleQuickAction(e, order.id, 'preparing')}
          >
            Preparing
          </Button>
        )}
        {order.status === 'preparing' && (
          <Button
            size="sm"
            loading={isBusy}
            onClick={(e) => handleQuickAction(e, order.id, 'ready')}
          >
            Mark Ready
          </Button>
        )}
        {order.status === 'ready' && (
          <Button
            size="sm"
            variant="secondary"
            loading={isBusy}
            onClick={(e) => handleQuickAction(e, order.id, 'completed')}
          >
            Complete
          </Button>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedOrderId(order.id);
          }}
          aria-label={`View details for ${order.orderNumber}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div>
        <h2 className="text-[24px] sm:text-[26px] font-semibold tracking-tight text-[var(--text-primary)]">
          Orders
        </h2>
        <p className="mt-1 text-[14px] text-[var(--text-secondary)]">
          Review, manage, and track every restaurant order.
        </p>
      </div>

      {/* Order Summary Filter Cards */}
      <section aria-label="Order summary by status" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {summaryCards.map((card) => {
          const active = statusFilter === card.key;
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => {
                setStatusFilter(card.key);
                setPage(1);
              }}
              className={`rounded-xl border p-4 text-left transition-all cursor-pointer ${
                active
                  ? 'border-[var(--brand-primary)] bg-[var(--bg-subtle-green)]/60 shadow-[var(--shadow-xs)]'
                  : 'border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)]'
              }`}
            >
              <p className="text-[12.5px] font-medium text-[var(--text-secondary)]">
                {card.label}
              </p>
              <p className={`mt-1.5 text-[24px] font-semibold tabular-nums ${card.accent}`}>
                {card.count}
              </p>
            </button>
          );
        })}
      </section>

      {/* Search & Filters Bar */}
      <section className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by order ID or customer name..."
              aria-label="Search orders by ID or customer name"
              className="h-9 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] pl-9 pr-3 text-[13.5px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              aria-label="Filter by order status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as 'all' | OrderStatus);
                setPage(1);
              }}
              className="h-9 rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] px-3 text-[13px] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              aria-label="Filter by order type"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as 'all' | OrderType);
                setPage(1);
              }}
              className="h-9 rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] px-3 text-[13px] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none cursor-pointer"
            >
              <option value="all">All Order Types</option>
              <option value="Dine-in">Dine-in</option>
              <option value="Pickup">Pickup</option>
              <option value="Delivery">Delivery</option>
            </select>

            <select
              aria-label="Filter by payment status"
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value as 'all' | PaymentStatus);
                setPage(1);
              }}
              className="h-9 rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] px-3 text-[13px] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none cursor-pointer"
            >
              <option value="all">All Payments</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Refunded">Refunded</option>
            </select>

            <select
              aria-label="Filter by date range"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value as DateFilterOption);
                setPage(1);
              }}
              className="h-9 rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] px-3 text-[13px] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none cursor-pointer"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7d">Last 7 Days</option>
            </select>

            {hasActiveFilters && (
              <Button
                size="sm"
                variant="ghost"
                onClick={clearFilters}
                icon={<RotateCcw className="h-3.5 w-3.5" />}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Desktop / Tablet Table */}
      <section className="hidden md:block rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-elevated)] text-[11.5px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                <th className="py-3.5 pl-5 pr-3">Order ID</th>
                <th className="py-3.5 px-3">Customer</th>
                <th className="py-3.5 px-3">Order Items</th>
                <th className="py-3.5 px-3">Order Type</th>
                <th className="py-3.5 px-3">Order Time</th>
                <th className="py-3.5 px-3 text-right">Total</th>
                <th className="py-3.5 px-3">Payment</th>
                <th className="py-3.5 px-3">Order Status</th>
                <th className="py-3.5 pl-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-[13.5px]">
              {pagedOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-14 text-center text-[14px] text-[var(--text-secondary)]"
                  >
                    No orders match your current filters.{' '}
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="font-medium text-[var(--brand-primary)] hover:underline cursor-pointer"
                      >
                        Reset filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                pagedOrders.map((order) => {
                  const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);
                  const summaryNames = order.items
                    .map((i) => `${i.quantity}× ${i.name}`)
                    .join(', ');
                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className="hover:bg-[var(--bg-hover)]/70 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 pl-5 pr-3 font-semibold tabular-nums text-[var(--text-primary)] whitespace-nowrap">
                        {order.orderNumber}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <p className="font-medium text-[var(--text-primary)]">
                          {order.customerName}
                        </p>
                        <p className="text-[12px] text-[var(--text-secondary)]">
                          {order.tableOrAddress}
                        </p>
                      </td>
                      <td className="py-3.5 px-3 max-w-[230px]">
                        <p className="truncate text-[var(--text-primary)]" title={summaryNames}>
                          {summaryNames}
                        </p>
                        <p className="text-[12px] text-[var(--text-secondary)] tabular-nums">
                          {totalQty} {totalQty === 1 ? 'item' : 'items'}
                        </p>
                      </td>
                      <td className="py-3.5 px-3 text-[var(--text-secondary)] whitespace-nowrap">
                        {order.orderType}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <p className="tabular-nums text-[var(--text-primary)]">
                          {formatDisplayTime(order.orderTime, settings.timeFormat)}
                        </p>
                        <p className="text-[11.5px] text-[var(--text-muted)]">
                          {formatDateString(order.isoDate, settings.dateFormat)}
                        </p>
                      </td>
                      <td className="py-3.5 px-3 text-right font-semibold tabular-nums text-[var(--text-primary)] whitespace-nowrap">
                        {formatCurrency(order.total, settings.currency)}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <PaymentStatusBadge status={order.paymentStatus} />
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="py-3.5 pl-3 pr-5 text-right whitespace-nowrap">
                        {renderInlineActions(order)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Mobile Cards Layout */}
      <section className="md:hidden space-y-3">
        {pagedOrders.length === 0 ? (
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-8 text-center text-[13.5px] text-[var(--text-secondary)]">
            No orders match your current filters.
          </div>
        ) : (
          pagedOrders.map((order) => {
            const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);
            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrderId(order.id)}
                className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4 space-y-3 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold tabular-nums text-[var(--text-primary)]">
                        {order.orderNumber}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="mt-0.5 text-[13.5px] font-medium text-[var(--text-primary)]">
                      {order.customerName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold tabular-nums text-[var(--text-primary)]">
                      {formatCurrency(order.total, settings.currency)}
                    </p>
                    <p className="text-[12px] text-[var(--text-secondary)]">
                      {order.orderType} · {totalQty} items
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
                  <div className="flex items-center gap-2">
                    <PaymentStatusBadge status={order.paymentStatus} />
                    <span className="text-[12px] tabular-nums text-[var(--text-muted)]">
                      {formatDisplayTime(order.orderTime, settings.timeFormat)}
                    </span>
                  </div>
                  {renderInlineActions(order)}
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Pagination */}
      {filteredOrders.length > PAGE_SIZE && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] px-4 py-3 text-[13px]">
          <p className="text-[var(--text-secondary)] tabular-nums">
            Showing {(safePage - 1) * PAGE_SIZE + 1}–
            {Math.min(safePage * PAGE_SIZE, filteredOrders.length)} of{' '}
            {filteredOrders.length} orders
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              icon={<ChevronLeft className="h-3.5 w-3.5" />}
            >
              Previous
            </Button>
            <span className="px-2 tabular-nums font-medium text-[var(--text-primary)]">
              Page {safePage} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="secondary"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Order Detail Drawer */}
      <OrderDetailDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrderId(null)}
      />

      {/* Reject Confirmation */}
      <ConfirmDialog
        open={rejectTarget !== null}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleConfirmReject}
        loading={busyOrderId !== null}
        title={`Reject ${rejectTarget?.orderNumber ?? 'order'}?`}
        message={
          rejectTarget
            ? `Are you sure you want to reject ${rejectTarget.orderNumber} for ${rejectTarget.customerName}? Paid orders will automatically be marked as refunded.`
            : ''
        }
        confirmLabel="Reject Order"
      />
    </div>
  );
}

