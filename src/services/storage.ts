export const STORAGE_KEYS = {
  restaurants: 'mise_demo_restaurants_v1',
  orders: 'mise_demo_orders_v1',
  menu: 'mise_demo_menu_v1',
  staff: 'mise_demo_staff_v1',
  notifications: 'mise_demo_notifications_v1',
  activities: 'mise_demo_activities_v1',
  settings: 'mise_demo_settings_v1',
  activeRestaurant: 'mise_demo_active_restaurant_v1',
} as const;

export function simulateDelay(ms = 220): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota issues in restricted environments
  }
}

export function clearDemoStorage(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore
    }
  });
}
