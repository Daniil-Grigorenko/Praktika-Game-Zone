import { NavLink } from 'react-router-dom';
import styles from './AdminTabs.module.css';

export default function AdminTabs() {
  const cls = ({ isActive }) => (isActive ? styles.active : styles.tab);
  return (
    <nav className={styles.tabs} aria-label="Разделы админ-панели">
      <NavLink to="/admin/zones" className={cls}>Зоны</NavLink>
      <NavLink to="/admin/users" className={cls}>Пользователи</NavLink>
    </nav>
  );
}