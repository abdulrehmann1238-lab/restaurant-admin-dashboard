import { MOCK_STAFF } from '../data/mockStaff';
import type { RestaurantId, StaffMember } from '../types';
import { getInitials } from '../utils/format';
import { readStorage, simulateDelay, STORAGE_KEYS, writeStorage } from './storage';

function loadAllStaff(): StaffMember[] {
  return readStorage<StaffMember[]>(STORAGE_KEYS.staff, MOCK_STAFF);
}

function saveAllStaff(staff: StaffMember[]): void {
  writeStorage(STORAGE_KEYS.staff, staff);
}

export async function fetchStaff(restaurantId: RestaurantId): Promise<StaffMember[]> {
  await simulateDelay(110);
  return loadAllStaff().filter((member) => member.restaurantId === restaurantId);
}

export async function createStaffMember(
  payload: Omit<StaffMember, 'id' | 'dateAdded' | 'avatarInitials'>,
): Promise<StaffMember> {
  await simulateDelay(260);
  const all = loadAllStaff();
  const created: StaffMember = {
    ...payload,
    id: `staff-${Date.now()}`,
    dateAdded: new Date().toISOString().slice(0, 10),
    avatarInitials: getInitials(payload.fullName),
  };
  saveAllStaff([created, ...all]);
  return created;
}

export async function updateStaffMember(
  id: string,
  updates: Partial<StaffMember>,
): Promise<StaffMember> {
  await simulateDelay(200);
  const all = loadAllStaff();
  const idx = all.findIndex((m) => m.id === id);
  if (idx === -1) throw new Error(`Staff member ${id} not found`);
  const merged: StaffMember = {
    ...all[idx],
    ...updates,
  };
  if (updates.fullName) {
    merged.avatarInitials = getInitials(updates.fullName);
  }
  const next = [...all];
  next[idx] = merged;
  saveAllStaff(next);
  return merged;
}

export async function deleteStaffMember(id: string): Promise<void> {
  await simulateDelay(220);
  const all = loadAllStaff();
  saveAllStaff(all.filter((m) => m.id !== id));
}
