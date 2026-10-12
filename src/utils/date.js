
export function todayString() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

export function formatDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function isBookingPast(date, startHour, duration) {
  const end = new Date(`${date}T00:00:00`);
  end.setHours(startHour + duration);
  return end < new Date();
}

export function formatDateTime(date) {
  if (!date) return '—';
  return date.toLocaleString('ru-RU', { dateStyle: 'long', timeStyle: 'short' });
}