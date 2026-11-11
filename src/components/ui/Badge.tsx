import type { OrderStatus, PaymentStatus, StaffRole, StaffStatus } from '../../types';

const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; classes: string; dotColor: string }
> = {
  pending: {
    label: 'Pending',
    classes: 'bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning)]/20',
    dotColor: 'bg-[var(--status-warning)]',
  },
  accepted: {
    label: 'Accepted',
    classes: 'bg-[var(--status-info-bg)] text-[var(--status-info)] border-[var(--status-info)]/20',
    dotColor: 'bg-[var(--status-info)]',
  },
  preparing: {
    label: 'Preparing',
    classes: 'bg-[var(--bg-warm)] text-[var(--warm-accent)] border-[var(--warm-accent)]/25',
    dotColor: 'bg-[var(--warm-accent)]',
  },
  ready: {
    label: 'Ready',
    classes: 'bg-[var(--status-success-bg)] text-[var(--status-success)] border-[var(--status-success)]/20',
    dotColor: 'bg-[var(--status-success)]',
  },
  completed: {
    label: 'Completed',
    classes: 'bg-[var(--bg-hover)] text-[var(--text-secondary)] border-[var(--border-color)]',
    dotColor: 'bg-[var(--text-muted)]',
  },
  rejected: {
    label: 'Rejected',
    classes: 'bg-[var(--status-danger-bg)] text-[var(--status-danger)] border-[var(--status-danger)]/20',
    dotColor: 'bg-[var(--status-danger)]',
  },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const cfg = ORDER_STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12px] font-medium leading-tight ${cfg.classes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotColor}`} aria-hidden="true" />
      {cfg.label}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const styles: Record<PaymentStatus, string> = {
    Paid: 'bg-[var(--status-success-bg)] text-[var(--status-success)]',
    Pending: 'bg-[var(--status-warning-bg)] text-[var(--status-warning)]',
    Refunded: 'bg-[var(--status-danger-bg)] text-[var(--status-danger)]',
  };
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11.5px] font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export function StaffStatusBadge({ status }: { status: StaffStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-medium ${
        status === 'Active'
          ? 'bg-[var(--status-success-bg)] text-[var(--status-success)]'
          : 'bg-[var(--bg-hover)] text-[var(--text-secondary)]'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === 'Active' ? 'bg-[var(--status-success)]' : 'bg-[var(--text-muted)]'
        }`}
        aria-hidden="true"
      />
      {status}
    </span>
  );
}

export function RoleBadge({ role }: { role: StaffRole }) {
  const map: Record<StaffRole, string> = {
    Owner: 'bg-[var(--bg-subtle-green)] text-[var(--brand-primary)]',
    Manager: 'bg-[var(--bg-warm)] text-[var(--warm-accent)]',
    Cashier: 'bg-[var(--status-info-bg)] text-[var(--status-info)]',
    'Kitchen Staff': 'bg-[var(--bg-hover)] text-[var(--text-primary)]',
    Waiter: 'bg-[var(--bg-hover)] text-[var(--text-secondary)]',
  };
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-medium ${map[role]}`}
    >
      {role}
    </span>
  );
}
