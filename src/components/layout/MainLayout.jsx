import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';
import styles from './MainLayout.module.css';

export default function MainLayout() {
  const location = useLocation();
  const { isBlocked, accountDeleted } = useAuth();

  return (
    <div className={styles.shell}>
      <Navbar />
      {accountDeleted && (
        <div className={styles.blockedBanner} role="alert">
          Ваш аккаунт был удалён администратором. Вход на сайт недоступен.
        </div>
      )}
      {isBlocked && !accountDeleted && (
        <div className={styles.blockedBanner} role="alert">
          Ваш аккаунт заблокирован администратором: создавать и изменять брони нельзя.
        </div>
      )}
      <main className={styles.main}>
        <div key={location.pathname} className={styles.page}>
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}