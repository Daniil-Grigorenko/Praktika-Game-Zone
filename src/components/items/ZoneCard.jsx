import { Link } from 'react-router-dom';
import { ZONE_TYPES } from '../../services/constants';
import styles from './ZoneCard.module.css';

export default function ZoneCard({ zone }) {
  return (
    <article className={styles.card}>
      <div className={styles.cover} aria-hidden="true">
        {zone.type === 'vr' ? '🥽' : '🎮'}
      </div>
      <div className={styles.body}>
        <span className={styles.badge}>{ZONE_TYPES[zone.type] ?? zone.type}</span>
        <h3>{zone.name}</h3>
        <p className={styles.platform}>{zone.platform}</p>
        <p className={styles.meta}>
          👥 до {zone.capacity} чел. · {zone.pricePerHour} ₸/час
        </p>
        <Link to={`/items/${zone.id}`} className={styles.link}>Подробнее</Link>
      </div>
    </article>
  );
}