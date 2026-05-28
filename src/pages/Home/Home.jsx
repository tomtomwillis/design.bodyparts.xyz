import { useState } from 'react'
import Navigation from '../../components/Navigation/Navigation'
import ModelViewer from '../../components/ModelViewer/ModelViewer'
import { portfolioItems } from '../../data/portfolio'
import PortfolioItem from '../Portfolio/PortfolioItem'
import styles from './Home.module.css'

const CATEGORIES = ['poster', 'web', 'more']

export default function Home() {
  const [portfolioOpen, setPortfolioOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState(null)

  const items = activeCategory
    ? portfolioItems.filter((item) => item.tags?.includes(activeCategory))
    : portfolioItems

  return (
    <main className={styles.layout}>
      <div className={`${styles.portfolioPanel} ${portfolioOpen ? styles.portfolioPanelOpen : ''}`}>
        <button className={styles.back} onClick={() => setPortfolioOpen(false)}>← Back</button>
        <button className={styles.portfolioHeading} onClick={() => setPortfolioOpen(false)}>
          Portfolio
        </button>

        <nav className={styles.catNav}>
          <button
            className={`${styles.catBtn} ${!activeCategory ? styles.catBtnActive : ''}`}
            onClick={() => setActiveCategory(null)}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`${styles.catBtn} ${activeCategory === cat ? styles.catBtnActive : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </nav>

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
              {items.map((item) => (
                <PortfolioItem key={item.id} {...item} />
              ))}
            </tbody>
          </table>
        ) : (
          <p className={styles.empty}>No items in this category yet.</p>
        )}
      </div>

      <div className={styles.left}>
        <img src={`${import.meta.env.BASE_URL}Title.svg`} alt="Body Bits" className={styles.title} />

        <Navigation
          portfolioOpen={portfolioOpen}
          onPortfolioToggle={() => setPortfolioOpen((p) => !p)}
        />
      </div>

      <div className={`${styles.right} ${portfolioOpen ? styles.rightHidden : ''}`}>
        <ModelViewer />
      </div>
    </main>
  )
}
