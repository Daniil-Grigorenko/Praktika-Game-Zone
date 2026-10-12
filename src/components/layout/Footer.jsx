import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { OPEN_HOUR, CLOSE_HOUR, MAX_DURATION } from '../../services/constants';
import styles from './Footer.module.css';

export default function Footer() {
  const { user } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Link to="/" className={styles.logo}>🎮 GameZone</Link>
          <p>Бронирование игровых зон: консоли и VR для вас и ваших друзей.</p>
        </div>

        <nav className={styles.col} aria-label="Навигация по сайту">
          <h3>Разделы</h3>
          <Link to="/items">Каталог зон</Link>
          <Link to="/explore">Исследуйте игры</Link>
          {user ? (
            <>
              <Link to="/dashboard">Личный кабинет</Link>
              <Link to="/profile">Профиль</Link>
            </>
          ) : (
            <>
              <Link to="/login">Войти</Link>
              <Link to="/register">Регистрация</Link>
            </>
          )}
        </nav>

        <div className={styles.col}>
          <h3>Контакты</h3>
          <p>📍 ул. Примерная, 1</p>
          <p>📞 <a href="tel:+70000000000">+7 (000) 000-00-00</a></p>
          <p>✉️ <a href="mailto:info@gamezone.example">info@gamezone.example</a></p>
        </div>

        <div className={styles.col}>
          <h3>Режим работы</h3>
          <p>Ежедневно, {OPEN_HOUR}:00–{CLOSE_HOUR}:00</p>
          <p>Бронь: от 1 до {MAX_DURATION} часов</p>
        </div>
      </div>

      <div className={styles.bottom}>
        <span>© {year} GameZone. Учебный проект.</span>
        <span>
          Данные об играх:{' '}
          <a href="https://www.cheapshark.com" target="_blank" rel="noopener noreferrer">
            CheapShark API
          </a>
        </span>
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          Наверх ↑
        </button>
      </div>
    </footer>
  );
}