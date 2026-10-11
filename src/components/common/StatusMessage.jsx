import styles from './StatusMessage.module.css';

export default function StatusMessage({ title, text, actionLabel, onAction }) {
  return (
    <div className={styles.box} role="status">
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {actionLabel && (
        <button className={styles.btn} onClick={onAction}>{actionLabel}</button>
      )}
    </div>
  );
}