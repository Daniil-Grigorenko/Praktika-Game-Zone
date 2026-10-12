import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getZoneById } from '../services/zonesService';
import { createZone, updateZone } from '../services/adminService';
import { useToast } from '../context/ToastContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import ZoneForm from '../components/admin/ZoneForm';
import StatusMessage from '../components/common/StatusMessage';
import Spinner from '../components/common/Spinner';
import NotFoundPage from './NotFoundPage';

const EMPTY = {
  name: '', type: 'console', platform: '', description: '', imageUrl: '',
  capacity: '4', pricePerHour: '', games: '', isActive: 'true',
};

export default function AdminZoneFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  useDocumentTitle(isEdit ? 'Редактирование зоны' : 'Новая зона');

  const navigate = useNavigate();
  const toast = useToast();

  const [zone, setZone] = useState(null);
  const [status, setStatus] = useState(isEdit ? 'loading' : 'success');
  const [reloadKey, setReloadKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    let ignore = false;
    setStatus('loading');

    getZoneById(id)
      .then((data) => {
        if (ignore) return;
        if (!data) setStatus('notfound');
        else { setZone(data); setStatus('success'); }
      })
      .catch(() => { if (!ignore) setStatus('error'); });

    return () => { ignore = true; };
  }, [id, isEdit, reloadKey]);

  if (status === 'loading') return <Spinner fullPage />;
  if (status === 'notfound') return <NotFoundPage />;
  if (status === 'error') {
    return (
      <StatusMessage
        title="Не удалось загрузить зону"
        actionLabel="Повторить"
        onAction={() => setReloadKey((k) => k + 1)}
      />
    );
  }

  const initialValues = zone
    ? {
        name: zone.name ?? '',
        type: zone.type ?? 'console',
        platform: zone.platform ?? '',
        description: zone.description ?? '',
        imageUrl: zone.imageUrl ?? '',
        capacity: String(zone.capacity ?? ''),
        pricePerHour: String(zone.pricePerHour ?? ''),
        games: (zone.games ?? []).join(', '),
        isActive: zone.isActive === false ? 'false' : 'true',
      }
    : EMPTY;

  async function handleSubmit(data) {
    setSubmitError('');
    setSubmitting(true);
    try {
      if (isEdit) await updateZone(id, data);
      else await createZone(data);
      toast.success(isEdit ? 'Зона обновлена' : 'Зона создана');
      navigate('/admin/zones', { replace: true });
    } catch {
      setSubmitError('Не удалось сохранить зону. Проверьте данные и права доступа.');
      setSubmitting(false);
    }
  }

  return (
    <section>
      <Link to="/admin/zones">← К списку зон</Link>
      <h1>{isEdit ? 'Редактирование зоны' : 'Новая зона'}</h1>
      <ZoneForm
        initialValues={initialValues}
        submitLabel={isEdit ? 'Сохранить' : 'Создать зону'}
        submitting={submitting}
        submitError={submitError}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/admin/zones')}
      />
    </section>
  );
}