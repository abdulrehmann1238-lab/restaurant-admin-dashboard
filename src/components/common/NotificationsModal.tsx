import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Clock, Receipt, Users, UtensilsCrossed } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import type { NotificationType } from '../../types';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface NotificationsModalProps {
  open: boolean;
  onClose: () => void;
}

const TYPE_ICONS: Record<NotificationType, React.ReactNode> = {
  order: <Receipt className="h-4 w-4 text-[var(--warm-accent)]" />,
  ready: <CheckCheck className="h-4 w-4 text-[var(--status-success)]" />,
  menu: <UtensilsCrossed className="h-4 w-4 text-[var(--brand-primary)]" />,
  staff: <Users className="h-4 w-4 text-[var(--status-info)]" />,
  system: <Bell className="h-4 w-4 text-[var(--text-secondary)]" />,
};

export function NotificationsModal({ open, onClose }: NotificationsModalProps) {
  const { notifications, markNotificationRead, markAllNotificationsRead, activeRestaurant } =
    useRestaurant();
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Notifications"
      subtitle={`${activeRestaurant.name} · ${unreadCount} unread`}
      maxWidthClass="max-w-lg"
      footer={
        <div className="flex w-full items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={unreadCount === 0}
            onClick={markAllNotificationsRead}
          >
            Mark all as read
          </Button>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      {notifications.length === 0 ? (
        <div className="py-10 text-center text-[13.5px] text-[var(--text-secondary)]">
          All caught up. No notifications for {activeRestaurant.name}.
        </div>
      ) : (
        <ul className="divide-y divide-[var(--border-color)] -mx-2">
          {notifications.map((notif) => (
            <li
              key={notif.id}
              className={`flex items-start gap-3 rounded-xl px-3 py-3 transition-colors ${
                notif.read ? 'opacity-75' : 'bg-[var(--bg-elevated)]'
              }`}
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)]">
                {TYPE_ICONS[notif.type]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13.5px] font-medium text-[var(--text-primary)]">
                    {notif.title}
                  </p>
                  {!notif.read && (
                    <span
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--brand-primary)]"
                      aria-label="Unread"
                    />
                  )}
                </div>
                <p className="mt-0.5 text-[12.5px] text-[var(--text-secondary)]">
                  {notif.message}
                </p>
                <div className="mt-2 flex items-center gap-3 text-[12px]">
                  <span className="inline-flex items-center gap-1 text-[var(--text-muted)]">
                    <Clock className="h-3 w-3" /> {notif.timeLabel}
                  </span>
                  {!notif.read && (
                    <button
                      type="button"
                      onClick={() => markNotificationRead(notif.id)}
                      className="font-medium text-[var(--brand-primary)] hover:underline cursor-pointer"
                    >
                      Mark as read
                    </button>
                  )}
                  {notif.linkTo && (
                    <button
                      type="button"
                      onClick={() => {
                        markNotificationRead(notif.id);
                        onClose();
                        navigate(notif.linkTo!);
                      }}
                      className="font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline cursor-pointer"
                    >
                      Open page →
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
