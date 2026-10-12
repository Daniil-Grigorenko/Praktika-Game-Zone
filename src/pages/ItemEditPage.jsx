import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getZoneById } from '../services/zonesService';
import { getBookingById, updateBooking, getBookingErrorMessage } from '../services/bookingsService';
import { isBookingPast } from '../utils/date';
import BookingForm from '../components/bookings/BookingForm';
import StatusMessage from '../components/common/StatusMessage';
import Spinner from '../components/common/Spinner';
import ForbiddenPage from './ForbiddenPage';
import NotFoundPage from './NotFoundPage';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useToast } from '../context/ToastContext';

export default function ItemEditPage() {
    useDocumentTitle('Редактирование брони');

    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [booking, setBooking] = useState(null);
    const [zone, setZone] = useState(null);
    const [status, setStatus] = useState('loading');
    const [reloadKey, setReloadKey] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        let ignore = false;
        setStatus('loading');

        async function load() {
            try {
                const b = await getBookingById(id);
                if (ignore) return;
                if (!b) { setStatus('notfound'); return; }
                if (b.ownerId !== user.uid) { setStatus('forbidden'); return; }

                const z = await getZoneById(b.zoneId);
                if (ignore) return;
                if (!z) { setStatus('error'); return; }

                setBooking(b);
                setZone(z);
                setStatus('success');
            } catch (err) {
                if (ignore) return;
                setStatus(err?.code === 'permission-denied' ? 'forbidden' : 'error');
            }
        }
        load();

        return () => { ignore = true; };
    }, [id, user.uid, reloadKey]);

    if (status === 'loading') return <Spinner fullPage />;
    if (status === 'notfound') return <NotFoundPage />;
    if (status === 'forbidden') return <ForbiddenPage />;

    if (status === 'error') {
        return (
            <StatusMessage
                title="Не удалось загрузить бронь"
                actionLabel="Повторить"
                onAction={() => setReloadKey((k) => k + 1)}
            />
        );
    }

    if (isBookingPast(booking.date, booking.startHour, booking.duration)) {
        return (
            <StatusMessage
                title="Эту бронь изменить нельзя"
                text="Она уже прошла."
                actionLabel="В личный кабинет"
                onAction={() => navigate('/dashboard')}
            />
        );
    }

    const initialValues = {
        date: booking.date,
        startHour: String(booking.startHour),
        duration: String(booking.duration),
        guests: String(booking.guests),
        comment: booking.comment ?? '',
    };

    async function handleSubmit(data) {
        setSubmitError('');
        setSubmitting(true);
        try {
            await updateBooking(user.uid, booking, data);
            toast.success('Изменения сохранены');
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setSubmitError(getBookingErrorMessage(err));
            setSubmitting(false);
        }
    }

    return (
        <section>
            <Link to="/dashboard">← В личный кабинет</Link>
            <h1>Редактирование брони</h1>
            <BookingForm
                zone={zone}
                initialValues={initialValues}
                ownBooking={booking}
                submitLabel="Сохранить"
                submitting={submitting}
                submitError={submitError}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/dashboard')}
            />
        </section>
    );
}