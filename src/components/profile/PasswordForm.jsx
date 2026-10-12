import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { changePassword, getAuthErrorMessage } from '../../services/authService';
import { validatePasswordChange } from '../../utils/validators';
import useForm from '../../hooks/useForm';
import FormField from '../common/FormField';
import styles from './ProfileForm.module.css';

const INITIAL = { currentPassword: '', newPassword: '', confirmPassword: '' };

export default function PasswordForm() {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const { values, isValid, handleChange, handleBlur, touchAll, reset, getError } =
    useForm(INITIAL, validatePasswordChange);

  async function handleSubmit(e) {
    e.preventDefault();
    touchAll();
    if (!isValid) return;

    setSubmitting(true);
    try {
      await changePassword(values.currentPassword, values.newPassword);
      toast.success('Пароль изменён');
      reset();
    } catch (err) {
      const wrongCurrent = ['auth/invalid-credential', 'auth/wrong-password'].includes(err?.code);
      toast.error(wrongCurrent ? 'Текущий пароль указан неверно' : getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormField
        label="Текущий пароль" name="currentPassword" type="password" autoComplete="current-password"
        value={values.currentPassword} onChange={handleChange} onBlur={handleBlur}
        error={getError('currentPassword')}
      />
      <FormField
        label="Новый пароль" name="newPassword" type="password" autoComplete="new-password"
        value={values.newPassword} onChange={handleChange} onBlur={handleBlur}
        error={getError('newPassword')}
      />
      <FormField
        label="Повторите новый пароль" name="confirmPassword" type="password" autoComplete="new-password"
        value={values.confirmPassword} onChange={handleChange} onBlur={handleBlur}
        error={getError('confirmPassword')}
      />
      <button type="submit" className={styles.submit} disabled={submitting}>
        {submitting ? 'Меняем…' : 'Сменить пароль'}
      </button>
    </form>
  );
}