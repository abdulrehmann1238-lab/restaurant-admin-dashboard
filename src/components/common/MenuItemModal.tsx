import React, { useEffect, useState } from 'react';
import { ImagePlus, Sparkles, Upload } from 'lucide-react';
import { DISH_IMAGE_PRESETS, MENU_CATEGORIES } from '../../data/mockMenu';
import { useRestaurant } from '../../context/RestaurantContext';
import type { MenuCategory, MenuItem } from '../../types';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Switch } from '../ui/Switch';

interface MenuItemModalProps {
  open: boolean;
  onClose: () => void;
  editingItem?: MenuItem | null;
}

const MAX_DESC_LENGTH = 180;

export function MenuItemModal({ open, onClose, editingItem }: MenuItemModalProps) {
  const { activeRestaurantId, addMenuItem, editMenuItem } = useRestaurant();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MenuCategory | ''>('Main Course');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState(DISH_IMAGE_PRESETS[0].url);
  const [prepTime, setPrepTime] = useState('15');
  const [available, setAvailable] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editingItem) {
      setName(editingItem.name);
      setDescription(editingItem.description);
      setCategory(editingItem.category);
      setPrice(editingItem.price.toFixed(2));
      setImageUrl(editingItem.imageUrl);
      setPrepTime(String(editingItem.prepTimeMinutes));
      setAvailable(editingItem.available);
      setFeatured(editingItem.featured);
    } else {
      setName('');
      setDescription('');
      setCategory('Main Course');
      setPrice('');
      setImageUrl(DISH_IMAGE_PRESETS[0].url);
      setPrepTime('15');
      setAvailable(true);
      setFeatured(false);
    }
    setErrors({});
    setSubmitting(false);
  }, [open, editingItem]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Item name is required.';
    if (!category) next.category = 'Please select a category.';
    const parsedPrice = Number(price);
    if (!price.trim() || Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      next.price = 'Price must be greater than $0.00.';
    }
    if (description.length > MAX_DESC_LENGTH) {
      next.description = `Description must be ${MAX_DESC_LENGTH} characters or fewer.`;
    }
    const parsedPrep = Number(prepTime);
    if (Number.isNaN(parsedPrep) || parsedPrep < 1 || parsedPrep > 120) {
      next.prepTime = 'Preparation time must be between 1 and 120 minutes.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !validate() || !category) return;

    setSubmitting(true);
    try {
      const cleanImage = imageUrl.trim() || DISH_IMAGE_PRESETS[0].url;
      if (editingItem) {
        await editMenuItem(editingItem.id, {
          name: name.trim(),
          description: description.trim(),
          category,
          price: Number(Number(price).toFixed(2)),
          imageUrl: cleanImage,
          prepTimeMinutes: Number(prepTime),
          available,
          featured,
        });
      } else {
        await addMenuItem({
          restaurantId: activeRestaurantId,
          name: name.trim(),
          description:
            description.trim() ||
            `Freshly prepared ${name.trim()} crafted to order in our kitchen.`,
          category,
          price: Number(Number(price).toFixed(2)),
          imageUrl: cleanImage,
          prepTimeMinutes: Number(prepTime),
          available,
          featured,
        });
      }
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
      subtitle={
        editingItem
          ? 'Update dish pricing, preparation time, or availability.'
          : 'Create a new dish or beverage for immediate service.'
      }
      maxWidthClass="max-w-xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="menu-item-form"
            loading={submitting}
          >
            {editingItem ? 'Save Changes' : 'Add Menu Item'}
          </Button>
        </>
      }
    >
      <form id="menu-item-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label
              htmlFor="menu-item-name"
              className="block text-[13px] font-medium text-[var(--text-primary)] mb-1.5"
            >
              Item Name <span className="text-[var(--status-danger)]">*</span>
            </label>
            <input
              id="menu-item-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((p) => ({ ...p, name: '' }));
              }}
              placeholder="e.g. Herb Crusted Sea Bass"
              className="w-full h-10 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)] focus:outline-none"
            />
            {errors.name && (
              <p className="mt-1 text-[12px] text-[var(--status-danger)]">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="menu-item-category"
              className="block text-[13px] font-medium text-[var(--text-primary)] mb-1.5"
            >
              Category <span className="text-[var(--status-danger)]">*</span>
            </label>
            <select
              id="menu-item-category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as MenuCategory);
                if (errors.category) setErrors((p) => ({ ...p, category: '' }));
              }}
              className="w-full h-10 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 text-[14px] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none"
            >
              <option value="">Select category</option>
              {MENU_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-[12px] text-[var(--status-danger)]">{errors.category}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="menu-item-price"
                className="block text-[13px] font-medium text-[var(--text-primary)] mb-1.5"
              >
                Price <span className="text-[var(--status-danger)]">*</span>
              </label>
              <input
                id="menu-item-price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  if (errors.price) setErrors((p) => ({ ...p, price: '' }));
                }}
                placeholder="18.50"
                className="w-full h-10 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 text-[14px] tabular-nums text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)] focus:outline-none"
              />
              {errors.price && (
                <p className="mt-1 text-[12px] text-[var(--status-danger)]">{errors.price}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="menu-item-prep"
                className="block text-[13px] font-medium text-[var(--text-primary)] mb-1.5"
              >
                Prep (mins)
              </label>
              <input
                id="menu-item-prep"
                type="number"
                min="1"
                max="120"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                className="w-full h-10 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 text-[14px] tabular-nums text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none"
              />
              {errors.prepTime && (
                <p className="mt-1 text-[12px] text-[var(--status-danger)]">{errors.prepTime}</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="menu-item-description"
              className="block text-[13px] font-medium text-[var(--text-primary)]"
            >
              Description
            </label>
            <span
              className={`text-[11.5px] tabular-nums ${
                description.length > MAX_DESC_LENGTH
                  ? 'text-[var(--status-danger)]'
                  : 'text-[var(--text-muted)]'
              }`}
            >
              {description.length}/{MAX_DESC_LENGTH}
            </span>
          </div>
          <textarea
            id="menu-item-description"
            rows={3}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) setErrors((p) => ({ ...p, description: '' }));
            }}
            placeholder="Key ingredients, preparation notes, or dietary highlights..."
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] p-3 text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)] focus:outline-none resize-none"
          />
          {errors.description && (
            <p className="mt-1 text-[12px] text-[var(--status-danger)]">{errors.description}</p>
          )}
        </div>

        {/* Dish Photography */}
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] p-3.5">
          <div className="flex flex-col sm:flex-row gap-3.5 items-start">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)]">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={name || 'Dish preview'}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = DISH_IMAGE_PRESETS[0].url;
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[var(--text-muted)]">
                  <ImagePlus className="h-5 w-5" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 w-full space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="menu-item-image"
                  className="text-[13px] font-medium text-[var(--text-primary)]"
                >
                  Dish Image URL or Upload
                </label>
                <label className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-surface)] px-2.5 py-1 text-[12px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer transition-colors">
                  <Upload className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                  Upload File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                </label>
              </div>
              <input
                id="menu-item-image"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="/images/dish-truffle-pasta.jpg"
                className="w-full h-9 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)] focus:outline-none"
              />
              <div className="flex items-center gap-1.5 overflow-x-auto pt-0.5 pb-1">
                {DISH_IMAGE_PRESETS.slice(0, 6).map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    title={preset.label}
                    className={`h-8 w-8 shrink-0 overflow-hidden rounded-md border transition-all cursor-pointer ${
                      imageUrl === preset.url
                        ? 'border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/25'
                        : 'border-[var(--border-color)] opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Availability & Featured */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[var(--border-color)] px-4 py-3">
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <Switch
              checked={available}
              onChange={setAvailable}
              label="Available for ordering"
            />
          </div>
          <div className="flex items-center justify-between sm:justify-start gap-2.5">
            <Sparkles className="h-4 w-4 text-[var(--warm-accent)]" />
            <Switch
              checked={featured}
              onChange={setFeatured}
              label="Featured item"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
