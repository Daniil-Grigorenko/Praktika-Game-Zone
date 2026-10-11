import styles from './ZoneFilters.module.css';

export default function ZoneFilters({ filters, onChange, onReset }) {
  function handle(e) {
    onChange({ ...filters, [e.target.name]: e.target.value });
  }

  return (
    <div className={styles.filters}>
      <input
        name="search" type="search" placeholder="Поиск по названию"
        value={filters.search} onChange={handle}
        aria-label="Поиск по названию"
      />
      <select name="type" value={filters.type} onChange={handle} aria-label="Тип зоны">
        <option value="all">Все типы</option>
        <option value="console">Консоли</option>
        <option value="vr">VR</option>
      </select>
      <input
        name="minCapacity" type="number" min="1" placeholder="Мин. вместимость"
        value={filters.minCapacity} onChange={handle}
        aria-label="Минимальная вместимость"
      />
      <input
        name="maxPrice" type="number" min="0" placeholder="Макс. цена за час"
        value={filters.maxPrice} onChange={handle}
        aria-label="Максимальная цена за час"
      />
      <button type="button" onClick={onReset}>Сбросить</button>
    </div>
  );
}