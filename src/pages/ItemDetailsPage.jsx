import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getZoneById } from '../services/zonesService';
import { getBookedHours } from '../services/bookingsService';
import { OPEN_HOUR, CLOSE_HOUR, ZONE_TYPES } from '../services/constants';
import { todayString } from '../utils/date';
import StatusMessage from '../components/common/StatusMessage';
import Spinner from '../components/common/Spinner';
import styles from './ItemDetailsPage.module.css';
import useDocumentTitle from '../hooks/useDocumentTitle';
import ZoneImage from '../components/items/ZoneImage';
import { useToast } from '../context/ToastContext';

const HOURS = Array.from({ length: CLOSE_HOUR - OPEN_HOUR }, (_, i) => OPEN_HOUR + i);

export default function ItemDetailsPage() {
    const { id } = useParams();

    const [zone, setZone] = useState(null);
    useDocumentTitle(zone ? zone.name : 'Загрузка…');
    const [status, setStatus] = useState('loading');
    const [reloadKey, setReloadKey] = useState(0);

    const [date, setDate] = useState(todayString());
    const [bookedHours, setBookedHours] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [slotsError, setSlotsError] = useState(false);
    const [selectedHour, setSelectedHour] = useState(null);

    // 1. Загрузка зоны
    useEffect(() => {
        let ignore = false;
        setStatus('loading');

        getZoneById(id)
            .then((data) => {
                if (ignore) return;
                if (!data) setStatus('notfound');
                else { setZone(data); setStatus('success'); }
            })
            .catch(() => { if (!ignore) setStatus('error'); });

        return () => { ignore = true; };
    }, [id, reloadKey]);

    useEffect(() => {
        if (!date) return;
        let ignore = false;
        setSlotsLoading(true);
        setSlotsError(false);

        getBookedHours(id, date)
            .then((hours) => { if (!ignore) setBookedHours(hours); })
            .catch(() => { if (!ignore) setSlotsError(true); })
            .finally(() => { if (!ignore) setSlotsLoading(false); });

        return () => { ignore = true; };
    }, [id, date, reloadKey]);

    if (status === 'loading') return <Spinner fullPage />;

    if (status === 'notfound') {
        return (
            <StatusMessage title="Зона не найдена" text="Возможно, она была удалена.">
            </StatusMessage>
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

    const isToday = date === todayString();
      const currentHour = new Date().getHours();    

    function hourState(hour) {
        if (bookedHours.includes(hour)) return 'busy';
        if (isToday && hour <= currentHour) return 'past';
        return 'free';
    }

    return (
        <article className={styles.page}>
            <Link to="/items" className={styles.back}>← К каталогу</Link>

            <h1>{zone.name}</h1>
            <p className={styles.sub}>
                {ZONE_TYPES[zone.type] ?? zone.type} · {zone.platform}
            </p>

            <ZoneImage zone={zone} size="hero" />

            {zone.description && <p>{zone.description}</p>}

            <ul className={styles.facts}>
                <li>👥 Вместимость: до {zone.capacity} чел.</li>
                <li>💰 Цена: {zone.pricePerHour} ₸/час</li>
                <li>🕒 Работаем с {OPEN_HOUR}:00 до {CLOSE_HOUR}:00</li>
            </ul>

            {zone.games?.length > 0 && (
                <>
                    <h2>Игры</h2>
                    <ul className={styles.games}>
                        {zone.games.map((g) => <li key={g}>{g}</li>)}
                    </ul>
                </>
            )}

            <h2>Доступное время</h2>
            <label className={styles.dateLabel}>
                Дата
                <input
                    type="date" value={date} min={todayString()}
                    onChange={(e) => { setDate(e.target.value); setSelectedHour(null); }}
                />
            </label>

            {slotsLoading && <Spinner />}

            {slotsError && (
                <StatusMessage
                    title="Не удалось загрузить расписание"
                    actionLabel="Повторить"
                    onAction={() => setReloadKey((k) => k + 1)}
                />
            )}

            {!slotsLoading && !slotsError && (
                <>
                    <div className={styles.grid}>
                        {HOURS.map((hour) => {
                            const state = hourState(hour);
                            const isSelected = selectedHour === hour;
                            return (
                                <button
                                    key={hour}
                                    type="button"
                                    disabled={state !== 'free'}
                                    aria-pressed={isSelected}
                                    onClick={() => setSelectedHour(isSelected ? null : hour)}
                                    className={`${styles.slot} ${styles[state]} ${isSelected ? styles.selected : ''}`}
                                >
                                    {hour}:00
                                </button>
                            );
                        })}
                    </div>
                    <p className={styles.legend}>
                        <span className={styles.dotFree} /> свободно
                        <span className={styles.dotBusy} /> занято
                        <span className={styles.dotPast} /> прошло
                    </p>
                </>
            )}

            {selectedHour !== null ? (
                <Link
                    to={`/bookings/new?zoneId=${zone.id}&date=${date}&hour=${selectedHour}`}
                    className={styles.bookBtn}
                >
                    Забронировать на {selectedHour}:00
                </Link>
            ) : (
                <p className={styles.pickHint}>Выберите свободный час, чтобы забронировать</p>
            )}
        </article>
    );
}