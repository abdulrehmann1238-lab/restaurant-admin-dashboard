import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  Sparkles,
  User,
  X,
  XCircle,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import type { Order, OrderStatus } from '../../types';
import { formatCurrency, formatDateString, formatDisplayTime } from '../../utils/format';
import { OrderStatusBadge, PaymentStatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface OrderDetailDrawerProps {
  order: Order | null;
  onClose: () => void;
}

export function OrderDetailDrawer({ order, onClose }: OrderDetailDrawerProps) {
  const { settings, changeOrderStatus } = useRestaurant();
  const [updatingStatus, setUpdatingStatus] = useState<OrderStatus | null>(null);
  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false);

  useEffect(() => {
    if (!order) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !confirmRejectOpen) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [order, confirmRejectOpen, onClose]);

  if (!order) return null;

  const handleAction = async (next: OrderStatus) => {
    setUpdatingStatus(next);
    try {
      await changeOrderStatus(order.id, next);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleConfirmReject = async () => {
    setUpdatingStatus('rejected');
    try {
      await changeOrderStatus(order.id, 'rejected');
      setConfirmRejectOpen(false);
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex justify-end"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-drawer-title"
      >
        <div
          className="fixed inset-0 bg-[#1B1F1C]/40 backdrop-blur-[1px] transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        <aside className="relative z-10 flex h-full w-full max-w-lg flex-col border-l border-[var(--border-color)] bg-[var(--bg-surface)] shadow-[var(--shadow-lg)] animate-drawer-in">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-[var(--border-color)] px-5 py-4 sm:px-6">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2
                  id="order-drawer-title"
                  className="text-[18px] font-semibold tabular-nums text-[var(--text-primary)]"
                >
                  {order.orderNumber}
                </h2>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
                {formatDateString(order.isoDate, settings.dateFormat)} at{' '}
                {formatDisplayTime(order.orderTime, settings.timeFormat)} · {order.orderType}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close order details"
              className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 space-y-5">
            {/* Quick Primary Actions Bar */}
            {order.status !== 'completed' && order.status !== 'rejected' && (
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] p-3.5">
                <p className="text-[11.5px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2.5">
                  Next Workflow Action
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {order.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        loading={updatingStatus === 'accepted'}
                        onClick={() => handleAction('accepted')}
                        icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                      >
                        Accept Order
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={updatingStatus !== null}
                        onClick={() => setConfirmRejectOpen(true)}
                        icon={<XCircle className="h-3.5 w-3.5" />}
                      >
                        Reject Order
                      </Button>
                    </>
                  )}
                  {order.status === 'accepted' && (
                    <Button
                      size="sm"
                      loading={updatingStatus === 'preparing'}
                      onClick={() => handleAction('preparing')}
                    >
                      Mark as Preparing
                    </Button>
                  )}
                  {order.status === 'preparing' && (
                    <Button
                      size="sm"
                      loading={updatingStatus === 'ready'}
                      onClick={() => handleAction('ready')}
                    >
                      Mark as Ready
                    </Button>
                  )}
                  {order.status === 'ready' && (
                    <Button
                      size="sm"
                      loading={updatingStatus === 'completed'}
                      onClick={() => handleAction('completed')}
                    >
                      Mark as Completed
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Customer & Fulfillment */}
            <section className="rounded-xl border border-[var(--border-color)] p-4 space-y-3">
              <h3 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                Customer & Fulfillment
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13.5px]">
                <div className="flex items-start gap-2.5">
                  <User className="h-4 w-4 text-[var(--text-muted)] mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{order.customerName}</p>
                    <p className="text-[12.5px] text-[var(--text-secondary)]">{order.orderType}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CreditCard className="h-4 w-4 text-[var(--text-muted)] mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{order.paymentMethod}</p>
                    <div className="mt-0.5">
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
                  <span className="text-[var(--text-secondary)] tabular-nums">
                    {order.customerPhone}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
                  <span className="text-[var(--text-secondary)] truncate">
                    {order.customerEmail}
                  </span>
                </div>
                {order.tableOrAddress && (
                  <div className="sm:col-span-2 flex items-start gap-2.5 pt-1 border-t border-[var(--border-color)]">
                    <MapPin className="h-4 w-4 text-[var(--text-muted)] mt-0.5 shrink-0" />
                    <span className="text-[var(--text-primary)]">{order.tableOrAddress}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Special Instructions */}
            {order.specialInstructions && (
              <div className="rounded-xl border border-[var(--warm-accent)]/30 bg-[var(--bg-warm)] px-4 py-3">
                <div className="flex items-center gap-2 text-[12.5px] font-semibold text-[var(--warm-accent)]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Special Kitchen Instructions
                </div>
                <p className="mt-1 text-[13.5px] text-[var(--text-primary)]">
                  {order.specialInstructions}
                </p>
              </div>
            )}

            {/* Ordered Items */}
            <section className="rounded-xl border border-[var(--border-color)] overflow-hidden">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-elevated)] px-4 py-2.5">
                <h3 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Ordered Items ({order.items.reduce((acc, i) => acc + i.quantity, 0)})
                </h3>
              </div>
              <ul className="divide-y divide-[var(--border-color)]">
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 text-[13.5px]"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--text-primary)] truncate">
                        <span className="inline-block w-6 tabular-nums text-[var(--brand-primary)] font-semibold">
                          {item.quantity}×
                        </span>
                        {item.name}
                      </p>
                      <p className="pl-6 text-[12px] text-[var(--text-secondary)] tabular-nums">
                        {formatCurrency(item.unitPrice, settings.currency)} each
                      </p>
                    </div>
                    <span className="font-medium tabular-nums text-[var(--text-primary)] shrink-0">
                      {formatCurrency(item.unitPrice * item.quantity, settings.currency)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-[var(--border-color)] bg-[var(--bg-elevated)] px-4 py-3 space-y-1.5 text-[13.5px]">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Subtotal</span>
                  <span className="tabular-nums">
                    {formatCurrency(order.subtotal, settings.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Tax</span>
                  <span className="tabular-nums">
                    {formatCurrency(order.tax, settings.currency)}
                  </span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-[var(--border-color)] text-[15px] font-semibold text-[var(--text-primary)]">
                  <span>Total</span>
                  <span className="tabular-nums">
                    {formatCurrency(order.total, settings.currency)}
                  </span>
                </div>
              </div>
            </section>

            {/* Timeline */}
            <section className="rounded-xl border border-[var(--border-color)] p-4">
              <h3 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-3.5">
                <Clock className="h-3.5 w-3.5" />
                Order Timeline
              </h3>
              <ol className="relative ml-2 border-l border-[var(--border-color)] space-y-4 pl-5">
                {order.timeline.map((event, idx) => {
                  const isLast = idx === order.timeline.length - 1;
                  return (
                    <li key={`${event.status}-${idx}`} className="relative">
                      <span
                        className={`absolute -left-[25px] top-1 flex h-2.5 w-2.5 rounded-full ring-4 ring-[var(--bg-surface)] ${
                          event.status === 'rejected'
                            ? 'bg-[var(--status-danger)]'
                            : isLast
                              ? 'bg-[var(--brand-primary)]'
                              : 'bg-[var(--text-muted)]'
                        }`}
                      />
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-[13.5px] font-medium text-[var(--text-primary)]">
                          {event.label}
                        </p>
                        <span className="text-[12px] tabular-nums text-[var(--text-secondary)] shrink-0">
                          {event.timestamp}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          </div>

          <div className="border-t border-[var(--border-color)] bg-[var(--bg-elevated)] px-5 py-3.5 sm:px-6 flex justify-end">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmRejectOpen}
        onClose={() => setConfirmRejectOpen(false)}
        onConfirm={handleConfirmReject}
        loading={updatingStatus === 'rejected'}
        title={`Reject ${order.orderNumber}?`}
        message={`Rejecting this order for ${order.customerName} will cancel preparation and mark the payment as refunded if already paid. This action cannot be undone.`}
        confirmLabel="Reject Order"
      />
    </>
  );
}
