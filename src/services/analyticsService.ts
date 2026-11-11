import { MOCK_ANALYTICS } from '../data/mockAnalytics';
import type { DateRangeKey, RestaurantId, SalesSummary } from '../types';
import { simulateDelay } from './storage';

export async function fetchSalesSummary(
  restaurantId: RestaurantId,
  range: DateRangeKey,
): Promise<SalesSummary> {
  await simulateDelay(140);
  const byRestaurant = MOCK_ANALYTICS[restaurantId] ?? MOCK_ANALYTICS['olive-table'];
  return byRestaurant[range] ?? byRestaurant.today;
}
