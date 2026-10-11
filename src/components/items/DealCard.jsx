import styles from './DealCard.module.css';

export default function DealCard({ deal }) {
  const savings = Math.round(Number(deal.savings));

  return (
    <article className={styles.card}>
      <img
        src={deal.thumb}
        alt={deal.title}
        className={styles.img}
        loading="lazy"
      />
      <div className={styles.body}>
        <h3>{deal.title}</h3>
        <p className={styles.prices}>
          <span className={styles.sale}>${deal.salePrice}</span>
          {savings > 0 && (
            <>
              <s className={styles.normal}>${deal.normalPrice}</s>
              <span className={styles.badge}>−{savings}%</span>
            </>
          )}
        </p>
        {Number(deal.metacriticScore) > 0 && (
          <p className={styles.score}>Metacritic: {deal.metacriticScore}</p>
        )}
      </div>
    </article>
  );
}