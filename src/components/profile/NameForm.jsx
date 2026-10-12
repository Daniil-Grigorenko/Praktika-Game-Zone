import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { updateUserName, getAuthErrorMessage } from '../../services/authService';
import { validateName } from '../../utils/validators';
import useForm from '../../hooks/useForm';
import FormField from '../common/FormField';
import styles from './ProfileForm.module.css';
import { updateOwnUserDoc } from '../../services/usersService';

export default function NameForm() {
    const { user, refreshUser } = useAuth();
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);

    const { values, isValid, handleChange, handleBlur, touchAll, getError } =
        useForm({ displayName: user.displayName ?? '' }, validateName);

    const unchanged = values.displayName.trim() === (user.displayName ?? '');

    async function handleSubmit(e) {
        e.preventDefault();
        touchAll();
        if (!isValid) return;

        setSubmitting(true);
        try {
            await updateUserName(values.displayName.trim());
            try {
                await updateOwnUserDoc(user.uid, { displayName: values.displayName.trim() });
            } catch {

            }
            await refreshUser();

            toast.success('Имя обновлено');
        } catch (err) {
            toast.error(getAuthErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} noValidate>
            <FormField
                label="Имя" name="displayName" autoComplete="name"
                value={values.displayName} onChange={handleChange} onBlur={handleBlur}
                error={getError('displayName')}
            />
            <button type="submit" className={styles.submit} disabled={submitting || unchanged}>
                {submitting ? 'Сохраняем…' : 'Сохранить имя'}
            </button>
        </form>
    );
}