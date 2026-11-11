import type { Restaurant } from '../types';

export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: 'olive-table',
    name: 'The Olive Table',
    tagline: 'Modern Mediterranean Bistro',
    cuisine: 'Mediterranean & Wood-Fired Kitchen',
    email: 'hello@theolivetable.com',
    phone: '+1 (415) 555-0148',
    address: '418 Valencia St, San Francisco, CA 94103',
    businessHours: 'Tue–Sun · 11:30 AM – 10:30 PM',
    initials: 'OT',
    accentColor: '#526B58',
  },
  {
    id: 'garden-bistro',
    name: 'Garden Bistro',
    tagline: 'Seasonal Farm-to-Table Kitchen',
    cuisine: 'Seasonal Californian & Café',
    email: 'hello@gardenbistro.com',
    phone: '+1 (415) 555-0192',
    address: '920 Clement St, San Francisco, CA 94118',
    businessHours: 'Mon–Sun · 10:00 AM – 9:30 PM',
    initials: 'GB',
    accentColor: '#C28B60',
  },
];
