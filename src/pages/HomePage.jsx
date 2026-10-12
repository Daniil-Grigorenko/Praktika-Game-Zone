import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getZones } from '../services/zonesService';
import ZoneCard from '../components/items/ZoneCard';
import styles from './HomePage.module.css';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useToast } from '../context/ToastContext';


const STEPS = [
  { icon: '🔎', title: 'Выберите зону', text: 'Консоли или VR: посмотрите описание, игры и цену.' },
  { icon: '📅', title: 'Укажите время', text: 'Свободные часы видны сразу, занятые выбрать нельзя.' },
  { icon: '✅', title: 'Забронируйте', text: 'Бронь появится в личном кабинете, её можно изменить или отменить.' },
];

export default function HomePage() {
    useDocumentTitle('Главная');
  const { user } = useAuth();
  const [zones, setZones] = useState([]);

  useEffect(() => {
    let ignore = false;
    getZones()
      .then((data) => { if (!ignore) setZones(data.slice(0, 3)); })
      .catch(() => {});
    return () => { ignore = true; };
  }, []);

  return (
    <>
      <section className={styles.hero}>
        <h1>Бронирование игровой зоны</h1>
        <p>Консоли и VR для вас и ваших друзей. Выберите время и играйте.</p>
        <div className={styles.buttons}>
          <Link to="/items" className={styles.primary}>Смотреть зоны</Link>
          {user ? (
            <Link to="/dashboard" className={styles.secondary}>Мои брони</Link>
          ) : (
            <Link to="/register" className={styles.secondary}>Создать аккаунт</Link>
          )}
        </div>
      </section>

      <section>
        <h2>Как это работает</h2>
        <div className={styles.steps}>
          {STEPS.map((s) => (
            <div key={s.title} className={styles.step}>
              <span className={styles.icon}>{s.icon}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {zones.length > 0 && (
        <section className={styles.popular}>
          <h2>Наши зоны</h2>
          <div className={styles.grid}>
            {zones.map((z) => <ZoneCard key={z.id} zone={z} />)}
          </div>
        </section>
      )}
    </>
  );
}