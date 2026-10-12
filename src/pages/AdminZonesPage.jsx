import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllZones } from '../services/zonesService';
import { deleteZone, updateZone } from '../services/adminService';
import { ZONE_TYPES } from '../services/constants';
import { useToast } from '../context/ToastContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import ConfirmDialog from '../components/common/ConfirmDialog';
import StatusMessage from '../components/common/StatusMessage';
import Spinner from '../components/common/Spinner';
import styles from './AdminZonesPage.module.css';
import AdminTabs from '../components/admin/AdminTabs';

export default function AdminZonesPage() {
  useDocumentTitle('Управление зонами');
  const toast = useToast();

  const [zones, setZones] = useState([]);
  const [status, setStatus] = useState('loading');
  const [reloadKey, setReloadKey] = useState(0);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let ignore = false;
    setStatus('loading');

    getAllZones()
      .then((data) => { if (!ignore) { setZones(data); setStatus('success'); } })
      .catch(() => { if (!ignore) setStatus('error'); });

    return () => { ignore = true; };
  }, [reloadKey]);

  async function handleToggle(zone) {
    const next = zone.isActive === false;
    try {
      await updateZone(zone.id, { isActive: next });
      setZones((prev) => prev.map((z) => (z.id === zone.id ? { ...z, isActive: next } : z)));
      toast.success(next ? 'Зона снова в каталоге' : 'Зона скрыта из каталога');
    } catch {
      toast.error('Не удалось изменить статус зоны');
    }
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      await deleteZone(toDelete.id);
      setZones((prev) => prev.filter((z) => z.id !== toDelete.id));
      toast.success('Зона удалена');
    } catch {
      toast.error('Не удалось удалить зону');
    } finally {
      setToDelete(null);
      setDeleting(false);
    }
  }

  return (
    <section>
        <AdminTabs />
      <div className={styles.head}>
        <h1>Управление зонами</h1>
        <Link to="/admin/zones/new" className={styles.add}>+ Добавить зону</Link>
      </div>

      {status === 'loading' && <Spinner />}

      {status === 'error' && (
        <StatusMessage
          title="Не удалось загрузить зоны"
          actionLabel="Повторить"
          onAction={() => setReloadKey((k) => k + 1)}
        />
      )}

      {status === 'success' && zones.length === 0 && (
        <StatusMessage title="Зон пока нет" text="Нажмите «Добавить зону», чтобы создать первую." />
      )}

      <div className={styles.list}>
        {zones.map((z) => {
          const active = z.isActive !== false;
          return (
            <article key={z.id} className={styles.row}>
              <div className={styles.info}>
                <h3>
                  {z.name}
                  <span className={active ? styles.on : styles.off}>
                    {active ? 'Активна' : 'Скрыта'}
                  </span>
                </h3>
                <p>
                  {ZONE_TYPES[z.type] ?? z.type} · {z.platform} · до {z.capacity} чел. · {z.pricePerHour} ₸/час
                </p>
              </div>
              <div className={styles.actions}>
                <Link to={`/admin/zones/${z.id}/edit`} className={styles.edit}>Изменить</Link>
                <button type="button" onClick={() => handleToggle(z)}>
                  {active ? 'Скрыть' : 'Показать'}
                </button>
                <button type="button" className={styles.delete} onClick={() => setToDelete(z)}>
                  Удалить
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {toDelete && (
        <ConfirmDialog
          title="Удалить зону?"
          text={`«${toDelete.name}» исчезнет из каталога. Уже созданные брони сохранятся. Чтобы просто убрать зону из каталога, используйте «Скрыть».`}
          confirmLabel="Удалить"
          loading={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </section>
  );
}