import { Fragment, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GalleryModal from '../../components/GalleryModal/GalleryModal'
import styles from './Portfolio.module.css'

export default function PortfolioItem({ page, title, tags, date, description, gallery, links, isActive, isPrevRow, isExpanded, onToggle, onMouseEnter, onMouseLeave }) {
  const navigate = useNavigate()
  const [galleryOpen, setGalleryOpen] = useState(false)
  const contentRef = useRef(null)
  const [contentHeight, setContentHeight] = useState(0)

  useLayoutEffect(() => {
    if (isExpanded && contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight)
    }
  }, [isExpanded, description, gallery, links, page])

  const rowClass = [
    styles.row,
    isActive && !isExpanded ? styles.rowActive : '',
    isPrevRow ? styles.rowPrevActive : '',
    isExpanded ? styles.rowExpanded : '',
  ].filter(Boolean).join(' ')

  return (
    <Fragment>
      <tr
        className={rowClass}
        onClick={onToggle}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <td className={`${styles.cell} ${styles.titleCell}`}>
          {/* Positioned in the gutter left of the table (see .star), so it takes
              no space in the row as it fades in and out with the preview
              cycling between items. */}
          <span
            className={`${styles.star} ${isActive || isExpanded ? styles.starVisible : ''}`}
            aria-hidden="true"
          >
            ✦
          </span>
          {title}
        </td>
        <td className={styles.cell}>
          {tags.map((tag) => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </td>
        <td className={`${styles.cell} ${styles.dateCell}`}>{date}</td>
      </tr>
      <tr className={`${styles.expandedRow} ${isExpanded ? styles.expandedRowOpen : ''}`}>
        <td colSpan={3} className={styles.expandedCell}>
          <div
            className={styles.expandedInner}
            style={{ maxHeight: isExpanded ? contentHeight : 0 }}
          >
            <div className={styles.expandedContent} ref={contentRef}>
              {description && <p className={styles.description}>{description}</p>}
              <div className={styles.buttons}>
                {gallery?.length > 0 && (
                  <button
                    className={styles.galleryButton}
                    onClick={(e) => { e.stopPropagation(); setGalleryOpen(true) }}
                  >
                    Gallery
                  </button>
                )}
                {page && (
                  <button
                    className={styles.btsButton}
                    onClick={(e) => { e.stopPropagation(); navigate(`/portfolio/${page}`) }}
                  >
                    Behind The Scenes
                  </button>
                )}
                {links?.map((link) => (
                  <a
                    key={link.url}
                    className={styles.linkButton}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </td>
      </tr>
      {galleryOpen && (
        <GalleryModal images={gallery} title={title} onClose={() => setGalleryOpen(false)} />
      )}
    </Fragment>
  )
}
