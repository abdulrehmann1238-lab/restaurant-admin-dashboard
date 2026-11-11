import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Clock,
  Mail,
  MapPin,
  Phone,
  Send,
  TrendingUp,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { BrandLogo } from '../components/ui/BrandLogo';
import { Button } from '../components/ui/Button';
import { useRestaurant } from '../context/RestaurantContext';
import { useToast } from '../context/ToastContext';
import { MOCK_ANALYTICS } from '../data/mockAnalytics';
import { formatCurrency } from '../utils/format';

interface LandingPageProps {
  onEnterDashboard: () => void;
}

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

export function LandingPage({ onEnterDashboard }: LandingPageProps) {
  const { orders, menuItems, settings } = useRestaurant();
  const { showToast } = useToast();

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactRestaurant, setContactRestaurant] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const featuresReveal = useScrollReveal();
  const previewReveal = useScrollReveal();

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const todaySummary = MOCK_ANALYTICS['olive-table'].today;
  const liveActiveOrders =
    orders.length > 0
      ? orders.filter(
          (o) =>
            o.status === 'pending' || o.status === 'accepted' || o.status === 'preparing',
        ).length
      : todaySummary.activeOrdersCount;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactSubmitting) return;
    const errs: Record<string, string> = {};
    if (!contactName.trim()) errs.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      errs.email = 'Please enter a valid work email.';
    }
    if (!contactMessage.trim() || contactMessage.trim().length < 10) {
      errs.message = 'Please share a brief note (at least 10 characters).';
    }
    setContactErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setContactSubmitting(true);
    window.setTimeout(() => {
      setContactSubmitting(false);
      setContactSubmitted(true);
      showToast({
        title: 'Inquiry sent',
        description: 'Demo confirmation — our team will follow up shortly.',
        variant: 'success',
      });
    }, 320);
  };

  const features = [
    {
      icon: ClipboardList,
      title: 'Orders, Under Control',
      description:
        'Review incoming orders, monitor preparation, and update order statuses from one unified queue.',
    },
    {
      icon: UtensilsCrossed,
      title: 'Menus Made Simple',
      description:
        'Update dishes, prices, availability, and categories without navigating through complicated settings.',
    },
    {
      icon: BarChart3,
      title: 'Sales at a Glance',
      description:
        'Understand revenue, order trends, average order value, and business performance in seconds.',
    },
    {
      icon: Users,
      title: 'Your Team, Organized',
      description:
        'Manage staff members, roles, shift readiness, and account access with clarity.',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Top Navbar */}
      <header className="fixed top-0 inset-x-0 z-40 border-b border-white/10 bg-[#1B1F1C]/75 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="focus:outline-none">
            <BrandLogo size="sm" lightText />
          </Link>

          <nav aria-label="Landing navigation" className="hidden md:flex items-center gap-7 text-[13.5px] font-medium text-white/80">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#preview" className="hover:text-white transition-colors">
              Product Preview
            </a>
            <a href="#contact" className="hover:text-white transition-colors">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Button size="sm" onClick={onEnterDashboard}>
              Explore Dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex items-center pt-20 pb-16 overflow-hidden bg-[#181B18]">
        {/* Background Video / Fallback Image */}
        <div className="absolute inset-0">
          {!prefersReducedMotion && !videoFailed ? (
            <video
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              poster="/images/hero-kitchen.jpg"
              onError={() => setVideoFailed(true)}
            >
              <source src="/videos/hero-ambience.mp4" type="video/mp4" />
            </video>
          ) : (
            <img
              src="/images/hero-kitchen.jpg"
              alt="Chef plating a dish in a warm modern restaurant kitchen"
              className="h-full w-full object-cover"
            />
          )}
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#141714]/90 via-[#141714]/78 to-[#141714]/60"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#141714]/85 via-transparent to-[#141714]/40"
            aria-hidden="true"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-[1280px] w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Hero Left Copy */}
            <div className="lg:col-span-7 text-white max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-[#DCE6DD]">
                RESTAURANT OPERATIONS, SIMPLIFIED
              </p>

              <h1 className="mt-5 font-serif-editorial text-[42px] sm:text-[56px] lg:text-[64px] font-normal leading-[1.06] tracking-tight text-white">
                Run your restaurant.
                <br />
                <span className="italic text-[#E5D3C2]">Not around it.</span>
              </h1>

              <p className="mt-5 text-[16px] sm:text-[18px] leading-relaxed text-white/80 max-w-xl">
                One beautifully organized workspace to manage orders, menus, sales, and your team — without the unnecessary complexity.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Button size="lg" onClick={onEnterDashboard}>
                  Explore Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <a
                  href="#features"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-white/25 bg-white/10 px-5 text-[14.5px] font-medium text-white hover:bg-white/18 transition-colors"
                >
                  Discover Features
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-white/70">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#8BB192]" />
                  Live order queue & kitchen status
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#8BB192]" />
                  One-click menu availability
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#8BB192]" />
                  Multi-location switching
                </span>
              </div>
            </div>

            {/* Floating Live Dashboard Preview Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)]/95 p-5 sm:p-6 text-[var(--text-primary)] shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
                <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand-primary)] text-[11px] font-semibold text-white">
                      OT
                    </span>
                    <div>
                      <p className="text-[13.5px] font-semibold text-[var(--text-primary)]">
                        The Olive Table
                      </p>
                      <p className="text-[11.5px] text-[var(--text-secondary)]">Live Service Snapshot</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--status-success-bg)] px-2.5 py-0.5 text-[11.5px] font-medium text-[var(--status-success)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-success)]" />
                    Open now
                  </span>
                </div>

                {/* Live KPI Grid */}
                <div className="mt-4 grid grid-cols-3 gap-2.5">
                  <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-3">
                    <p className="text-[11px] font-medium text-[var(--text-secondary)]">Today&apos;s Revenue</p>
                    <p className="mt-1 text-[16px] sm:text-[18px] font-semibold tabular-nums text-[var(--text-primary)]">
                      {formatCurrency(todaySummary.totalRevenue, settings.currency)}
                    </p>
                    <p className="mt-0.5 inline-flex items-center gap-0.5 text-[11px] font-medium text-[var(--status-success)] tabular-nums">
                      <TrendingUp className="h-3 w-3" />+{todaySummary.revenueChangePct}%
                    </p>
                  </div>

                  <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-3">
                    <p className="text-[11px] font-medium text-[var(--text-secondary)]">Active Orders</p>
                    <p className="mt-1 text-[16px] sm:text-[18px] font-semibold tabular-nums text-[var(--text-primary)]">
                      {liveActiveOrders}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[var(--status-warning)] font-medium">
                      In kitchen
                    </p>
                  </div>

                  <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-3">
                    <p className="text-[11px] font-medium text-[var(--text-secondary)]">Total Orders</p>
                    <p className="mt-1 text-[16px] sm:text-[18px] font-semibold tabular-nums text-[var(--text-primary)]">
                      {todaySummary.totalOrders}
                    </p>
                    <p className="mt-0.5 text-[11px] font-medium text-[var(--status-success)] tabular-nums">
                      +{todaySummary.ordersChangePct}%
                    </p>
                  </div>
                </div>

                {/* Tiny real sales chart */}
                <div className="mt-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-medium text-[var(--text-primary)]">
                      Hourly Sales Pace
                    </span>
                    <span className="text-[11.5px] text-[var(--text-secondary)] tabular-nums">
                      9 AM – 9 PM
                    </span>
                  </div>
                  <div className="h-[88px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={todaySummary.series}>
                        <defs>
                          <linearGradient id="heroMiniGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#526B58" stopOpacity={0.28} />
                            <stop offset="100%" stopColor="#526B58" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="current"
                          stroke="#526B58"
                          strokeWidth={2}
                          fill="url(#heroMiniGrad)"
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-[12px] text-[var(--text-secondary)]">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                    Latest: #ORD-1048 · Sarah Mitchell
                  </span>
                  <button
                    type="button"
                    onClick={onEnterDashboard}
                    className="font-semibold text-[var(--brand-primary)] hover:underline cursor-pointer"
                  >
                    Open live demo →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div
          ref={featuresReveal.ref}
          className={`mx-auto max-w-[1200px] transition-all duration-500 ${
            featuresReveal.visible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="max-w-2xl">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-primary)]">
              BUILT FOR SERVICE HOURS
            </p>
            <h2 className="mt-2.5 font-serif-editorial text-[32px] sm:text-[40px] leading-tight text-[var(--text-primary)]">
              Calm operational tools for busy dining rooms.
            </h2>
            <p className="mt-3 text-[15.5px] leading-relaxed text-[var(--text-secondary)]">
              Every workflow is designed to take as few clicks as possible — from accepting delivery tickets during dinner rush to 86-ing a seasonal dish.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="group rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--brand-secondary)] hover:shadow-[var(--shadow-sm)]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--bg-subtle-green)] text-[var(--brand-primary)] transition-colors group-hover:bg-[var(--brand-primary)] group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-[17px] font-semibold text-[var(--text-primary)]">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-[var(--text-secondary)]">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Preview Section */}
      <section
        id="preview"
        className="border-y border-[var(--border-color)] bg-[var(--bg-surface)] py-20 sm:py-24 px-4 sm:px-6 lg:px-8"
      >
        <div
          ref={previewReveal.ref}
          className={`mx-auto max-w-[1200px] transition-all duration-500 ${
            previewReveal.visible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--warm-accent)]">
                INSIDE THE WORKSPACE
              </p>
              <h2 className="mt-2 font-serif-editorial text-[30px] sm:text-[38px] leading-tight text-[var(--text-primary)]">
                Everything your shift lead needs on one screen.
              </h2>
            </div>
            <Button variant="secondary" onClick={onEnterDashboard}>
              Launch Interactive Demo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Realistic Dashboard Mockup Window */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] shadow-[var(--shadow-md)] overflow-hidden">
            {/* Fake browser bar */}
            <div className="flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-surface)] px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--border-strong)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--border-strong)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--border-strong)]" />
              </div>
              <span className="rounded-md bg-[var(--bg-elevated)] px-3 py-0.5 text-[11.5px] text-[var(--text-secondary)] border border-[var(--border-color)]">
                app.miseops.io/dashboard
              </span>
              <span className="text-[11.5px] font-medium text-[var(--brand-primary)]">
                The Olive Table
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Mini Sidebar Preview */}
              <div className="hidden lg:block lg:col-span-3 border-r border-[var(--border-color)] bg-[var(--bg-surface)] p-4 space-y-2">
                <BrandLogo size="sm" />
                <div className="pt-4 space-y-1 text-[13px] font-medium">
                  <div className="rounded-lg bg-[var(--bg-subtle-green)] px-3 py-2 text-[var(--brand-primary)]">
                    Overview
                  </div>
                  <div className="rounded-lg px-3 py-2 text-[var(--text-secondary)]">
                    Orders ({liveActiveOrders})
                  </div>
                  <div className="rounded-lg px-3 py-2 text-[var(--text-secondary)]">
                    Menu ({menuItems.length || 13})
                  </div>
                  <div className="rounded-lg px-3 py-2 text-[var(--text-secondary)]">
                    Sales &amp; Analytics
                  </div>
                  <div className="rounded-lg px-3 py-2 text-[var(--text-secondary)]">
                    Staff
                  </div>
                </div>
              </div>

              {/* Main Preview Canvas */}
              <div className="lg:col-span-9 p-5 sm:p-6 space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-3.5">
                    <p className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">
                      Today&apos;s Revenue
                    </p>
                    <p className="mt-1 text-[18px] font-semibold tabular-nums text-[var(--text-primary)]">
                      $4,285.50
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-[var(--status-success)]">+12.8%</p>
                  </div>
                  <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-3.5">
                    <p className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">
                      Total Orders
                    </p>
                    <p className="mt-1 text-[18px] font-semibold tabular-nums text-[var(--text-primary)]">
                      128
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-[var(--status-success)]">+8.2%</p>
                  </div>
                  <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-3.5">
                    <p className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">
                      Avg Order Value
                    </p>
                    <p className="mt-1 text-[18px] font-semibold tabular-nums text-[var(--text-primary)]">
                      $33.48
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-[var(--status-success)]">+4.6%</p>
                  </div>
                  <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-3.5">
                    <p className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">
                      Active Orders
                    </p>
                    <p className="mt-1 text-[18px] font-semibold tabular-nums text-[var(--text-primary)]">
                      {liveActiveOrders}
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-[var(--warm-accent)]">
                      5 preparing · 7 pending
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Live Order Queue Snapshot */}
                  <div className="md:col-span-7 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4">
                    <p className="text-[13.5px] font-semibold text-[var(--text-primary)] mb-3">
                      Recent Kitchen Queue
                    </p>
                    <div className="divide-y divide-[var(--border-color)] text-[13px]">
                      {[
                        { id: '#ORD-1048', name: 'Sarah Mitchell', type: 'Pickup', total: '$42.50', status: 'Preparing', badge: 'bg-[var(--bg-warm)] text-[var(--warm-accent)]' },
                        { id: '#ORD-1047', name: 'James Wilson', type: 'Delivery', total: '$28.00', status: 'Pending', badge: 'bg-[var(--status-warning-bg)] text-[var(--status-warning)]' },
                        { id: '#ORD-1046', name: 'Emma Carter', type: 'Dine-in', total: '$64.20', status: 'Ready', badge: 'bg-[var(--status-success-bg)] text-[var(--status-success)]' },
                      ].map((row) => (
                        <div key={row.id} className="flex items-center justify-between py-2.5 gap-2">
                          <div className="min-w-0">
                            <span className="font-medium tabular-nums text-[var(--text-primary)]">
                              {row.id}
                            </span>
                            <span className="mx-2 text-[var(--text-muted)]">·</span>
                            <span className="text-[var(--text-secondary)]">{row.name}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="tabular-nums font-medium text-[var(--text-primary)]">
                              {row.total}
                            </span>
                            <span className={`rounded-full px-2 py-0.5 text-[11.5px] font-medium ${row.badge}`}>
                              {row.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Signature Dishes Preview */}
                  <div className="md:col-span-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4">
                    <p className="text-[13.5px] font-semibold text-[var(--text-primary)] mb-3">
                      Popular Today
                    </p>
                    <div className="space-y-2.5">
                      {[
                        { name: 'Truffle Mushroom Pasta', img: '/images/dish-truffle-pasta.jpg', sold: '42 sold', rev: '$777.00' },
                        { name: 'Margherita Pizza', img: '/images/dish-margherita-pizza.jpg', sold: '35 sold', rev: '$560.00' },
                        { name: 'Pan-Seared Salmon', img: '/images/dish-salmon.jpg', sold: '29 sold', rev: '$696.00' },
                      ].map((dish) => (
                        <div key={dish.name} className="flex items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={dish.img}
                              alt={dish.name}
                              loading="lazy"
                              className="h-9 w-9 rounded-lg object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-medium text-[var(--text-primary)]">
                                {dish.name}
                              </p>
                              <p className="text-[11.5px] text-[var(--text-secondary)]">
                                {dish.sold}
                              </p>
                            </div>
                          </div>
                          <span className="text-[12.5px] font-semibold tabular-nums text-[var(--text-primary)]">
                            {dish.rev}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[960px] rounded-2xl border border-[var(--border-color)] bg-[var(--bg-subtle-green)] px-6 py-14 sm:px-12 text-center">
          <h2 className="font-serif-editorial text-[34px] sm:text-[46px] leading-[1.1] text-[var(--text-primary)]">
            Less managing.
            <br />
            More running your restaurant.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] text-[var(--text-secondary)]">
            Explore the full interactive workspace with sample orders, menu editing, analytics export, and team management.
          </p>
          <div className="mt-7">
            <Button size="lg" onClick={onEnterDashboard}>
              Open Dashboard Demo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer & Demo Contact Section */}
      <footer
        id="contact"
        className="border-t border-[var(--border-color)] bg-[var(--bg-surface)] py-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-[1200px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Brand & Nav */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <BrandLogo size="md" />
                <p className="mt-3 max-w-md text-[14px] leading-relaxed text-[var(--text-secondary)]">
                  Purpose-built operations software for independent restaurants and multi-unit hospitality groups. Manage daily orders, menus, team access, and revenue clarity in one calm workspace.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-[13.5px]">
                <div className="space-y-2">
                  <p className="font-semibold text-[var(--text-primary)]">Product</p>
                  <ul className="space-y-1.5 text-[var(--text-secondary)]">
                    <li>
                      <a href="#features" className="hover:text-[var(--text-primary)]">
                        Features
                      </a>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={onEnterDashboard}
                        className="hover:text-[var(--text-primary)] cursor-pointer"
                      >
                        Dashboard
                      </button>
                    </li>
                    <li>
                      <a href="#preview" className="hover:text-[var(--text-primary)]">
                        Product Tour
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-[var(--text-primary)]">Support</p>
                  <ul className="space-y-1.5 text-[var(--text-secondary)]">
                    <li>
                      <a href="#contact" className="hover:text-[var(--text-primary)]">
                        Contact Team
                      </a>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={onEnterDashboard}
                        className="hover:text-[var(--text-primary)] cursor-pointer"
                      >
                        Live Workspace
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="col-span-2 sm:col-span-1 space-y-2">
                  <p className="font-semibold text-[var(--text-primary)]">Contact</p>
                  <ul className="space-y-1.5 text-[var(--text-secondary)] text-[13px]">
                    <li className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-[var(--brand-primary)] shrink-0" />
                      hello@miseops.io
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-[var(--brand-primary)] shrink-0" />
                      +1 (415) 555-0190
                    </li>
                    <li className="flex items-start gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[var(--brand-primary)] mt-0.5 shrink-0" />
                      San Francisco, CA
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Working Demo Contact Form */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-elevated)] p-6">
                <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">
                  Request a Personalized Walkthrough
                </h3>
                <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
                  Have questions about multi-location rollout or REST API integration? Send a quick note.
                </p>

                {contactSubmitted ? (
                  <div className="mt-5 rounded-xl border border-[var(--status-success)]/25 bg-[var(--status-success-bg)] p-5 text-center">
                    <CheckCircle2 className="mx-auto h-7 w-7 text-[var(--status-success)]" />
                    <p className="mt-2 text-[15px] font-semibold text-[var(--text-primary)]">
                      Thank you, {contactName}!
                    </p>
                    <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
                      Your demo inquiry has been recorded locally. Ready to explore the live product?
                    </p>
                    <div className="mt-4 flex justify-center gap-2.5">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setContactSubmitted(false);
                          setContactName('');
                          setContactEmail('');
                          setContactRestaurant('');
                          setContactMessage('');
                        }}
                      >
                        Send Another
                      </Button>
                      <Button size="sm" onClick={onEnterDashboard}>
                        Open Dashboard
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="mt-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="contact-name"
                          className="block text-[12.5px] font-medium text-[var(--text-primary)] mb-1"
                        >
                          Name *
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="Alex Rivera"
                          className="h-9 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 text-[13.5px] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none"
                        />
                        {contactErrors.name && (
                          <p className="mt-1 text-[11.5px] text-[var(--status-danger)]">
                            {contactErrors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="contact-email"
                          className="block text-[12.5px] font-medium text-[var(--text-primary)] mb-1"
                        >
                          Work Email *
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="alex@restaurant.com"
                          className="h-9 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 text-[13.5px] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none"
                        />
                        {contactErrors.email && (
                          <p className="mt-1 text-[11.5px] text-[var(--status-danger)]">
                            {contactErrors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="contact-restaurant"
                        className="block text-[12.5px] font-medium text-[var(--text-primary)] mb-1"
                      >
                        Restaurant Name
                      </label>
                      <input
                        id="contact-restaurant"
                        type="text"
                        value={contactRestaurant}
                        onChange={(e) => setContactRestaurant(e.target.value)}
                        placeholder="e.g. The Olive Table"
                        className="h-9 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 text-[13.5px] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-message"
                        className="block text-[12.5px] font-medium text-[var(--text-primary)] mb-1"
                      >
                        Message *
                      </label>
                      <textarea
                        id="contact-message"
                        rows={2}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Tell us about your team size or workflow needs..."
                        className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] p-2.5 text-[13.5px] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none resize-none"
                      />
                      {contactErrors.message && (
                        <p className="mt-1 text-[11.5px] text-[var(--status-danger)]">
                          {contactErrors.message}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end pt-1">
                      <Button
                        type="submit"
                        size="sm"
                        loading={contactSubmitting}
                        icon={<Send className="h-3.5 w-3.5" />}
                      >
                        Send Message
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--border-color)] pt-6 text-[12.5px] text-[var(--text-muted)]">
            <p>© {new Date().getFullYear()} Mise Hospitality Operations. Interactive Frontend Prototype.</p>
            <p>All metrics and records shown are local demonstration datasets.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
