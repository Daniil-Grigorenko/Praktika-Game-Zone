/** Сегодняшняя дата в формате 2026-10-20 (по местному времени) */
export function todayString() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

/** '2026-10-20' → '20 октября 2026 г.' */
export function formatDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Бронь уже закончилась? */
export function isBookingPast(date, startHour, duration) {
  const end = new Date(`${date}T00:00:00`);
  end.setHours(startHour + duration);
  return end < new Date();
}