import { useEffect } from 'react';
import styles from './ConfirmDialog.module.css';

export default function ConfirmDialog({
  title,
  text,
  confirmLabel = 'Подтвердить',
  loadingLabel = 'Удаляем…',
  loading = false,
  onConfirm,
  onCancel,
}) {

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && !loading) onCancel();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel, loading]);

  return (
    <div className={styles.overlay} onClick={() => !loading && onCancel()}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title">{title}</h2>
        {text && <p>{text}</p>}
        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onCancel} disabled={loading}>
            Отмена
          </button>
          <button className={styles.confirm} onClick={onConfirm} disabled={loading}>
            {loading ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}