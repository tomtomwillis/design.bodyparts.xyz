import { useParams, Link } from 'react-router-dom'
import { portfolioItems } from '../../data/portfolio'
import PortfolioItem from './PortfolioItem'
import styles from './Portfolio.module.css'

const VALID_CATEGORIES = ['poster', 'web', 'more']

export default function Portfolio() {
  const { category } = useParams()
  const active = VALID_CATEGORIES.includes(category) ? category : null
  const items = active
    ? portfolioItems.filter((item) => item.tags?.includes(active))
    : portfolioItems

  return (
    <main className={styles.page}>
      <Link to="/" className={styles.back}>Back</Link>

      <div className={styles.header}>
        <h1 className={styles.heading}>Portfolio</h1>
        <nav className={styles.catNav}>
          {VALID_CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to={`/portfolio/${cat}`}
              className={`${styles.catLink} ${active === cat ? styles.catLinkActive : ''}`}
            >
              {cat}
            </Link>
          ))}
        </nav>
      </div>

      {items.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr className={styles.headRow}>
              <th className={styles.headCell}>Project</th>
              <th className={styles.headCell}>Tags</th>
              <th className={`${styles.headCell} ${styles.dateCell}`}>Date</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => <PortfolioItem key={item.id} {...item} />)}
          </tbody>
        </table>
      ) : (
        <p className={styles.empty}>No items in this category yet.</p>
      )}
    </main>
  )
}
