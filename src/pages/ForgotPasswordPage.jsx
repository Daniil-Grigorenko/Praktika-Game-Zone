import { useState } from 'react';
import { Link } from 'react-router-dom';
import { resetPassword, getAuthErrorMessage } from '../services/authService';
import { validateReset } from '../utils/validators';
import useForm from '../hooks/useForm';
import useDocumentTitle from '../hooks/useDocumentTitle';
import FormField from '../components/common/FormField';
import styles from './AuthPage.module.css';
import { useToast } from '../context/ToastContext';

export default function ForgotPasswordPage() {
  useDocumentTitle('Сброс пароля');

  const { values, isValid, handleChange, handleBlur, touchAll, getError } =
    useForm({ email: '' }, validateReset);

  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    touchAll();
    if (!isValid) return;

    setSubmitting(true);
    try {
      await resetPassword(values.email.trim());
      setSent(true);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={styles.card}>
      <h1>Сброс пароля</h1>

      {sent ? (
        <>
          <p className={styles.success} role="status">
            Если аккаунт с адресом {values.email.trim()} существует, мы отправили на него письмо
            со ссылкой для смены пароля. Проверьте также папку «Спам».
          </p>
          <Link to="/login">← Вернуться ко входу</Link>
        </>
      ) : (
        <>
          <p className={styles.hint}>
            Введите email, указанный при регистрации. Мы отправим ссылку для смены пароля.
          </p>
          <form onSubmit={handleSubmit} noValidate>
            <FormField
              label="Email" name="email" type="email" autoComplete="email"
              value={values.email} onChange={handleChange} onBlur={handleBlur}
              error={getError('email')}
            />

            {error && <p className={styles.error} role="alert">{error}</p>}

            <button type="submit" className={styles.submit} disabled={submitting}>
              {submitting ? 'Отправляем…' : 'Отправить ссылку'}
            </button>
          </form>
          <p><Link to="/login">← Вернуться ко входу</Link></p>
        </>
      )}
    </section>
  );
}