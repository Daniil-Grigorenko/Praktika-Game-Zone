import { useEffect, useState } from 'react';
import styles from './ZoneImage.module.css';

export default function ZoneImage({ zone, size = 'card' }) {
  const [failed, setFailed] = useState(false);

  // если у зоны сменилась ссылка, пробуем загрузить снова
  useEffect(() => { setFailed(false); }, [zone.imageUrl]);

  const hasImage = Boolean(zone.imageUrl) && !failed;

  return (
    <div className={`${styles.box} ${size === 'hero' ? styles.hero : styles.card}`}>
      {hasImage ? (
        <img
          src={zone.imageUrl}
          alt={zone.name}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className={styles.placeholder} aria-hidden="true">
          {zone.type === 'vr' ? '🥽' : '🎮'}
        </span>
      )}
    </div>
  );
}