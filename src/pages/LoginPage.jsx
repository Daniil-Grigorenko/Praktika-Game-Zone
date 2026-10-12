import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAuthErrorMessage } from '../services/authService';
import { validateLogin } from '../utils/validators';
import useForm from '../hooks/useForm';
import useDocumentTitle from '../hooks/useDocumentTitle';
import FormField from '../components/common/FormField';
import styles from './AuthPage.module.css';
import { useToast } from '../context/ToastContext';

const INITIAL = { email: '', password: '' };

export default function LoginPage() {
  useDocumentTitle('Вход');

  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from;
  const redirectTo = from ? `${from.pathname}${from.search}${from.hash}` : '/dashboard';

  const { values, isValid, handleChange, handleBlur, touchAll, getError } =
    useForm(INITIAL, validateLogin);

  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to={redirectTo} replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');
    touchAll();
    if (!isValid) return;

    setSubmitting(true);
    try {
      await login({ email: values.email.trim(), password: values.password });
      toast.success('Вы вошли в аккаунт');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setSubmitError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={styles.card}>
      <h1>Вход</h1>
      {from && <p className={styles.hint}>Войдите, чтобы открыть страницу {from.pathname}</p>}

      <form onSubmit={handleSubmit} noValidate>
        <FormField
          label="Email" name="email" type="email" autoComplete="email"
          value={values.email} onChange={handleChange} onBlur={handleBlur}
          error={getError('email')}
        />
        <FormField
          label="Пароль" name="password" type="password" autoComplete="current-password"
          value={values.password} onChange={handleChange} onBlur={handleBlur}
          error={getError('password')}
        />

        {submitError && <p className={styles.error} role="alert">{submitError}</p>}

        <button type="submit" className={styles.submit} disabled={submitting}>
          {submitting ? 'Входим…' : 'Войти'}
        </button>
      </form>

      <p className={styles.links}>
        <Link to="/forgot-password">Забыли пароль?</Link>
      </p>
      <p>Нет аккаунта? <Link to="/register" state={location.state}>Зарегистрироваться</Link></p>
    </section>
  );
}