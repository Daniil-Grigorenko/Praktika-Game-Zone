import { useAuth } from '../context/AuthContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import NameForm from '../components/profile/NameForm';
import PasswordForm from '../components/profile/PasswordForm';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  useDocumentTitle('Профиль');

  const { user, role } = useAuth();
const roleLabel = { owner: 'Владелец', admin: 'Администратор', user: 'Пользователь' }[role];
  const initial = (user.displayName || user.email || '?')[0].toUpperCase();

  return (
    <section className={styles.page}>
      <h1>Профиль</h1>

      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.avatar} aria-hidden="true">{initial}</div>
          <div>
            <strong>{user.displayName || 'Без имени'}</strong>
            <p className={styles.muted}>{roleLabel}</p>
          </div>
        </div>

        <dl className={styles.info}>
          <dt>Email</dt>
          <dd>{user.email}</dd>
        </dl>
      </div>

      <div className={styles.card}>
        <h2>Изменить имя</h2>
        <NameForm />
      </div>

      <div className={styles.card}>
        <h2>Сменить пароль</h2>
        <PasswordForm />
      </div>
    </section>
  );
}