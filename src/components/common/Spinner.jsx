import styles from './Spinner.module.css';

export default function Spinner({ fullPage = false }) {
  return (
    <div className={fullPage ? styles.fullPage : styles.inline} role="status" aria-live="polite">
      <div className={styles.circle} />
      <span className={styles.srOnly}>Загрузка…</span>
    </div>
  );
}