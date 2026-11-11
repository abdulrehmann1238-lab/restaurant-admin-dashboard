import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Clock,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { MenuItemModal } from '../components/common/MenuItemModal';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Switch } from '../components/ui/Switch';
import { useRestaurant } from '../context/RestaurantContext';
import { MENU_CATEGORIES } from '../data/mockMenu';
import type { MenuCategory, MenuItem } from '../types';
import { formatCurrency } from '../utils/format';

type SortOption = 'popular' | 'name-asc' | 'price-asc' | 'price-desc';
type AvailabilityFilter = 'all' | 'available' | 'unavailable';

export function MenuPage() {
  const { menuItems, settings, editMenuItem, removeMenuItem } = useRestaurant();
  const location = useLocation();

  const [selectedCategory, setSelectedCategory] = useState<'All' | MenuCategory>('All');
  const [search, setSearch] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('popular');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const state = location.state as { searchQuery?: string } | null;
    if (state?.searchQuery) {
      setSearch(state.searchQuery);
    }
  }, [location.state]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: menuItems.length };
    for (const cat of MENU_CATEGORIES) {
      counts[cat] = menuItems.filter((m) => m.category === cat).length;
    }
    return counts;
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = menuItems.filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      if (availabilityFilter === 'available' && !item.available) return false;
      if (availabilityFilter === 'unavailable' && item.available) return false;
      if (
        q &&
        !item.name.toLowerCase().includes(q) &&
        !item.description.toLowerCase().includes(q) &&
        !item.category.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return b.orderCount - a.orderCount;
    });
  }, [menuItems, selectedCategory, availabilityFilter, search, sortBy]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await removeMenuItem(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] sm:text-[26px] font-semibold tracking-tight text-[var(--text-primary)]">
            Menu Management
          </h2>
          <p className="mt-1 text-[14px] text-[var(--text-secondary)]">
            Manage your dishes, categories, pricing, and availability.
          </p>
        </div>

        <Button onClick={handleOpenAdd} icon={<Plus className="h-4 w-4" />}>
          Add Menu Item
        </Button>
      </div>

      {/* Category Tabs */}
      <nav aria-label="Menu categories" className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setSelectedCategory('All')}
          className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border px-3.5 text-[13px] font-medium transition-colors cursor-pointer ${
            selectedCategory === 'All'
              ? 'border-[var(--brand-primary)] bg-[var(--bg-subtle-green)] text-[var(--brand-primary)]'
              : 'border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
          }`}
        >
          <span>All Items</span>
          <span className="rounded-full bg-[var(--bg-elevated)] px-1.5 py-0.5 text-[11px] tabular-nums text-[var(--text-secondary)]">
            {categoryCounts.All ?? 0}
          </span>
        </button>

        {MENU_CATEGORIES.map((category) => {
          const active = selectedCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border px-3.5 text-[13px] font-medium transition-colors cursor-pointer ${
                active
                  ? 'border-[var(--brand-primary)] bg-[var(--bg-subtle-green)] text-[var(--brand-primary)]'
                  : 'border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span>{category}</span>
              <span className="rounded-full bg-[var(--bg-elevated)] px-1.5 py-0.5 text-[11px] tabular-nums text-[var(--text-secondary)]">
                {categoryCounts[category] ?? 0}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Search, Availability & Sort Bar */}
      <section className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes by name or description..."
              aria-label="Search menu items"
              className="h-9 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] pl-9 pr-3 text-[13.5px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              aria-label="Filter by availability"
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as AvailabilityFilter)}
              className="h-9 rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] px-3 text-[13px] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none cursor-pointer"
            >
              <option value="all">All Availability</option>
              <option value="available">Available Only</option>
              <option value="unavailable">Unavailable Only</option>
            </select>

            <select
              aria-label="Sort menu items"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-9 rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] px-3 text-[13px] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none cursor-pointer"
            >
              <option value="popular">Sort: Most Popular</option>
              <option value="name-asc">Sort: Name (A–Z)</option>
              <option value="price-asc">Sort: Price (Low to High)</option>
              <option value="price-desc">Sort: Price (High to Low)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Desktop Compact Table */}
      <section className="hidden lg:block rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-elevated)] text-[11.5px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                <th className="py-3.5 pl-5 pr-3">Dish</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3 text-right">Price</th>
                <th className="py-3.5 px-3">Availability</th>
                <th className="py-3.5 px-3 text-right">Orders</th>
                <th className="py-3.5 px-3">Last Updated</th>
                <th className="py-3.5 pl-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-[13.5px]">
              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-14 text-center text-[14px] text-[var(--text-secondary)]"
                  >
                    No dishes match your search or category filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className={`transition-colors hover:bg-[var(--bg-hover)]/60 ${
                      !item.available ? 'opacity-80' : ''
                    }`}
                  >
                    <td className="py-3.5 pl-5 pr-3 max-w-[380px]">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          loading="lazy"
                          className="h-12 w-12 rounded-lg object-cover border border-[var(--border-color)] shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-[var(--text-primary)] truncate">
                              {item.name}
                            </span>
                            {item.featured && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-warm)] px-2 py-0.5 text-[11px] font-medium text-[var(--warm-accent)]">
                                <Sparkles className="h-2.5 w-2.5" />
                                Featured
                              </span>
                            )}
                            {!item.available && (
                              <span className="inline-flex items-center rounded-full bg-[var(--status-danger-bg)] px-2 py-0.5 text-[11px] font-medium text-[var(--status-danger)]">
                                Unavailable
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 truncate text-[12.5px] text-[var(--text-secondary)]">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="inline-flex rounded-md border border-[var(--border-color)] bg-[var(--bg-elevated)] px-2.5 py-0.5 text-[12px] font-medium text-[var(--text-secondary)]">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right font-semibold tabular-nums text-[var(--text-primary)] whitespace-nowrap">
                      {formatCurrency(item.price, settings.currency)}
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <Switch
                          checked={item.available}
                          onChange={(next) => void editMenuItem(item.id, { available: next })}
                          ariaLabel={`Toggle availability for ${item.name}`}
                        />
                        <span
                          className={`text-[12.5px] font-medium ${
                            item.available
                              ? 'text-[var(--status-success)]'
                              : 'text-[var(--text-muted)]'
                          }`}
                        >
                          {item.available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-right tabular-nums text-[var(--text-secondary)] whitespace-nowrap">
                      {item.orderCount}
                    </td>

                    <td className="py-3.5 px-3 text-[12.5px] text-[var(--text-secondary)] whitespace-nowrap">
                      {item.updatedAt}
                    </td>

                    <td className="py-3.5 pl-3 pr-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            void editMenuItem(item.id, { featured: !item.featured })
                          }
                          title={item.featured ? 'Unfeature dish' : 'Feature dish'}
                          aria-label={
                            item.featured
                              ? `Remove ${item.name} from featured`
                              : `Mark ${item.name} as featured`
                          }
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors cursor-pointer ${
                            item.featured
                              ? 'border-[var(--warm-accent)]/40 bg-[var(--bg-warm)] text-[var(--warm-accent)]'
                              : 'border-[var(--border-color)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          aria-label={`Edit ${item.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          aria-label={`Delete ${item.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-color)] text-[var(--status-danger)] hover:bg-[var(--status-danger-bg)] cursor-pointer transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Responsive Grid for Tablet & Mobile */}
      <section className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredItems.length === 0 ? (
          <div className="sm:col-span-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-10 text-center text-[13.5px] text-[var(--text-secondary)]">
            No dishes match your search or category filter.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4 flex flex-col justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  loading="lazy"
                  className="h-16 w-16 rounded-lg object-cover border border-[var(--border-color)] shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-[15px] text-[var(--text-primary)] leading-snug">
                      {item.name}
                    </h3>
                    <span className="font-semibold tabular-nums text-[14.5px] text-[var(--text-primary)] shrink-0">
                      {formatCurrency(item.price, settings.currency)}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="rounded bg-[var(--bg-elevated)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-secondary)]">
                      {item.category}
                    </span>
                    {!item.available && (
                      <span className="rounded-full bg-[var(--status-danger-bg)] px-2 py-0.5 text-[11px] font-medium text-[var(--status-danger)]">
                        Unavailable
                      </span>
                    )}
                    {item.featured && (
                      <span className="rounded-full bg-[var(--bg-warm)] px-2 py-0.5 text-[11px] font-medium text-[var(--warm-accent)]">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-[12.5px] text-[var(--text-secondary)]">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={item.available}
                    onChange={(next) => void editMenuItem(item.id, { available: next })}
                    ariaLabel={`Toggle availability for ${item.name}`}
                  />
                  <span className="text-[12px] text-[var(--text-secondary)] inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {item.prepTimeMinutes}m
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleOpenEdit(item)}
                    icon={<Pencil className="h-3.5 w-3.5" />}
                  >
                    Edit
                  </Button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    aria-label={`Delete ${item.name}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-color)] text-[var(--status-danger)] hover:bg-[var(--status-danger-bg)] cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Add / Edit Modal */}
      <MenuItemModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editingItem={editingItem}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title={`Delete "${deleteTarget?.name ?? 'dish'}"?`}
        message="This will remove the dish from your active menu. Existing historical orders will not be affected."
        confirmLabel="Delete Item"
      />
    </div>
  );
}

