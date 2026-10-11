import { useEffect, useMemo, useState } from 'react';
import { getZones } from '../services/zonesService';
import ZoneCard from '../components/items/ZoneCard';
import ZoneFilters from '../components/items/ZoneFilters';
import StatusMessage from '../components/common/StatusMessage';
import Spinner from '../components/common/Spinner';
import styles from './CatalogPage.module.css';

const DEFAULT_FILTERS = { search: '', type: 'all', minCapacity: '', maxPrice: '' };

export default function CatalogPage() {
  const [zones, setZones] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | error | success
  const [reloadKey, setReloadKey] = useState(0);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  useEffect(() => {
    let ignore = false; // защита от обновления состояния после ухода со страницы
    setStatus('loading');

    getZones()
      .then((data) => {
        if (ignore) return;
        setZones(data);
        setStatus('success');
      })
      .catch(() => {
        if (!ignore) setStatus('error');
      });

    return () => { ignore = true; };
  }, [reloadKey]);

  const filtered = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return zones.filter((z) => {
      if (search && !z.name.toLowerCase().includes(search)) return false;
      if (filters.type !== 'all' && z.type !== filters.type) return false;
      if (filters.minCapacity && z.capacity < Number(filters.minCapacity)) return false;
      if (filters.maxPrice && z.pricePerHour > Number(filters.maxPrice)) return false;
      return true;
    });
  }, [zones, filters]);

  return (
    <section>
      <h1>Игровые зоны</h1>

      <ZoneFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      {status === 'loading' && <Spinner />}

      {status === 'error' && (
        <StatusMessage
          title="Не удалось загрузить зоны"
          text="Проверьте соединение и попробуйте ещё раз."
          actionLabel="Повторить"
          onAction={() => setReloadKey((k) => k + 1)}
        />
      )}

      {status === 'success' && zones.length === 0 && (
        <StatusMessage title="Зон пока нет" text="Загляните позже." />
      )}

      {status === 'success' && zones.length > 0 && filtered.length === 0 && (
        <StatusMessage
          title="Ничего не найдено"
          text="Попробуйте изменить фильтры."
          actionLabel="Сбросить фильтры"
          onAction={() => setFilters(DEFAULT_FILTERS)}
        />
      )}

      {filtered.length > 0 && (
        <div className={styles.grid}>
          {filtered.map((zone) => (
            <ZoneCard key={zone.id} zone={zone} />
          ))}
        </div>
      )}
    </section>
  );
}