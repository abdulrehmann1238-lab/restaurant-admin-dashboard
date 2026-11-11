export type RestaurantId = 'olive-table' | 'garden-bistro';

export interface Restaurant {
  id: RestaurantId;
  name: string;
  tagline: string;
  cuisine: string;
  email: string;
  phone: string;
  address: string;
  businessHours: string;
  initials: string;
  accentColor: string;
}

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'rejected';

export type OrderType = 'Dine-in' | 'Pickup' | 'Delivery';

export type PaymentStatus = 'Paid' | 'Pending' | 'Refunded';

export type PaymentMethod = 'Card' | 'Apple Pay' | 'Cash' | 'Online';

export interface OrderTimelineEvent {
  status: OrderStatus;
  label: string;
  timestamp: string;
  note?: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  restaurantId: RestaurantId;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  tableOrAddress?: string;
  items: OrderItem[];
  orderType: OrderType;
  orderTime: string;
  isoDate: string;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  specialInstructions?: string;
  timeline: OrderTimelineEvent[];
}

export type MenuCategory =
  | 'Starters'
  | 'Main Course'
  | 'Burgers'
  | 'Pizza'
  | 'Pasta'
  | 'Desserts'
  | 'Beverages';

export interface MenuItem {
  id: string;
  restaurantId: RestaurantId;
  name: string;
  description: string;
  category: MenuCategory;
  price: number;
  imageUrl: string;
  prepTimeMinutes: number;
  available: boolean;
  featured: boolean;
  orderCount: number;
  updatedAt: string;
}

export type StaffRole =
  | 'Owner'
  | 'Manager'
  | 'Cashier'
  | 'Kitchen Staff'
  | 'Waiter';

export type StaffDepartment =
  | 'Management'
  | 'Front of House'
  | 'Kitchen'
  | 'Service';

export type StaffStatus = 'Active' | 'Inactive';

export interface StaffMember {
  id: string;
  restaurantId: RestaurantId;
  fullName: string;
  email: string;
  phone: string;
  role: StaffRole;
  department: StaffDepartment;
  status: StaffStatus;
  onShift: boolean;
  dateAdded: string;
  avatarInitials: string;
}

export type DateRangeKey =
  | 'today'
  | 'yesterday'
  | '7d'
  | '30d'
  | '90d'
  | 'month'
  | 'custom';

export interface RevenuePoint {
  label: string;
  current: number;
  previous: number;
  orders: number;
}

export interface OrderTypeBreakdown {
  type: OrderType;
  revenue: number;
  orders: number;
  percentage: number;
  color: string;
}

export interface BestSellingProduct {
  id: string;
  name: string;
  category: MenuCategory;
  unitsSold: number;
  revenue: number;
  sharePercent: number;
}

export interface SalesInsight {
  id: string;
  text: string;
  tone: 'positive' | 'neutral' | 'warm';
}

export interface SalesSummary {
  totalRevenue: number;
  revenueChangePct: number;
  grossSales: number;
  netSales: number;
  totalOrders: number;
  ordersChangePct: number;
  averageOrderValue: number;
  aovChangePct: number;
  refunds: number;
  refundCount: number;
  activeOrdersCount: number;
  preparingCount: number;
  pendingCount: number;
  series: RevenuePoint[];
  breakdown: OrderTypeBreakdown[];
  topProducts: BestSellingProduct[];
  insights: SalesInsight[];
}

export type NotificationType = 'order' | 'ready' | 'menu' | 'staff' | 'system';

export interface AppNotification {
  id: string;
  restaurantId: RestaurantId;
  title: string;
  message: string;
  timeLabel: string;
  read: boolean;
  type: NotificationType;
  linkTo?: string;
}

export interface ActivityItem {
  id: string;
  restaurantId: RestaurantId;
  type: 'order_new' | 'order_ready' | 'menu_updated' | 'staff_created';
  title: string;
  detail: string;
  timeLabel: string;
}

export type CurrencyCode = 'USD' | 'EUR' | 'GBP';
export type TimeFormat = '12h' | '24h';
export type DateFormat = 'MMM DD, YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';

export interface AppSettings {
  currency: CurrencyCode;
  timeFormat: TimeFormat;
  dateFormat: DateFormat;
  defaultDateRange: 'today' | '7d' | '30d' | '90d';
  theme: 'light' | 'dark';
  notifications: {
    newOrder: boolean;
    statusUpdates: boolean;
    lowAvailability: boolean;
    dailySummary: boolean;
  };
}

export type ToastVariant = 'success' | 'info' | 'warning' | 'error';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}
