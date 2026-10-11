import { useEffect, useState } from 'react';
import { getBookedHours } from '../../services/bookingsService';
import { OPEN_HOUR, CLOSE_HOUR, MAX_DURATION, MAX_GUESTS } from '../../services/constants';
import { validateBooking } from '../../utils/validators';
import { todayString } from '../../utils/date';
import useForm from '../../hooks/useForm';
import FormField from '../common/FormField';
import styles from './BookingForm.module.css';

const HOURS = Array.from({ length: CLOSE_HOUR - OPEN_HOUR }, (_, i) => OPEN_HOUR + i);
const DURATIONS = Array.from({ length: MAX_DURATION }, (_, i) => i + 1);

export default function BookingForm({
  zone,
  initialValues,
  ownBooking = null, // при редактировании: своя бронь не считается «занятой»
  submitLabel,
  submitting,
  submitError,
  onSubmit,
  onCancel,
}) {
  const [bookedHours, setBookedHours] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsError, setSlotsError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const maxGuests = Math.min(zone.capacity, MAX_GUESTS);

  // занятые часы на дату, не считая часов самой редактируемой брони
  function getBusy(date) {
    if (ownBooking && ownBooking.date === date) {
      const own = Array.from({ length: ownBooking.duration }, (_, i) => ownBooking.startHour + i);
      return bookedHours.filter((h) => !own.includes(h));
    }
    return bookedHours;
  }

  const { values, isValid, handleChange, handleBlur, touchAll, getError } = useForm(
    initialValues,
    (v) => validateBooking(v, { busyHours: getBusy(v.date), maxGuests })
  );

  // Загрузка занятых часов при смене даты
  useEffect(() => {
    if (!values.date) return;
    let ignore = false;
    setSlotsLoading(true);
    setSlotsError(false);

    getBookedHours(zone.id, values.date)
      .then((hours) => { if (!ignore) setBookedHours(hours); })
      .catch(() => { if (!ignore) setSlotsError(true); })
      .finally(() => { if (!ignore) setSlotsLoading(false); });

    return () => { ignore = true; };
  }, [zone.id, values.date, reloadKey]);

  const busy = getBusy(values.date);
  const isToday = values.date === todayString();
  const currentHour = new Date().getHours();

  function handleSubmit(e) {
    e.preventDefault();
    touchAll();
    if (!isValid || slotsLoading || slotsError) return;

    onSubmit({
      date: values.date,
      startHour: Number(values.startHour),
      duration: Number(values.duration),
      guests: Number(values.guests),
      comment: values.comment.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={styles.form}>
      <div className={styles.zoneInfo}>
        <strong>{zone.name}</strong>
        <span>{zone.platform} · {zone.pricePerHour} ₸/час</span>
      </div>

      <FormField
        label="Дата" name="date" type="date" min={todayString()}
        value={values.date} onChange={handleChange} onBlur={handleBlur}
        error={getError('date')}
      />

      {slotsError && (
        <p className={styles.slotsError}>
          Не удалось проверить занятые часы.{' '}
          <button type="button" onClick={() => setReloadKey((k) => k + 1)}>Повторить</button>
        </p>
      )}

      <FormField
        as="select" label="Время начала" name="startHour"
        value={values.startHour} onChange={handleChange} onBlur={handleBlur}
        error={getError('startHour')}
        disabled={slotsLoading}
      >
        <option value="">{slotsLoading ? 'Загрузка…' : 'Выберите время'}</option>
        {HOURS.map((h) => {
          const isBusy = busy.includes(h);
          const isPast = isToday && h <= currentHour;
          return (
            <option key={h} value={h} disabled={isBusy || isPast}>
              {h}:00{isBusy ? ' (занято)' : ''}{isPast ? ' (прошло)' : ''}
            </option>
          );
        })}
      </FormField>

      <FormField
        as="select" label="Длительность" name="duration"
        value={values.duration} onChange={handleChange} onBlur={handleBlur}
        error={getError('duration')}
      >
        {DURATIONS.map((d) => (
          <option key={d} value={d}>{d} ч.</option>
        ))}
      </FormField>

      <FormField
        label={`Количество гостей (до ${maxGuests})`} name="guests" type="number"
        min="1" max={maxGuests}
        value={values.guests} onChange={handleChange} onBlur={handleBlur}
        error={getError('guests')}
      />

      <FormField
        as="textarea" label="Комментарий (необязательно)" name="comment" rows={3}
        value={values.comment} onChange={handleChange} onBlur={handleBlur}
        error={getError('comment')}
      />
      <p className={styles.counter}>{values.comment.length}/300</p>

      {values.startHour !== '' && Number(values.duration) > 0 && (
        <p className={styles.total}>
          Итого: {Number(values.duration) * zone.pricePerHour} ₸
        </p>
      )}

      {submitError && <p className={styles.submitError} role="alert">{submitError}</p>}

      <div className={styles.actions}>
        <button type="button" className={styles.cancel} onClick={onCancel}>Отмена</button>
        <button type="submit" className={styles.submit} disabled={submitting || slotsLoading}>
          {submitting ? 'Сохраняем…' : submitLabel}
        </button>
      </div>
    </form>
  );
}