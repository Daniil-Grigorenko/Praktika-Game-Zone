import { useEffect, useState } from 'react';
import { searchDeals } from '../services/exploreApi';
import DealCard from '../components/items/DealCard';
import StatusMessage from '../components/common/StatusMessage';
import Spinner from '../components/common/Spinner';
import styles from './ExplorePage.module.css';

export default function ExplorePage() {
  const [input, setInput] = useState('');   // то, что набрано в поле
  const [query, setQuery] = useState('');   // то, что реально ищем (после отправки формы)
  const [deals, setDeals] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | error | empty | success
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');

    searchDeals(query, controller.signal)
      .then((data) => {
        setDeals(data);
        setStatus(data.length === 0 ? 'empty' : 'success');
      })
      .catch((err) => {
        // AbortError — это не настоящая ошибка, мы сами отменили запрос
        if (err.name === 'AbortError') return;
        setStatus('error');
      });

    // при смене запроса или уходе со страницы старый запрос отменяется
    return () => controller.abort();
  }, [query, reloadKey]);

  function handleSubmit(e) {
    e.preventDefault();
    setQuery(input.trim());
  }

  function handleReset() {
    setInput('');
    setQuery('');
  }

  return (
    <section>
      <h1>Исследуйте игры</h1>
      <p className={styles.sub}>
        Найдите игру и посмотрите актуальные цены. Данные: CheapShark API.
      </p>

      <form onSubmit={handleSubmit} className={styles.search}>
        <input
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Например: Forza, Tekken, Beat Saber"
          aria-label="Название игры"
        />
        <button type="submit">Найти</button>
      </form>

      {status === 'loading' && <Spinner />}

      {status === 'error' && (
        <StatusMessage
          title="Не удалось загрузить данные"
          text="Проверьте соединение с интернетом и попробуйте ещё раз."
          actionLabel="Повторить"
          onAction={() => setReloadKey((k) => k + 1)}
        />
      )}

      {status === 'empty' && (
        <StatusMessage
          title="Ничего не найдено"
          text={`По запросу «${query}» нет результатов.`}
          actionLabel="Сбросить поиск"
          onAction={handleReset}
        />
      )}

      {status === 'success' && (
        <div className={styles.grid}>
          {deals.map((deal) => (
            <DealCard key={deal.dealID} deal={deal} />
          ))}
        </div>
      )}
    </section>
  );
}