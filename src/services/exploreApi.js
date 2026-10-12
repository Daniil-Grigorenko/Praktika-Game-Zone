const BASE_URL = 'https://www.cheapshark.com/api/1.0';


export async function searchDeals(title, signal) {
  const params = new URLSearchParams({ pageSize: '12', sortBy: 'Metacritic' });
  if (title) params.set('title', title);

  const response = await fetch(`${BASE_URL}/deals?${params}`, { signal });

  if (!response.ok) {
    throw new Error(`Ошибка сервера: ${response.status}`);
  }

  return response.json();
}