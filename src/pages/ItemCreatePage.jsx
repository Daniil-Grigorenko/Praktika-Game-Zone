import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getZoneById } from '../services/zonesService';
import { createBooking, getBookingErrorMessage } from '../services/bookingsService';
import { todayString } from '../utils/date';
import useDocumentTitle from '../hooks/useDocumentTitle';
import BookingForm from '../components/bookings/BookingForm';
import StatusMessage from '../components/common/StatusMessage';
import Spinner from '../components/common/Spinner';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default function ItemCreatePage() {
  useDocumentTitle('Новая бронь');

  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const zoneId = params.get('zoneId');
  const dateParam = params.get('date');
  const hourParam = params.get('hour');

  const [zone, setZone] = useState(null);
  const [status, setStatus] = useState('loading');
  const [reloadKey, setReloadKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!zoneId) return;
    let ignore = false;
    setStatus('loading');

    getZoneById(zoneId)
      .then((data) => {
        if (ignore) return;
        if (!data) setStatus('notfound');
        else { setZone(data); setStatus('success'); }
      })
      .catch(() => { if (!ignore) setStatus('error'); });

    return () => { ignore = true; };
  }, [zoneId, reloadKey]);

  if (!zoneId) {
    return (
      <StatusMessage
        title="Сначала выберите зону"
        text="Откройте нужную зону в каталоге и нажмите «Забронировать»."
        actionLabel="Перейти в каталог"
        onAction={() => navigate('/items')}
      />
    );
  }

  if (status === 'loading') return <Spinner fullPage />;

  if (status === 'notfound') {
    return (
      <StatusMessage
        title="Зона не найдена"
        actionLabel="Перейти в каталог"
        onAction={() => navigate('/items')}
      />
    );
  }

  if (status === 'error') {
    return (
      <StatusMessage
        title="Не удалось загрузить зону"
        actionLabel="Повторить"
        onAction={() => setReloadKey((k) => k + 1)}
      />
    );
  }

  const initialValues = {
    date: dateParam && DATE_RE.test(dateParam) && dateParam >= todayString() ? dateParam : todayString(),
    startHour: hourParam && /^\d+$/.test(hourParam) ? hourParam : '',
    duration: '1',
    guests: '1',
    comment: '',
  };

  async function handleSubmit(data) {
    setSubmitError('');
    setSubmitting(true);

    try {
      await createBooking(user.uid, { ...data, zoneId: zone.id, zoneName: zone.name });
    } catch (err) {
      console.error(err);
      setSubmitError(getBookingErrorMessage(err));
      setSubmitting(false);
      return;
    }

    toast.success('Бронь создана');
    navigate('/dashboard', { replace: true });
  }

  return (
    <section>
      <Link to={`/items/${zone.id}`}>← К зоне</Link>
      <h1>Новая бронь</h1>
      <BookingForm
        zone={zone}
        initialValues={initialValues}
        submitLabel="Забронировать"
        submitting={submitting}
        submitError={submitError}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
      />
    </section>
  );
}