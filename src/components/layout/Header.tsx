import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  ChevronDown,
  HelpCircle,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useToast } from '../../context/ToastContext';

interface HeaderProps {
  onOpenMobileNav: () => void;
  onOpenSearch: () => void;
  onOpenHelp: () => void;
  onOpenProfile: () => void;
  onOpenAllNotifications: () => void;
}

const ROUTE_TITLES: Record<string, { title: string; breadcrumb: string }> = {
  '/dashboard': { title: 'Overview', breadcrumb: 'Operations / Dashboard' },
  '/dashboard/orders': { title: 'Orders', breadcrumb: 'Operations / Orders' },
  '/dashboard/menu': { title: 'Menu Management', breadcrumb: 'Operations / Menu' },
  '/dashboard/analytics': { title: 'Sales & Analytics', breadcrumb: 'Insights / Sales' },
  '/dashboard/staff': { title: 'Staff Management', breadcrumb: 'Team / Staff' },
  '/dashboard/settings': { title: 'Settings', breadcrumb: 'Workspace / Settings' },
};

export function Header({
  onOpenMobileNav,
  onOpenSearch,
  onOpenHelp,
  onOpenProfile,
  onOpenAllNotifications,
}: HeaderProps) {
  const {
    restaurants,
    activeRestaurant,
    switchRestaurant,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useRestaurant();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [restaurantOpen, setRestaurantOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const restRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const pageMeta = ROUTE_TITLES[location.pathname] ?? ROUTE_TITLES['/dashboard'];
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (restRef.current && !restRef.current.contains(target)) setRestaurantOpen(false);
      if (notifRef.current && !notifRef.current.contains(target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(target)) setProfileOpen(false);
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setRestaurantOpen(false);
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const handleSignOut = () => {
    setProfileOpen(false);
    showToast({
      title: 'Signed out of demo workspace',
      description: 'Returned to the Mise product overview.',
      variant: 'info',
    });
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-[var(--border-color)] bg-[var(--bg-surface)]/95 backdrop-blur-sm px-4 sm:px-6 lg:px-8">
      <div className="flex h-full items-center justify-between gap-3">
        {/* Left: Mobile drawer button + Page Title & Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileNav}
            aria-label="Open navigation menu"
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer shrink-0"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="min-w-0">
            <p className="hidden sm:block text-[11.5px] font-medium text-[var(--text-muted)] leading-none mb-1">
              {pageMeta.breadcrumb}
            </p>
            <h1 className="truncate text-[17px] sm:text-[18px] font-semibold tracking-tight text-[var(--text-primary)] leading-none">
              {pageMeta.title}
            </h1>
          </div>
        </div>

        {/* Right: Restaurant selector, Search, Notification bell, Profile menu */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Restaurant selector */}
          <div className="relative" ref={restRef}>
            <button
              type="button"
              onClick={() => {
                setRestaurantOpen((o) => !o);
                setNotifOpen(false);
                setProfileOpen(false);
              }}
              aria-haspopup="listbox"
              aria-expanded={restaurantOpen}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] px-2.5 sm:px-3 text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-semibold text-white shrink-0"
                style={{ backgroundColor: activeRestaurant.accentColor }}
              >
                {activeRestaurant.initials}
              </span>
              <span className="hidden sm:inline max-w-[140px] truncate">
                {activeRestaurant.name}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" />
            </button>

            {restaurantOpen && (
              <div
                role="listbox"
                aria-label="Select restaurant"
                className="absolute right-0 mt-2 w-64 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-1.5 shadow-[var(--shadow-md)] animate-modal-in z-40"
              >
                <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Switch Restaurant
                </p>
                {restaurants.map((rest) => {
                  const selected = rest.id === activeRestaurant.id;
                  return (
                    <button
                      key={rest.id}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => {
                        void switchRestaurant(rest.id);
                        setRestaurantOpen(false);
                      }}
                      className={`flex w-full items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors cursor-pointer ${
                        selected
                          ? 'bg-[var(--bg-subtle-green)] text-[var(--brand-primary)]'
                          : 'hover:bg-[var(--bg-hover)] text-[var(--text-primary)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold text-white"
                          style={{ backgroundColor: rest.accentColor }}
                        >
                          {rest.initials}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[13.5px] font-medium">{rest.name}</p>
                          <p className="truncate text-[11.5px] text-[var(--text-secondary)]">
                            {rest.tagline}
                          </p>
                        </div>
                      </div>
                      {selected && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Search button */}
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search workspace"
            title="Search workspace (Ctrl+K)"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Notifications dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setNotifOpen((o) => !o);
                setRestaurantOpen(false);
                setProfileOpen(false);
              }}
              aria-label={`Notifications (${unreadCount} unread)`}
              aria-expanded={notifOpen}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--warm-accent)] px-1 text-[10px] font-semibold tabular-nums text-white ring-2 ring-[var(--bg-surface)]">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-[320px] sm:w-[350px] rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-[var(--shadow-md)] animate-modal-in z-40 overflow-hidden">
                <div className="flex items-center justify-between border-b border-[var(--border-color)] px-4 py-3">
                  <div>
                    <h3 className="text-[13.5px] font-semibold text-[var(--text-primary)]">
                      Notifications
                    </h3>
                    <p className="text-[11.5px] text-[var(--text-secondary)]">
                      {unreadCount} unread for {activeRestaurant.name}
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-[12px] font-medium text-[var(--brand-primary)] hover:underline cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <ul className="max-h-[290px] divide-y divide-[var(--border-color)] overflow-y-auto">
                  {notifications.slice(0, 5).map((notif) => (
                    <li
                      key={notif.id}
                      className={`px-4 py-3 transition-colors ${
                        notif.read ? 'opacity-75' : 'bg-[var(--bg-elevated)]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[13px] font-medium text-[var(--text-primary)] leading-snug">
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--brand-primary)]" />
                        )}
                      </div>
                      <p className="mt-0.5 text-[12px] text-[var(--text-secondary)] leading-snug">
                        {notif.message}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between text-[11.5px]">
                        <span className="text-[var(--text-muted)]">{notif.timeLabel}</span>
                        {!notif.read && (
                          <button
                            type="button"
                            onClick={() => markNotificationRead(notif.id)}
                            className="font-medium text-[var(--brand-primary)] hover:underline cursor-pointer"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-[var(--border-color)] bg-[var(--bg-elevated)] px-4 py-2.5 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setNotifOpen(false);
                      onOpenAllNotifications();
                    }}
                    className="text-[12.5px] font-medium text-[var(--brand-primary)] hover:underline cursor-pointer"
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setProfileOpen((o) => !o);
                setNotifOpen(false);
                setRestaurantOpen(false);
              }}
              aria-label="Account menu"
              aria-expanded={profileOpen}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] pl-1.5 pr-2.5 hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand-primary)] text-[11px] font-semibold text-white">
                AR
              </span>
              <span className="hidden lg:inline text-[13px] font-medium text-[var(--text-primary)]">
                Alex
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-1.5 shadow-[var(--shadow-md)] animate-modal-in z-40">
                <div className="border-b border-[var(--border-color)] px-3 py-2.5 mb-1">
                  <p className="text-[13.5px] font-semibold text-[var(--text-primary)]">
                    Alex Rivera
                  </p>
                  <p className="text-[12px] text-[var(--text-secondary)] truncate">
                    Owner · {activeRestaurant.name}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onOpenProfile();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer"
                >
                  <User className="h-4 w-4 text-[var(--text-muted)]" />
                  My Profile
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate('/dashboard/settings');
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer"
                >
                  <Settings className="h-4 w-4 text-[var(--text-muted)]" />
                  Restaurant Settings
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onOpenHelp();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer"
                >
                  <HelpCircle className="h-4 w-4 text-[var(--text-muted)]" />
                  Help & Support
                </button>

                <div className="my-1 border-t border-[var(--border-color)]" />

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] text-[var(--status-danger)] hover:bg-[var(--status-danger-bg)] cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
