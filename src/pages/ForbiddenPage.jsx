import { Link } from 'react-router-dom';
import styles from './ErrorPage.module.css';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useToast } from '../context/ToastContext';

export default function ForbiddenPage() {
    useDocumentTitle('Главная');

  return (
    <section className={styles.box}>
      <p className={styles.code}>403</p>
      <h1>Доступ запрещён</h1>
      <p>У вас нет прав для просмотра этой страницы.</p>
      <Link to="/dashboard" className={styles.btn}>В личный кабинет</Link>
    </section>
  );
}