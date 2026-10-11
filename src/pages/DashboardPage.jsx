import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  subscribeToUserBookings,
  deleteBooking,
  getBookingErrorMessage,
} from '../services/bookingsService';
import { isBookingPast } from '../utils/date';
import BookingCard from '../components/bookings/BookingCard';
import ConfirmDialog from '../components/common/ConfirmDialog';
import StatusMessage from '../components/common/StatusMessage';
import Spinner from '../components/common/Spinner';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | error | success
  const [reloadKey, setReloadKey] = useState(0);

  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Подписка на брони пользователя в реальном времени
  useEffect(() => {
    setStatus('loading');
    const unsubscribe = subscribeToUserBookings(
      user.uid,
      (list) => { setBookings(list); setStatus('success'); },
      () => setStatus('error')
    );
    return unsubscribe; // отписка при выходе со страницы
  }, [user.uid, reloadKey]);

  const { upcoming, past } = useMemo(() => {
    const up = [];
    const old = [];
    bookings.forEach((b) =>
      (isBookingPast(b.date, b.startHour, b.duration) ? old : up).push(b)
    );
    return { upcoming: up, past: old.reverse() };
  }, [bookings]);

  async function handleConfirmDelete() {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteBooking(toDelete);
      setToDelete(null); // список обновится сам благодаря подписке
    } catch (err) {
      setDeleteError(getBookingErrorMessage(err));
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section>
      <h1>Личный кабинет</h1>
      <p className={styles.hello}>
        Привет, {user.displayName || user.email}! Здесь ваши бронирования.
      </p>

      {deleteError && <p className={styles.error} role="alert">{deleteError}</p>}

      {status === 'loading' && <Spinner />}

      {status === 'error' && (
        <StatusMessage
          title="Не удалось загрузить брони"
          actionLabel="Повторить"
          onAction={() => setReloadKey((k) => k + 1)}
        />
      )}

      {status === 'success' && bookings.length === 0 && (
        <StatusMessage
          title="У вас пока нет броней"
          text="Выберите зону в каталоге и забронируйте время."
        />
      )}

      {upcoming.length > 0 && (
        <>
          <h2>Предстоящие</h2>
          <div className={styles.list}>
            {upcoming.map((b) => (
              <BookingCard key={b.id} booking={b} onDelete={setToDelete} />
            ))}
          </div>
        </>
      )}

      {past.length > 0 && (
        <>
          <h2>Прошедшие</h2>
          <div className={styles.list}>
            {past.map((b) => (
              <BookingCard key={b.id} booking={b} past onDelete={setToDelete} />
            ))}
          </div>
        </>
      )}

      <Link to="/items" className={styles.catalogLink}>Перейти в каталог зон</Link>

      {toDelete && (
        <ConfirmDialog
          title="Удалить бронь?"
          text={`${toDelete.zoneName}, ${toDelete.date}, ${toDelete.startHour}:00. Это действие нельзя отменить.`}
          confirmLabel="Удалить"
          loading={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </section>
  );
}