import { MOCK_ORDERS } from '../data/mockOrders';
import type { Order, OrderStatus, PaymentStatus, RestaurantId } from '../types';
import { readStorage, simulateDelay, STORAGE_KEYS, writeStorage } from './storage';

function loadAllOrders(): Order[] {
  return readStorage<Order[]>(STORAGE_KEYS.orders, MOCK_ORDERS);
}

function saveAllOrders(orders: Order[]): void {
  writeStorage(STORAGE_KEYS.orders, orders);
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Order placed',
  accepted: 'Accepted by manager',
  preparing: 'Kitchen started preparation',
  ready: 'Marked ready for handoff',
  completed: 'Order completed',
  rejected: 'Order rejected',
};

export async function fetchOrders(restaurantId: RestaurantId): Promise<Order[]> {
  await simulateDelay(120);
  return loadAllOrders().filter((o) => o.restaurantId === restaurantId);
}

export async function updateOrderStatus(
  orderId: string,
  nextStatus: OrderStatus,
  actorName = 'Alex Rivera',
): Promise<Order> {
  await simulateDelay(240);
  const all = loadAllOrders();
  const idx = all.findIndex((o) => o.id === orderId);
  if (idx === -1) {
    throw new Error(`Order ${orderId} not found`);
  }

  const nowLabel = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const current = all[idx];
  const updated: Order = {
    ...current,
    status: nextStatus,
    paymentStatus:
      nextStatus === 'rejected' && current.paymentStatus === 'Paid'
        ? 'Refunded'
        : nextStatus === 'completed' && current.paymentStatus === 'Pending'
          ? 'Paid'
          : current.paymentStatus,
    timeline: [
      ...current.timeline,
      {
        status: nextStatus,
        label:
          nextStatus === 'accepted'
            ? `Accepted by ${actorName}`
            : STATUS_LABELS[nextStatus],
        timestamp: nowLabel,
      },
    ],
  };

  const next = [...all];
  next[idx] = updated;
  saveAllOrders(next);
  return updated;
}

export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus,
): Promise<Order> {
  await simulateDelay(180);
  const all = loadAllOrders();
  const idx = all.findIndex((o) => o.id === orderId);
  if (idx === -1) throw new Error(`Order ${orderId} not found`);
  const updated: Order = { ...all[idx], paymentStatus };
  const next = [...all];
  next[idx] = updated;
  saveAllOrders(next);
  return updated;
}
