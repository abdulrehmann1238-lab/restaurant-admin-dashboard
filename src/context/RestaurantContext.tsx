import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { MOCK_ACTIVITIES, MOCK_NOTIFICATIONS } from '../data/mockNotifications';
import { MOCK_RESTAURANTS } from '../data/mockRestaurants';
import { createMenuItem, deleteMenuItem, fetchMenuItems, updateMenuItem } from '../services/menuService';
import { fetchOrders, updateOrderStatus } from '../services/ordersService';
import {
  DEFAULT_SETTINGS,
  fetchRestaurants,
  loadActivities,
  loadNotifications,
  loadSettings,
  saveAllActivities,
  saveAllNotifications,
  saveSettings,
  updateRestaurantProfile,
} from '../services/restaurantService';
import { createStaffMember, deleteStaffMember, fetchStaff, updateStaffMember } from '../services/staffService';
import { clearDemoStorage, readStorage, STORAGE_KEYS, writeStorage } from '../services/storage';
import type {
  ActivityItem,
  AppNotification,
  AppSettings,
  MenuItem,
  Order,
  OrderStatus,
  Restaurant,
  RestaurantId,
  StaffMember,
} from '../types';
import { useToast } from './ToastContext';

interface RestaurantContextValue {
  restaurants: Restaurant[];
  activeRestaurantId: RestaurantId;
  activeRestaurant: Restaurant;
  orders: Order[];
  menuItems: MenuItem[];
  staff: StaffMember[];
  notifications: AppNotification[];
  activities: ActivityItem[];
  settings: AppSettings;
  isLoadingData: boolean;
  switchRestaurant: (id: RestaurantId) => Promise<void>;
  changeOrderStatus: (orderId: string, nextStatus: OrderStatus) => Promise<Order>;
  addMenuItem: (payload: Omit<MenuItem, 'id' | 'orderCount' | 'updatedAt'>) => Promise<MenuItem>;
  editMenuItem: (id: string, updates: Partial<MenuItem>) => Promise<MenuItem>;
  removeMenuItem: (id: string) => Promise<void>;
  addStaffMember: (payload: Omit<StaffMember, 'id' | 'dateAdded' | 'avatarInitials'>) => Promise<StaffMember>;
  editStaffMember: (id: string, updates: Partial<StaffMember>) => Promise<StaffMember>;
  removeStaffMember: (id: string) => Promise<void>;
  saveRestaurantDetails: (updates: Partial<Restaurant>) => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetDemoData: () => Promise<void>;
}

const RestaurantContext = createContext<RestaurantContextValue | null>(null);

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();

  const [restaurants, setRestaurants] = useState<Restaurant[]>(MOCK_RESTAURANTS);
  const [activeRestaurantId, setActiveRestaurantId] = useState<RestaurantId>(() =>
    readStorage<RestaurantId>(STORAGE_KEYS.activeRestaurant, 'olive-table'),
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  const hydrateWorkspace = useCallback(async (restaurantId: RestaurantId) => {
    setIsLoadingData(true);
    try {
      const [restList, orderList, menuList, staffList] = await Promise.all([
        fetchRestaurants(),
        fetchOrders(restaurantId),
        fetchMenuItems(restaurantId),
        fetchStaff(restaurantId),
      ]);
      setRestaurants(restList);
      setOrders(orderList);
      setMenuItems(menuList);
      setStaff(staffList);
      setNotifications(loadNotifications(restaurantId));
      setActivities(loadActivities(restaurantId));
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    void hydrateWorkspace(activeRestaurantId);
  }, [activeRestaurantId, hydrateWorkspace]);

  const activeRestaurant =
    restaurants.find((r) => r.id === activeRestaurantId) ?? restaurants[0];

  const pushActivityAndNotification = useCallback(
    (
      restaurantId: RestaurantId,
      activity: Omit<ActivityItem, 'id' | 'restaurantId'>,
      notif?: Omit<AppNotification, 'id' | 'restaurantId' | 'read'>,
    ) => {
      const newActivity: ActivityItem = {
        ...activity,
        id: `act-${Date.now()}`,
        restaurantId,
      };
      const allActs = readStorage<ActivityItem[]>(STORAGE_KEYS.activities, MOCK_ACTIVITIES);
      const nextActs = [newActivity, ...allActs];
      saveAllActivities(nextActs);
      setActivities(nextActs.filter((a) => a.restaurantId === restaurantId));

      if (notif) {
        const newNotif: AppNotification = {
          ...notif,
          id: `notif-${Date.now()}`,
          restaurantId,
          read: false,
        };
        const allNotifs = readStorage<AppNotification[]>(
          STORAGE_KEYS.notifications,
          MOCK_NOTIFICATIONS,
        );
        const nextNotifs = [newNotif, ...allNotifs];
        saveAllNotifications(nextNotifs);
        setNotifications(nextNotifs.filter((n) => n.restaurantId === restaurantId));
      }
    },
    [],
  );

  const switchRestaurant = useCallback(
    async (id: RestaurantId) => {
      if (id === activeRestaurantId) return;
      setActiveRestaurantId(id);
      writeStorage(STORAGE_KEYS.activeRestaurant, id);
      const target = restaurants.find((r) => r.id === id);
      showToast({
        title: `Switched to ${target?.name ?? 'restaurant'}`,
        description: 'Orders, menu, staff, and analytics updated.',
        variant: 'info',
      });
    },
    [activeRestaurantId, restaurants, showToast],
  );

  const changeOrderStatus = useCallback(
    async (orderId: string, nextStatus: OrderStatus) => {
      const updated = await updateOrderStatus(orderId, nextStatus, 'Alex Rivera');
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));

      const labelMap: Record<OrderStatus, string> = {
        pending: 'marked pending',
        accepted: 'accepted',
        preparing: 'moved to kitchen prep',
        ready: 'marked as ready',
        completed: 'completed',
        rejected: 'rejected',
      };

      pushActivityAndNotification(
        updated.restaurantId,
        {
          type: nextStatus === 'ready' ? 'order_ready' : 'order_new',
          title: `Order ${labelMap[nextStatus]}`,
          detail: `${updated.orderNumber} · ${updated.customerName}`,
          timeLabel: 'Just now',
        },
        settings.notifications.statusUpdates
          ? {
              title: `Order ${updated.orderNumber} ${labelMap[nextStatus]}`,
              message: `${updated.customerName} (${updated.orderType}) status updated.`,
              timeLabel: 'Just now',
              type: nextStatus === 'ready' ? 'ready' : 'order',
              linkTo: '/dashboard/orders',
            }
          : undefined,
      );

      showToast({
        title: 'Order status updated',
        description: `${updated.orderNumber} is now ${nextStatus}.`,
        variant: nextStatus === 'rejected' ? 'warning' : 'success',
      });
      return updated;
    },
    [pushActivityAndNotification, settings.notifications.statusUpdates, showToast],
  );

  const addMenuItem = useCallback(
    async (payload: Omit<MenuItem, 'id' | 'orderCount' | 'updatedAt'>) => {
      const created = await createMenuItem(payload);
      setMenuItems((prev) => [created, ...prev]);

      pushActivityAndNotification(
        created.restaurantId,
        {
          type: 'menu_updated',
          title: 'Menu item added',
          detail: `${created.name} · ${created.category}`,
          timeLabel: 'Just now',
        },
        {
          title: 'Menu item added',
          message: `${created.name} is now live in ${created.category}.`,
          timeLabel: 'Just now',
          type: 'menu',
          linkTo: '/dashboard/menu',
        },
      );

      showToast({
        title: 'Menu item added successfully',
        description: `${created.name} has been added to the menu.`,
        variant: 'success',
      });
      return created;
    },
    [pushActivityAndNotification, showToast],
  );

  const editMenuItem = useCallback(
    async (id: string, updates: Partial<MenuItem>) => {
      const updated = await updateMenuItem(id, updates);
      setMenuItems((prev) => prev.map((item) => (item.id === id ? updated : item)));

      const isQuickAvailability =
        Object.keys(updates).length === 1 && 'available' in updates;

      pushActivityAndNotification(
        updated.restaurantId,
        {
          type: 'menu_updated',
          title: 'Menu item updated',
          detail: isQuickAvailability
            ? `${updated.name} set to ${updated.available ? 'Available' : 'Unavailable'}`
            : `${updated.name} details updated`,
          timeLabel: 'Just now',
        },
        isQuickAvailability && !updated.available && settings.notifications.lowAvailability
          ? {
              title: 'Dish marked unavailable',
              message: `${updated.name} is currently hidden from active ordering.`,
              timeLabel: 'Just now',
              type: 'menu',
              linkTo: '/dashboard/menu',
            }
          : undefined,
      );

      showToast({
        title: isQuickAvailability
          ? `${updated.name} is now ${updated.available ? 'available' : 'unavailable'}`
          : 'Menu item updated',
        variant: 'success',
      });
      return updated;
    },
    [pushActivityAndNotification, settings.notifications.lowAvailability, showToast],
  );

  const removeMenuItem = useCallback(
    async (id: string) => {
      const target = menuItems.find((m) => m.id === id);
      await deleteMenuItem(id);
      setMenuItems((prev) => prev.filter((item) => item.id !== id));
      showToast({
        title: 'Menu item deleted',
        description: target ? `${target.name} removed from the menu.` : undefined,
        variant: 'info',
      });
    },
    [menuItems, showToast],
  );

  const addStaffMember = useCallback(
    async (payload: Omit<StaffMember, 'id' | 'dateAdded' | 'avatarInitials'>) => {
      const created = await createStaffMember(payload);
      setStaff((prev) => [created, ...prev]);

      pushActivityAndNotification(
        created.restaurantId,
        {
          type: 'staff_created',
          title: 'Staff account created',
          detail: `${created.fullName} added as ${created.role}`,
          timeLabel: 'Just now',
        },
        {
          title: 'Staff member added',
          message: `${created.fullName} joined as ${created.role} (${created.department}).`,
          timeLabel: 'Just now',
          type: 'staff',
          linkTo: '/dashboard/staff',
        },
      );

      showToast({
        title: 'Staff member created',
        description: `${created.fullName} added as ${created.role}.`,
        variant: 'success',
      });
      return created;
    },
    [pushActivityAndNotification, showToast],
  );

  const editStaffMember = useCallback(
    async (id: string, updates: Partial<StaffMember>) => {
      const updated = await updateStaffMember(id, updates);
      setStaff((prev) => prev.map((m) => (m.id === id ? updated : m)));
      showToast({
        title: 'Staff profile updated',
        description: `${updated.fullName} (${updated.status})`,
        variant: 'success',
      });
      return updated;
    },
    [showToast],
  );

  const removeStaffMember = useCallback(
    async (id: string) => {
      const target = staff.find((s) => s.id === id);
      await deleteStaffMember(id);
      setStaff((prev) => prev.filter((m) => m.id !== id));
      showToast({
        title: 'Staff member removed',
        description: target ? `${target.fullName} removed from team.` : undefined,
        variant: 'info',
      });
    },
    [staff, showToast],
  );

  const saveRestaurantDetails = useCallback(
    async (updates: Partial<Restaurant>) => {
      const next = await updateRestaurantProfile(activeRestaurantId, updates);
      setRestaurants(next);
      showToast({
        title: 'Changes saved successfully',
        description: 'Restaurant profile updated.',
        variant: 'success',
      });
    },
    [activeRestaurantId, showToast],
  );

  const updateSettings = useCallback(
    (updates: Partial<AppSettings>) => {
      setSettings((prev) => {
        const next: AppSettings = {
          ...prev,
          ...updates,
          notifications: updates.notifications
            ? { ...prev.notifications, ...updates.notifications }
            : prev.notifications,
        };
        saveSettings(next);
        return next;
      });
      showToast({
        title: 'Changes saved successfully',
        variant: 'success',
      });
    },
    [showToast],
  );

  const markNotificationRead = useCallback((id: string) => {
    const all = readStorage<AppNotification[]>(
      STORAGE_KEYS.notifications,
      MOCK_NOTIFICATIONS,
    );
    const next = all.map((n) => (n.id === id ? { ...n, read: true } : n));
    saveAllNotifications(next);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    const all = readStorage<AppNotification[]>(
      STORAGE_KEYS.notifications,
      MOCK_NOTIFICATIONS,
    );
    const next = all.map((n) =>
      n.restaurantId === activeRestaurantId ? { ...n, read: true } : n,
    );
    saveAllNotifications(next);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast({
      title: 'All notifications marked as read',
      variant: 'info',
    });
  }, [activeRestaurantId, showToast]);

  const resetDemoData = useCallback(async () => {
    clearDemoStorage();
    setSettings(DEFAULT_SETTINGS);
    setActiveRestaurantId('olive-table');
    await hydrateWorkspace('olive-table');
    showToast({
      title: 'Demo data restored',
      description: 'All sample orders, menu items, staff, and settings have been reset.',
      variant: 'success',
    });
  }, [hydrateWorkspace, showToast]);

  return (
    <RestaurantContext.Provider
      value={{
        restaurants,
        activeRestaurantId,
        activeRestaurant,
        orders,
        menuItems,
        staff,
        notifications,
        activities,
        settings,
        isLoadingData,
        switchRestaurant,
        changeOrderStatus,
        addMenuItem,
        editMenuItem,
        removeMenuItem,
        addStaffMember,
        editStaffMember,
        removeStaffMember,
        saveRestaurantDetails,
        updateSettings,
        markNotificationRead,
        markAllNotificationsRead,
        resetDemoData,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant(): RestaurantContextValue {
  const ctx = useContext(RestaurantContext);
  if (!ctx) throw new Error('useRestaurant must be used within RestaurantProvider');
  return ctx;
}
