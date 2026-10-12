import { Link } from 'react-router-dom';
import styles from './ErrorPage.module.css';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useToast } from '../context/ToastContext';

export default function NotFoundPage() {

useDocumentTitle('Главная');

  const { user } = useAuth();

  return (
    <section className={styles.box}>
      <p className={styles.code}>404</p>
      <h1>Страница не найдена</h1>
      <p>Возможно, ссылка устарела или была введена с ошибкой.</p>
      <Link to="/" className={styles.btn}>На главную</Link>
    </section>
  );
}