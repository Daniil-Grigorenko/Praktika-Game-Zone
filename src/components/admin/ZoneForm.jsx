import { validateZone, parseGames } from '../../utils/validators';
import useForm from '../../hooks/useForm';
import FormField from '../common/FormField';
import styles from './ZoneForm.module.css';

export default function ZoneForm({
  initialValues,
  submitLabel,
  submitting,
  submitError,
  onSubmit,
  onCancel,
}) {
  const { values, isValid, handleChange, handleBlur, touchAll, getError } =
    useForm(initialValues, validateZone);

  function handleSubmit(e) {
    e.preventDefault();
    touchAll();
    if (!isValid) return;

    onSubmit({
      name: values.name.trim(),
      type: values.type,
      platform: values.platform.trim(),
      description: values.description.trim(),
      imageUrl: values.imageUrl.trim(),
      capacity: Number(values.capacity),
      pricePerHour: Number(values.pricePerHour),
      isActive: values.isActive === 'true',
      games: parseGames(values.games),
    });
  }

  const field = (name) => ({
    name,
    value: values[name],
    onChange: handleChange,
    onBlur: handleBlur,
    error: getError(name),
  });

  return (
    <form onSubmit={handleSubmit} noValidate className={styles.form}>
      <FormField label="Название" {...field('name')} />

      <div className={styles.row}>
        <FormField as="select" label="Тип" {...field('type')}>
          <option value="console">Консоли</option>
          <option value="vr">VR</option>
        </FormField>
        <FormField label="Платформа" {...field('platform')} />
      </div>

      <FormField as="textarea" rows={3} label="Описание" {...field('description')} />

      <FormField label="Ссылка на картинку" type="url" {...field('imageUrl')} />

      <div className={styles.row}>
        <FormField label="Вместимость (чел.)" type="number" min="1" max="20" {...field('capacity')} />
        <FormField label="Цена за час (₸)" type="number" min="0" {...field('pricePerHour')} />
      </div>

      <FormField label="Игры (через запятую)" {...field('games')} />
      <p className={styles.hint}>Например: EA FC 26, Tekken 8</p>

      <FormField as="select" label="Статус" {...field('isActive')}>
        <option value="true">Активна (видна в каталоге)</option>
        <option value="false">Скрыта</option>
      </FormField>

      {submitError && <p className={styles.submitError} role="alert">{submitError}</p>}

      <div className={styles.actions}>
        <button type="button" className={styles.cancel} onClick={onCancel}>Отмена</button>
        <button type="submit" className={styles.submit} disabled={submitting}>
          {submitting ? 'Сохраняем…' : submitLabel}
        </button>
      </div>
    </form>
  );
}