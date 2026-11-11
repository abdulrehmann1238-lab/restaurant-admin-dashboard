import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, ClipboardList, LayoutDashboard, Users, UtensilsCrossed } from 'lucide-react';
import { HelpSupportModal } from '../common/HelpSupportModal';
import { NotificationsModal } from '../common/NotificationsModal';
import { ProfileModal } from '../common/ProfileModal';
import { QuickSearchModal } from '../common/QuickSearchModal';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [allNotifsOpen, setAllNotifsOpen] = useState(false);

  // Global Cmd/Ctrl + K quick search shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const mobileTabs = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/dashboard/orders', label: 'Orders', icon: ClipboardList },
    { to: '/dashboard/menu', label: 'Menu', icon: UtensilsCrossed },
    { to: '/dashboard/analytics', label: 'Sales', icon: BarChart3 },
    { to: '/dashboard/staff', label: 'Staff', icon: Users },
  ];

  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        onOpenHelp={() => setHelpOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenHelp={() => setHelpOpen(true)}
          onOpenProfile={() => setProfileOpen(true)}
          onOpenAllNotifications={() => setAllNotifsOpen(true)}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 pb-24 md:pb-10">
          <div className="mx-auto max-w-[1380px] animate-page-in">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label="Mobile quick navigation"
        className="fixed bottom-0 inset-x-0 z-30 flex md:hidden border-t border-[var(--border-color)] bg-[var(--bg-surface)]/95 backdrop-blur-sm"
      >
        {mobileTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center justify-center py-2 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-[var(--brand-primary)]' : 'text-[var(--text-secondary)]'
                }`
              }
            >
              <Icon className="h-[18px] w-[18px] mb-0.5" />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Global Interactive Modals */}
      <QuickSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <HelpSupportModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
      <NotificationsModal open={allNotifsOpen} onClose={() => setAllNotifsOpen(false)} />
    </div>
  );
}
