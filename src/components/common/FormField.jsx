import styles from './FormField.module.css';

export default function FormField({
  label,
  name,
  error,
  as: Component = 'input',
  children,
  ...props
}) {
  const errorId = `${name}-error`;
  return (
    <div className={styles.field}>
      <label htmlFor={name}>{label}</label>
      <Component
        id={name}
        name={name}
        className={error ? styles.invalid : ''}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...props}
      >
        {children}
      </Component>
      {error && <span id={errorId} className={styles.error}>{error}</span>}
    </div>
  );
}