import React, { useEffect, useState } from 'react';
import { Bell, Moon, RotateCcw, Save, Sliders, Store, Sun } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Switch } from '../components/ui/Switch';
import { useRestaurant } from '../context/RestaurantContext';
import type { CurrencyCode, DateFormat, TimeFormat } from '../types';

export function SettingsPage() {
  const {
    activeRestaurant,
    settings,
    saveRestaurantDetails,
    updateSettings,
    resetDemoData,
  } = useRestaurant();

  const [name, setName] = useState(activeRestaurant.name);
  const [tagline, setTagline] = useState(activeRestaurant.tagline);
  const [email, setEmail] = useState(activeRestaurant.email);
  const [phone, setPhone] = useState(activeRestaurant.phone);
  const [address, setAddress] = useState(activeRestaurant.address);
  const [businessHours, setBusinessHours] = useState(activeRestaurant.businessHours);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    setName(activeRestaurant.name);
    setTagline(activeRestaurant.tagline);
    setEmail(activeRestaurant.email);
    setPhone(activeRestaurant.phone);
    setAddress(activeRestaurant.address);
    setBusinessHours(activeRestaurant.businessHours);
    setErrors({});
  }, [activeRestaurant]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingProfile) return;
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Restaurant name is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid contact email.';
    }
    if (!phone.trim()) errs.phone = 'Phone number is required.';
    if (!address.trim()) errs.address = 'Address is required.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSavingProfile(true);
    try {
      await saveRestaurantDetails({
        name: name.trim(),
        tagline: tagline.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        businessHours: businessHours.trim(),
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleConfirmReset = async () => {
    setResetting(true);
    try {
      await resetDemoData();
      setResetOpen(false);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-[24px] sm:text-[26px] font-semibold tracking-tight text-[var(--text-primary)]">
          Settings
        </h2>
        <p className="mt-1 text-[14px] text-[var(--text-secondary)]">
          Configure restaurant profile, regional formatting, alerts, and workspace theme.
        </p>
      </div>

      {/* Restaurant Profile */}
      <section className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 sm:p-6">
        <div className="flex items-center gap-2.5 border-b border-[var(--border-color)] pb-4">
          <Store className="h-4.5 w-4.5 text-[var(--brand-primary)]" />
          <div>
            <h3 className="text-[17px] font-semibold text-[var(--text-primary)]">
              Restaurant Profile
            </h3>
            <p className="text-[12.5px] text-[var(--text-secondary)]">
              Details shown for {activeRestaurant.name} across headers and receipts.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
          {/* Restaurant Logo Identity Preview */}
          <div className="flex items-center gap-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] p-3.5">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-[15px] font-semibold text-white shrink-0"
              style={{ backgroundColor: activeRestaurant.accentColor }}
            >
              {activeRestaurant.initials}
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[var(--text-primary)]">
                {name || activeRestaurant.name}
              </p>
              <p className="text-[12.5px] text-[var(--text-secondary)]">
                {tagline || activeRestaurant.cuisine}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="rest-name"
                className="block text-[13px] font-medium text-[var(--text-primary)] mb-1.5"
              >
                Restaurant Name *
              </label>
              <input
                id="rest-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 text-[14px] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none"
              />
              {errors.name && (
                <p className="mt-1 text-[12px] text-[var(--status-danger)]">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="rest-tagline"
                className="block text-[13px] font-medium text-[var(--text-primary)] mb-1.5"
              >
                Tagline / Concept
              </label>
              <input
                id="rest-tagline"
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 text-[14px] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="rest-email"
                className="block text-[13px] font-medium text-[var(--text-primary)] mb-1.5"
              >
                Contact Email *
              </label>
              <input
                id="rest-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 text-[14px] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none"
              />
              {errors.email && (
                <p className="mt-1 text-[12px] text-[var(--status-danger)]">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="rest-phone"
                className="block text-[13px] font-medium text-[var(--text-primary)] mb-1.5"
              >
                Phone Number *
              </label>
              <input
                id="rest-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 text-[14px] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none"
              />
              {errors.phone && (
                <p className="mt-1 text-[12px] text-[var(--status-danger)]">{errors.phone}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="rest-address"
                className="block text-[13px] font-medium text-[var(--text-primary)] mb-1.5"
              >
                Address *
              </label>
              <input
                id="rest-address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 text-[14px] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none"
              />
              {errors.address && (
                <p className="mt-1 text-[12px] text-[var(--status-danger)]">{errors.address}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="rest-hours"
                className="block text-[13px] font-medium text-[var(--text-primary)] mb-1.5"
              >
                Business Hours
              </label>
              <input
                id="rest-hours"
                type="text"
                value={businessHours}
                onChange={(e) => setBusinessHours(e.target.value)}
                className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 text-[14px] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              loading={savingProfile}
              icon={<Save className="h-4 w-4" />}
            >
              Save Profile
            </Button>
          </div>
        </form>
      </section>

      {/* Preferences */}
      <section className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 sm:p-6">
        <div className="flex items-center gap-2.5 border-b border-[var(--border-color)] pb-4">
          <Sliders className="h-4.5 w-4.5 text-[var(--brand-primary)]" />
          <div>
            <h3 className="text-[17px] font-semibold text-[var(--text-primary)]">
              Preferences
            </h3>
            <p className="text-[12.5px] text-[var(--text-secondary)]">
              Regional currency, date/time formatting, and default analytics horizon.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="pref-currency"
              className="block text-[13px] font-medium text-[var(--text-primary)] mb-1.5"
            >
              Currency
            </label>
            <select
              id="pref-currency"
              value={settings.currency}
              onChange={(e) =>
                updateSettings({ currency: e.target.value as CurrencyCode })
              }
              className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 text-[14px] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none"
            >
              <option value="USD">USD ($) — US Dollar</option>
              <option value="EUR">EUR (€) — Euro</option>
              <option value="GBP">GBP (£) — British Pound</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="pref-time"
              className="block text-[13px] font-medium text-[var(--text-primary)] mb-1.5"
            >
              Time Format
            </label>
            <select
              id="pref-time"
              value={settings.timeFormat}
              onChange={(e) =>
                updateSettings({ timeFormat: e.target.value as TimeFormat })
              }
              className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 text-[14px] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none"
            >
              <option value="12h">12-hour (12:42 PM)</option>
              <option value="24h">24-hour (12:42)</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="pref-date"
              className="block text-[13px] font-medium text-[var(--text-primary)] mb-1.5"
            >
              Date Format
            </label>
            <select
              id="pref-date"
              value={settings.dateFormat}
              onChange={(e) =>
                updateSettings({ dateFormat: e.target.value as DateFormat })
              }
              className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 text-[14px] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none"
            >
              <option value="MMM DD, YYYY">Nov 11, 2026</option>
              <option value="DD/MM/YYYY">11/11/2026</option>
              <option value="YYYY-MM-DD">2026-11-11</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="pref-range"
              className="block text-[13px] font-medium text-[var(--text-primary)] mb-1.5"
            >
              Default Dashboard Date Range
            </label>
            <select
              id="pref-range"
              value={settings.defaultDateRange}
              onChange={(e) =>
                updateSettings({
                  defaultDateRange: e.target.value as 'today' | '7d' | '30d' | '90d',
                })
              }
              className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 text-[14px] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none"
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 sm:p-6">
        <div className="flex items-center gap-2.5 border-b border-[var(--border-color)] pb-4">
          <Bell className="h-4.5 w-4.5 text-[var(--brand-primary)]" />
          <div>
            <h3 className="text-[17px] font-semibold text-[var(--text-primary)]">
              Notifications
            </h3>
            <p className="text-[12.5px] text-[var(--text-secondary)]">
              Choose which operational alerts appear in your workspace feed.
            </p>
          </div>
        </div>

        <div className="mt-4 divide-y divide-[var(--border-color)]">
          {[
            {
              key: 'newOrder' as const,
              title: 'New order notifications',
              desc: 'Alert when new dine-in, pickup, or delivery tickets arrive.',
            },
            {
              key: 'statusUpdates' as const,
              title: 'Order status updates',
              desc: 'Log notification entries when orders move through preparation and handoff.',
            },
            {
              key: 'lowAvailability' as const,
              title: 'Low availability alerts',
              desc: 'Notify when dishes are toggled unavailable during active service.',
            },
            {
              key: 'dailySummary' as const,
              title: 'Daily sales summary',
              desc: 'Receive an end-of-night revenue and average order digest.',
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between gap-4 py-3.5 first:pt-1 last:pb-1"
            >
              <div>
                <p className="text-[14px] font-medium text-[var(--text-primary)]">
                  {item.title}
                </p>
                <p className="text-[12.5px] text-[var(--text-secondary)]">{item.desc}</p>
              </div>
              <Switch
                checked={settings.notifications[item.key]}
                onChange={(checked) =>
                  updateSettings({
                    notifications: {
                      ...settings.notifications,
                      [item.key]: checked,
                    },
                  })
                }
                ariaLabel={item.title}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Appearance & Demo Reset */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <section className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 sm:p-6">
          <h3 className="text-[17px] font-semibold text-[var(--text-primary)]">
            Appearance
          </h3>
          <p className="mt-0.5 text-[12.5px] text-[var(--text-secondary)]">
            Choose between warm off-white daylight or calm evening charcoal.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => updateSettings({ theme: 'light' })}
              className={`flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                settings.theme === 'light'
                  ? 'border-[var(--brand-primary)] bg-[var(--bg-subtle-green)]/60'
                  : 'border-[var(--border-color)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <Sun className="h-4 w-4 text-[var(--warm-accent)]" />
              <div>
                <p className="text-[13.5px] font-semibold text-[var(--text-primary)]">
                  Light Mode
                </p>
                <p className="text-[11.5px] text-[var(--text-secondary)]">Default warm paper</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => updateSettings({ theme: 'dark' })}
              className={`flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                settings.theme === 'dark'
                  ? 'border-[var(--brand-primary)] bg-[var(--bg-subtle-green)]/60'
                  : 'border-[var(--border-color)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <Moon className="h-4 w-4 text-[var(--brand-primary)]" />
              <div>
                <p className="text-[13.5px] font-semibold text-[var(--text-primary)]">
                  Dark Mode
                </p>
                <p className="text-[11.5px] text-[var(--text-secondary)]">Warm charcoal</p>
              </div>
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-[17px] font-semibold text-[var(--text-primary)]">
              Demo Workspace Data
            </h3>
            <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-secondary)]">
              Changes to orders, menu dishes, staff, and preferences are persisted in your browser. Restore original sample datasets anytime.
            </p>
          </div>
          <div className="mt-4">
            <Button
              variant="secondary"
              onClick={() => setResetOpen(true)}
              icon={<RotateCcw className="h-4 w-4" />}
            >
              Reset Demo Data
            </Button>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={handleConfirmReset}
        loading={resetting}
        variant="primary"
        title="Reset demo workspace?"
        message="This will clear local changes and restore all original sample orders, menu items, staff accounts, and light theme defaults."
        confirmLabel="Restore Defaults"
      />
    </div>
  );
}

