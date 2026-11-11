import { MOCK_ACTIVITIES, MOCK_NOTIFICATIONS } from '../data/mockNotifications';
import { MOCK_RESTAURANTS } from '../data/mockRestaurants';
import type { ActivityItem, AppNotification, AppSettings, Restaurant, RestaurantId } from '../types';
import { readStorage, simulateDelay, STORAGE_KEYS, writeStorage } from './storage';

export const DEFAULT_SETTINGS: AppSettings = {
  currency: 'USD',
  timeFormat: '12h',
  dateFormat: 'MMM DD, YYYY',
  defaultDateRange: 'today',
  theme: 'light',
  notifications: {
    newOrder: true,
    statusUpdates: true,
    lowAvailability: true,
    dailySummary: false,
  },
};

export async function fetchRestaurants(): Promise<Restaurant[]> {
  await simulateDelay(80);
  return readStorage<Restaurant[]>(STORAGE_KEYS.restaurants, MOCK_RESTAURANTS);
}

export async function updateRestaurantProfile(
  id: RestaurantId,
  updates: Partial<Restaurant>,
): Promise<Restaurant[]> {
  await simulateDelay(240);
  const list = readStorage<Restaurant[]>(STORAGE_KEYS.restaurants, MOCK_RESTAURANTS);
  const next = list.map((r) => (r.id === id ? { ...r, ...updates } : r));
  writeStorage(STORAGE_KEYS.restaurants, next);
  return next;
}

export function loadNotifications(restaurantId: RestaurantId): AppNotification[] {
  const all = readStorage<AppNotification[]>(STORAGE_KEYS.notifications, MOCK_NOTIFICATIONS);
  return all.filter((n) => n.restaurantId === restaurantId);
}

export function saveAllNotifications(notifications: AppNotification[]): void {
  writeStorage(STORAGE_KEYS.notifications, notifications);
}

export function loadActivities(restaurantId: RestaurantId): ActivityItem[] {
  const all = readStorage<ActivityItem[]>(STORAGE_KEYS.activities, MOCK_ACTIVITIES);
  return all.filter((a) => a.restaurantId === restaurantId);
}

export function saveAllActivities(activities: ActivityItem[]): void {
  writeStorage(STORAGE_KEYS.activities, activities);
}

export function loadSettings(): AppSettings {
  return readStorage<AppSettings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
}

export function saveSettings(settings: AppSettings): void {
  writeStorage(STORAGE_KEYS.settings, settings);
}
