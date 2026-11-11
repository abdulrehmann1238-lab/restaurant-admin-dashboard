import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  HelpCircle,
  LayoutDashboard,
  Settings,
  Store,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { BrandLogo } from '../ui/BrandLogo';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenHelp: () => void;
  onOpenProfile: () => void;
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  onOpenHelp,
  onOpenProfile,
}: SidebarProps) {
  const { activeRestaurant, orders } = useRestaurant();

  const activeOrdersCount = orders.filter(
    (o) => o.status === 'pending' || o.status === 'accepted' || o.status === 'preparing',
  ).length;

  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
    {
      to: '/dashboard/orders',
      label: 'Orders',
      icon: ClipboardList,
      badge: activeOrdersCount > 0 ? activeOrdersCount : undefined,
    },
    { to: '/dashboard/menu', label: 'Menu', icon: UtensilsCrossed },
    { to: '/dashboard/analytics', label: 'Sales & Analytics', icon: BarChart3 },
    { to: '/dashboard/staff', label: 'Staff', icon: Users },
    { to: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  const renderNavContent = (isCompact: boolean) => (
    <div className="flex h-full flex-col justify-between bg-[var(--bg-sidebar)]">
      <div>
        {/* Brand bar */}
        <div
          className={`flex h-16 items-center border-b border-[var(--border-color)] ${
            isCompact ? 'justify-center px-2' : 'justify-between px-5'
          }`}
        >
          <NavLink
            to="/"
            className="focus:outline-none rounded-lg"
            title="Back to Mise Overview"
          >
            <BrandLogo size="sm" showText={!isCompact} />
          </NavLink>

          {/* Collapse toggle on tablet/desktop */}
          {!isCompact && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Collapse sidebar"
              className="hidden md:inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          {/* Close button on mobile drawer */}
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="md:hidden rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isCompact && (
          <div className="hidden md:flex justify-center pt-3">
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Expand sidebar"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Navigation Links */}
        <nav aria-label="Main navigation" className="px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onCloseMobile}
                title={isCompact ? item.label : undefined}
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-lg px-3 py-2.5 text-[14px] font-medium transition-colors duration-150 ${
                    isCompact ? 'justify-center px-2' : ''
                  } ${
                    isActive
                      ? 'bg-[var(--bg-subtle-green)] text-[var(--brand-primary)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                          isActive
                            ? 'text-[var(--brand-primary)]'
                            : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'
                        }`}
                      />
                      {!isCompact && <span className="truncate">{item.label}</span>}
                    </span>
                    {!isCompact && item.badge !== undefined && (
                      <span
                        className={`ml-2 inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                          isActive
                            ? 'bg-[var(--brand-primary)] text-white'
                            : 'bg-[var(--bg-warm)] text-[var(--warm-accent)]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Bottom: Help & Support, User profile, Restaurant identity */}
      <div className="border-t border-[var(--border-color)] px-3 py-3 space-y-2">
        <button
          type="button"
          onClick={() => {
            onCloseMobile();
            onOpenHelp();
          }}
          title={isCompact ? 'Help & Support' : undefined}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer transition-colors ${
            isCompact ? 'justify-center px-2' : ''
          }`}
        >
          <HelpCircle className="h-[18px] w-[18px] shrink-0 text-[var(--text-muted)]" />
          {!isCompact && <span>Help & Support</span>}
        </button>

        {/* User profile */}
        <button
          type="button"
          onClick={() => {
            onCloseMobile();
            onOpenProfile();
          }}
          title={isCompact ? 'Alex Rivera · Owner' : undefined}
          className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-[var(--bg-hover)] cursor-pointer transition-colors ${
            isCompact ? 'justify-center' : ''
          }`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary)] text-[12px] font-semibold text-white">
            AR
          </div>
          {!isCompact && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-medium text-[var(--text-primary)]">
                Alex Rivera
              </p>
              <p className="truncate text-[11.5px] text-[var(--text-secondary)]">
                Owner · On shift
              </p>
            </div>
          )}
        </button>

        {/* Restaurant identity */}
        <div
          title={isCompact ? activeRestaurant.name : undefined}
          className={`flex items-center gap-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] px-2.5 py-2.5 ${
            isCompact ? 'justify-center' : ''
          }`}
        >
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold text-white"
            style={{ backgroundColor: activeRestaurant.accentColor }}
          >
            {activeRestaurant.initials}
          </div>
          {!isCompact && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <Store className="h-3 w-3 text-[var(--text-muted)] shrink-0" />
                <p className="truncate text-[12.5px] font-semibold text-[var(--text-primary)]">
                  {activeRestaurant.name}
                </p>
              </div>
              <p className="truncate text-[11px] text-[var(--text-secondary)]">
                {activeRestaurant.tagline}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside
        className={`hidden md:block shrink-0 border-r border-[var(--border-color)] transition-all duration-200 ${
          collapsed ? 'w-[74px]' : 'w-[250px]'
        }`}
      >
        <div className="sticky top-0 h-screen">{renderNavContent(collapsed)}</div>
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-[#1B1F1C]/45 backdrop-blur-[1px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-[264px] max-w-[82vw] h-full border-r border-[var(--border-color)] shadow-[var(--shadow-lg)]">
            {renderNavContent(false)}
          </aside>
        </div>
      )}
    </>
  );
}
