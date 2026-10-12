import styles from './ToastContainer.module.css';

export default function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className={styles.container} aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${styles.toast} ${styles[t.type]}`}
          role={t.type === 'error' ? 'alert' : 'status'}
        >
          <span>{t.message}</span>
          <button
            type="button"
            className={styles.close}
            onClick={() => onDismiss(t.id)}
            aria-label="Закрыть уведомление"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}