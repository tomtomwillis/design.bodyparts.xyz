import { useNavigate } from 'react-router-dom'
import styles from './Portfolio.module.css'

export default function PortfolioItem({ page, title, tags, date }) {
  const navigate = useNavigate()

  return (
    <tr className={styles.row} onClick={() => navigate(`/portfolio/${page}`)}>
      <td className={styles.cell}>{title}</td>
      <td className={styles.cell}>
        {tags.map((tag) => (
          <span key={tag} className={styles.tag}>{tag}</span>
        ))}
      </td>
      <td className={`${styles.cell} ${styles.dateCell}`}>{date}</td>
    </tr>
  )
}
