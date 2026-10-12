import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAuthErrorMessage } from '../services/authService';
import { validateRegister } from '../utils/validators';
import useForm from '../hooks/useForm';
import FormField from '../components/common/FormField';
import styles from './AuthPage.module.css';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useToast } from '../context/ToastContext';

const INITIAL = { displayName: '', email: '', password: '', confirmPassword: '' };

export default function RegisterPage() {

    useDocumentTitle('Регистрация');
  const { user, loading, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from;
  const redirectTo = from ? `${from.pathname}${from.search}${from.hash}` : '/dashboard';

  const { values, isValid, handleChange, handleBlur, touchAll, getError } =
    useForm(INITIAL, validateRegister);

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
      await register({
        displayName: values.displayName.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      toast.success('Аккаунт создан. Добро пожаловать!');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setSubmitError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={styles.card}>
      <h1>Регистрация</h1>

      <form onSubmit={handleSubmit} noValidate>
        <FormField
          label="Имя" name="displayName" autoComplete="name"
          value={values.displayName} onChange={handleChange} onBlur={handleBlur}
          error={getError('displayName')}
        />
        <FormField
          label="Email" name="email" type="email" autoComplete="email"
          value={values.email} onChange={handleChange} onBlur={handleBlur}
          error={getError('email')}
        />
        <FormField
          label="Пароль" name="password" type="password" autoComplete="new-password"
          value={values.password} onChange={handleChange} onBlur={handleBlur}
          error={getError('password')}
        />
        <FormField
          label="Повторите пароль" name="confirmPassword" type="password" autoComplete="new-password"
          value={values.confirmPassword} onChange={handleChange} onBlur={handleBlur}
          error={getError('confirmPassword')}
        />

        {submitError && <p className={styles.error} role="alert">{submitError}</p>}

        <button type="submit" className={styles.submit} disabled={submitting}>
          {submitting ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
        </button>
      </form>

      <p>Уже есть аккаунт? <Link to="/login">Войти</Link></p>
    </section>
  );
}