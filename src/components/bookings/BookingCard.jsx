import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/date';
import styles from './BookingCard.module.css';

export default function BookingCard({ booking, past = false, onDelete }) {
  const end = booking.startHour + booking.duration;

  return (
    <article className={`${styles.card} ${past ? styles.past : ''}`}>
      <div className={styles.info}>
        <h3>{booking.zoneName}</h3>
        <p>📅 {formatDate(booking.date)}</p>
        <p>🕒 {booking.startHour}:00–{end}:00 ({booking.duration} ч.)</p>
        <p>👥 Гостей: {booking.guests}</p>
        {booking.comment && <p className={styles.comment}>💬 {booking.comment}</p>}
      </div>

      <div className={styles.actions}>
        {!past && (
          <Link to={`/bookings/${booking.id}/edit`} className={styles.edit}>Изменить</Link>
        )}
        <button className={styles.delete} onClick={() => onDelete(booking)}>
          Удалить
        </button>
      </div>
    </article>
  );
}