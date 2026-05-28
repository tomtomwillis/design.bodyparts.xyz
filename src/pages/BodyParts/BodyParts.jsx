import { Link } from 'react-router-dom'
import styles from './BodyParts.module.css'

export default function BodyParts() {
  return (
    <main className={styles.page}>
      <Link to="/" className={styles.back}>← Back</Link>
      <h1 className={styles.heading}>Body Parts</h1>
    </main>
  )
}
