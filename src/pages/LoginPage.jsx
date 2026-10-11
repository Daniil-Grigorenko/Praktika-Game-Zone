import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAuthErrorMessage } from '../services/authService';
import styles from './AuthPage.module.css';

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // откуда пришёл пользователь (если его перекинул ProtectedRoute)
  const from = location.state?.from;
  const redirectTo = from ? `${from.pathname}${from.search}${from.hash}` : '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // уже авторизован — на страницу назначения
  if (!loading && user) return <Navigate to={redirectTo} replace />;

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={styles.card}>
      <h1>Вход</h1>
      {from && <p className={styles.hint}>Войдите, чтобы открыть страницу {from.pathname}</p>}

      <form onSubmit={handleSubmit} noValidate>
        <label className={styles.field}>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label className={styles.field}>
          Пароль
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </label>

        {error && <p className={styles.error} role="alert">{error}</p>}

        <button type="submit" className={styles.submit} disabled={submitting}>
          {submitting ? 'Входим…' : 'Войти'}
        </button>
      </form>

      <p>Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></p>
    </section>
  );
}