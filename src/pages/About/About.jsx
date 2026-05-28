import { Link } from 'react-router-dom'
import styles from './About.module.css'

export default function About() {
  return (
    <main className={styles.page}>
      <Link to="/" className={styles.back}>← Back</Link>
      <h1 className={styles.heading}>About</h1>
      <p className={styles.body}>Add your about text here.</p>
    </main>
  )
}
