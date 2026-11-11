import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, Search, Users, UtensilsCrossed } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { formatCurrency } from '../../utils/format';
import { OrderStatusBadge } from '../ui/Badge';
import { Modal } from '../ui/Modal';

interface QuickSearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function QuickSearchModal({ open, onClose }: QuickSearchModalProps) {
  const { orders, menuItems, staff, settings, activeRestaurant } = useRestaurant();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery('');
      window.setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matchedOrders = orders
      .filter(
        (o) =>
          !q ||
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.orderType.toLowerCase().includes(q),
      )
      .slice(0, 4);

    const matchedMenu = menuItems
      .filter(
        (m) =>
          !q ||
          m.name.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q),
      )
      .slice(0, 4);

    const matchedStaff = staff
      .filter(
        (s) =>
          !q ||
          s.fullName.toLowerCase().includes(q) ||
          s.role.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q),
      )
      .slice(0, 3);

    return { matchedOrders, matchedMenu, matchedStaff };
  }, [query, orders, menuItems, staff]);

  const hasAny =
    results.matchedOrders.length > 0 ||
    results.matchedMenu.length > 0 ||
    results.matchedStaff.length > 0;

  const goTo = (path: string, state?: Record<string, unknown>) => {
    onClose();
    navigate(path, { state });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Search Workspace"
      subtitle={`Search across ${activeRestaurant.name} orders, dishes, and team`}
      maxWidthClass="max-w-xl"
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search #ORD-1048, Truffle Pasta, Maya Lin..."
            className="h-10 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] pl-9 pr-3 text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)] focus:outline-none"
          />
        </div>

        {!hasAny ? (
          <div className="py-10 text-center text-[13.5px] text-[var(--text-secondary)]">
            No matching orders, dishes, or staff members found for &ldquo;{query}&rdquo;.
          </div>
        ) : (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
            {results.matchedOrders.length > 0 && (
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  <Receipt className="h-3.5 w-3.5" /> Orders
                </p>
                <div className="space-y-1">
                  {results.matchedOrders.map((order) => (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => goTo('/dashboard/orders', { highlightOrderId: order.id })}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                    >
                      <div className="min-w-0">
                        <span className="font-medium tabular-nums text-[13.5px] text-[var(--text-primary)]">
                          {order.orderNumber}
                        </span>
                        <span className="mx-2 text-[var(--text-muted)]">·</span>
                        <span className="text-[13.5px] text-[var(--text-secondary)]">
                          {order.customerName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="text-[13px] font-medium tabular-nums text-[var(--text-primary)]">
                          {formatCurrency(order.total, settings.currency)}
                        </span>
                        <OrderStatusBadge status={order.status} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {results.matchedMenu.length > 0 && (
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  <UtensilsCrossed className="h-3.5 w-3.5" /> Menu Dishes
                </p>
                <div className="space-y-1">
                  {results.matchedMenu.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => goTo('/dashboard/menu', { searchQuery: item.name })}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-7 w-7 rounded-md object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-[13.5px] font-medium text-[var(--text-primary)]">
                            {item.name}
                          </p>
                          <p className="text-[12px] text-[var(--text-secondary)]">
                            {item.category}
                          </p>
                        </div>
                      </div>
                      <span className="text-[13px] font-medium tabular-nums text-[var(--text-primary)] shrink-0">
                        {formatCurrency(item.price, settings.currency)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {results.matchedStaff.length > 0 && (
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  <Users className="h-3.5 w-3.5" /> Staff
                </p>
                <div className="space-y-1">
                  {results.matchedStaff.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => goTo('/dashboard/staff', { searchQuery: member.fullName })}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--bg-subtle-green)] text-[11.5px] font-semibold text-[var(--brand-primary)] shrink-0">
                          {member.avatarInitials}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[13.5px] font-medium text-[var(--text-primary)]">
                            {member.fullName}
                          </p>
                          <p className="text-[12px] text-[var(--text-secondary)]">
                            {member.role} · {member.department}
                          </p>
                        </div>
                      </div>
                      <span className="text-[12px] text-[var(--text-secondary)]">
                        {member.status}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
