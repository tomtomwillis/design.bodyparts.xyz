import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import styles from './Navigation.module.css'

export default function Navigation({ portfolioOpen: portfolioOpenProp, onPortfolioToggle }) {
  const [localPortfolioOpen, setLocalPortfolioOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)

  const isPortfolioOpen = onPortfolioToggle !== undefined
    ? (portfolioOpenProp ?? false)
    : localPortfolioOpen

  const handlePortfolioClick = () => {
    if (onPortfolioToggle) {
      onPortfolioToggle()
      setAboutOpen(false)
    } else {
      setLocalPortfolioOpen((p) => !p)
      setAboutOpen(false)
    }
  }

  const hideOthers = onPortfolioToggle !== undefined && isPortfolioOpen

  return (
    <nav className={styles.nav}>
      <div className={`${styles.aboutGroup} ${hideOthers ? styles.navGroupHidden : ''}`}>
        <button
          className={styles.navItem}
          onClick={() => { setAboutOpen((prev) => !prev); setLocalPortfolioOpen(false) }}
          aria-expanded={aboutOpen}
        >
          About <span className={styles.toggle}>{aboutOpen ? '−' : '+'}</span>
        </button>
        <div className={`${styles.aboutMenu} ${aboutOpen ? styles.aboutMenuOpen : ''}`}>
          <div className={styles.aboutMenuInner}>
            <p className={styles.aboutBio}>
              A design alias of SE London artist and clubber{' '}
              <a href="https://www.instagram.com/bodyparts.gla/" target="_blank" rel="noopener noreferrer" className={styles.bioLink}>Body Parts</a>.
              He creates works in{' '}
              <Link to="/portfolio/3d" className={styles.bioLink}>3D</Link>,{' '}
              <Link to="/portfolio/2d" className={styles.bioLink}>2D</Link> and{' '}
              <Link to="/portfolio/web" className={styles.bioLink}>cyberspace</Link>.
              He also runs irregular Glasgow/London club night{' '}
              <a href="https://www.instagram.com/bodyparts.gla/" target="_blank" rel="noopener noreferrer" className={styles.bioLink}>Body Parts</a>{' '}
              and is a founder of{' '}
              <a href="https://github.com/tomtomwillis/Yabby" target="_blank" rel="noopener noreferrer" className={styles.bioLink}>YabbyVille</a>.
            </p>
            <ul className={styles.aboutLinks}>
              <li>
                <a href="https://instagram.com/body_bits_" target="_blank" rel="noopener noreferrer" className={styles.subItem}>
                  Instagram
                </a>
              </li>
              <li>
                <a href="mailto:design@bodyparts.xyz" className={styles.subItem}>
                design@bodyparts.xyz
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.portfolioGroup}>
        <button
          className={styles.navItem}
          onClick={handlePortfolioClick}
          aria-expanded={isPortfolioOpen}
        >
          Portfolio <span className={styles.toggle}>{isPortfolioOpen ? '−' : '+'}</span>
        </button>
        {!onPortfolioToggle && (
          <div className={`${styles.subMenu} ${isPortfolioOpen ? styles.subMenuOpen : ''}`}>
            <ul className={styles.subMenuList}>
              {[
                { label: 'All', path: '/portfolio/all' },
                { label: 'Poster', path: '/portfolio/poster' },
                { label: 'Web', path: '/portfolio/web' },
                { label: 'More', path: '/portfolio/more' },
              ].map((cat) => (
                <li key={cat.path}>
                  <Link to={cat.path} className={styles.subItem}>{cat.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <a
        href="https://www.instagram.com/bodyparts.gla/"
        target="_blank"
        rel="noopener noreferrer"
        className={`${styles.navItem} ${styles.navItemBodyParts} ${hideOthers ? styles.navGroupHidden : ''}`}
      >
        Body Parts
        <ArrowUpRight className={styles.externalArrow} size="1em" strokeWidth={2.5} aria-hidden="true" />
      </a>
    </nav>
  )
}
