import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);
  const linkClass = ({ isActive }) => (isActive ? styles.active : styles.link);

  async function handleLogout() {
    await logout();
    closeMenu();
    navigate('/');
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.logo} onClick={closeMenu}>
          🎮 Super puper - GameZone
        </NavLink>

        <button
          className={styles.burger}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Открыть меню"
        >
          ☰
        </button>

        <nav className={`${styles.nav} ${open ? styles.navOpen : ''}`}>
          <NavLink to="/items" className={linkClass} onClick={closeMenu}>Каталог</NavLink>
          <NavLink to="/explore" className={linkClass} onClick={closeMenu}>Explore</NavLink>

          {user ? (
            <>
              <NavLink to="/dashboard" className={linkClass} onClick={closeMenu}>Кабинет</NavLink>
              <NavLink to="/bookings/new" className={linkClass} onClick={closeMenu}>Забронировать</NavLink>
              <button className={styles.logout} onClick={handleLogout}>Выйти</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass} onClick={closeMenu}>Войти</NavLink>
              <NavLink to="/register" className={linkClass} onClick={closeMenu}>Регистрация</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}