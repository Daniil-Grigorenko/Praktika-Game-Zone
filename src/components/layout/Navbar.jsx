import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);
  const linkClass = ({ isActive }) => (isActive ? styles.active : styles.link);

  async function handleLogout() {
    await logout();
    closeMenu();
    toast.info('Вы вышли из аккаунта');
    navigate('/');
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.logo} onClick={closeMenu} aria-label="GameZone, на главную">
          <span className={styles.logoIcon} aria-hidden="true">🎮</span>
          <span className={styles.logoText}>
            Game<span className={styles.logoAccent}>Zone</span>
          </span>
        </NavLink>

        <button
          className={styles.burger}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Открыть меню"
        >
          {open ? '✕' : '☰'}
        </button>

        <nav className={`${styles.nav} ${open ? styles.navOpen : ''}`}>
          <NavLink to="/items" className={linkClass} onClick={closeMenu}>Каталог</NavLink>
          <NavLink to="/explore" className={linkClass} onClick={closeMenu}>Explore</NavLink>

          {user ? (
            <>
              <NavLink to="/dashboard" className={linkClass} onClick={closeMenu}>Кабинет</NavLink>
              <NavLink to="/bookings/new" className={linkClass} onClick={closeMenu}>Забронировать</NavLink>
              <NavLink to="/profile" className={linkClass} onClick={closeMenu}>Профиль</NavLink>
              {isAdmin && (
                <NavLink to="/admin/zones" className={linkClass} onClick={closeMenu}>Админ</NavLink>
              )}
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass} onClick={closeMenu}>Войти</NavLink>
              <NavLink to="/register" className={linkClass} onClick={closeMenu}>Регистрация</NavLink>
            </>
          )}

          <button
            type="button"
            className={styles.themeBtn}
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
            title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {user && <button className={styles.logout} onClick={handleLogout}>Выйти</button>}
        </nav>
      </div>
    </header>
  );
}