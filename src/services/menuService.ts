import { MOCK_MENU_ITEMS } from '../data/mockMenu';
import type { MenuItem, RestaurantId } from '../types';
import { readStorage, simulateDelay, STORAGE_KEYS, writeStorage } from './storage';

function loadAllMenu(): MenuItem[] {
  return readStorage<MenuItem[]>(STORAGE_KEYS.menu, MOCK_MENU_ITEMS);
}

function saveAllMenu(items: MenuItem[]): void {
  writeStorage(STORAGE_KEYS.menu, items);
}

export async function fetchMenuItems(restaurantId: RestaurantId): Promise<MenuItem[]> {
  await simulateDelay(110);
  return loadAllMenu().filter((item) => item.restaurantId === restaurantId);
}

export async function createMenuItem(
  payload: Omit<MenuItem, 'id' | 'orderCount' | 'updatedAt'>,
): Promise<MenuItem> {
  await simulateDelay(260);
  const all = loadAllMenu();
  const nowLabel = `Today, ${new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
  const created: MenuItem = {
    ...payload,
    id: `menu-${Date.now()}`,
    orderCount: 0,
    updatedAt: nowLabel,
  };
  saveAllMenu([created, ...all]);
  return created;
}

export async function updateMenuItem(
  id: string,
  updates: Partial<MenuItem>,
): Promise<MenuItem> {
  await simulateDelay(180);
  const all = loadAllMenu();
  const idx = all.findIndex((item) => item.id === id);
  if (idx === -1) throw new Error(`Menu item ${id} not found`);
  const nowLabel = `Today, ${new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
  const updated: MenuItem = {
    ...all[idx],
    ...updates,
    updatedAt: nowLabel,
  };
  const next = [...all];
  next[idx] = updated;
  saveAllMenu(next);
  return updated;
}

export async function deleteMenuItem(id: string): Promise<void> {
  await simulateDelay(220);
  const all = loadAllMenu();
  saveAllMenu(all.filter((item) => item.id !== id));
}
