const BASE_URL = 'https://www.cheapshark.com/api/1.0';

/**
 * Ищет предложения по названию игры.
 * signal — сигнал от AbortController, чтобы можно было отменить запрос.
 */
export async function searchDeals(title, signal) {
  const params = new URLSearchParams({ pageSize: '12', sortBy: 'Metacritic' });
  if (title) params.set('title', title);

  const response = await fetch(`${BASE_URL}/deals?${params}`, { signal });

  // fetch не бросает ошибку на 404/500, поэтому проверяем вручную
  if (!response.ok) {
    throw new Error(`Ошибка сервера: ${response.status}`);
  }

  return response.json();
}