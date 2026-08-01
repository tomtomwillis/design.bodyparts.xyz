import { useNavigate } from 'react-router-dom'
import Navigation from '../../components/Navigation/Navigation'
import ModelViewer from '../../components/ModelViewer/ModelViewer'
import styles from './Home.module.css'

export default function Home() {
  const navigate = useNavigate()

  return (
    <main className={styles.layout}>
      <div className={styles.left}>
        <div role="img" aria-label="Body Bits" className={styles.title} />

        <Navigation
          onPortfolioToggle={() => navigate('/portfolio')}
        />
      </div>

      <div className={styles.right}>
        <ModelViewer />
      </div>
    </main>
  )
}
