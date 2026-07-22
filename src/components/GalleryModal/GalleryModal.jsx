import { useEffect, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import styles from './GalleryModal.module.css'

const ANIM_MS = 320

function isVideo(src) {
  return /\.(mp4|webm|ogg|mov)$/i.test(src)
}

function MediaItem({ src, className, playing = false, alt = '', onClick }) {
  if (isVideo(src)) {
    return (
      <video
        src={src}
        className={className}
        autoPlay={playing}
        muted
        loop
        playsInline
        controls={playing}
        onClick={onClick}
      />
    )
  }
  return <img src={src} alt={alt} className={className} onClick={onClick} />
}

export default function GalleryModal({ images, onClose }) {
  const [index, setIndex] = useState(0)
  const [outgoing, setOutgoing] = useState(null)    // { idx, dir: 'left'|'right' }
  const [incomingDir, setIncomingDir] = useState(null)
  const [busy, setBusy] = useState(false)
  const [touchStartX, setTouchStartX] = useState(null)
  const multiple = images.length > 1

  const go = useCallback((direction) => {
    if (busy) return
    const nextIdx = direction === 'next'
      ? (index + 1) % images.length
      : (index - 1 + images.length) % images.length
    setOutgoing({ idx: index, dir: direction === 'next' ? 'left' : 'right' })
    setIncomingDir(direction === 'next' ? 'right' : 'left')
    setIndex(nextIdx)
    setBusy(true)
    setTimeout(() => { setOutgoing(null); setIncomingDir(null); setBusy(false) }, ANIM_MS)
  }, [busy, index, images.length])

  const goPrev = useCallback(() => go('prev'), [go])
  const goNext = useCallback(() => go('next'), [go])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goPrev, goNext, onClose])

  useEffect(() => {
    const saved = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = saved }
  }, [])

  const nextIdx = (index + 1) % images.length

  return createPortal(
    <div className={styles.overlay} onClick={(e) => { e.stopPropagation(); onClose() }}>
      <button className={styles.close} onClick={onClose} aria-label="Close gallery">
        <X size={20} strokeWidth={1.5} />
      </button>

      <div
        className={styles.layout}
        onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStartX === null) return
          const delta = touchStartX - e.changedTouches[0].clientX
          if (Math.abs(delta) > 50) delta > 0 ? goNext() : goPrev()
          setTouchStartX(null)
        }}
      >
        <div className={styles.carousel}>
          {multiple && (
            <button className={styles.arrow} onClick={(e) => { e.stopPropagation(); goPrev() }} aria-label="Previous">
              <ChevronLeft size={28} strokeWidth={1.5} />
            </button>
          )}

          <div className={styles.imageWrap}>
            {outgoing && (
              <MediaItem
                src={images[outgoing.idx]}
                className={`${styles.imageOutgoing} ${outgoing.dir === 'left' ? styles.exitLeft : styles.exitRight}`}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <MediaItem
              key={index}
              src={images[index]}
              playing
              alt={`Item ${index + 1} of ${images.length}`}
              className={`${styles.image} ${
                incomingDir === 'right' ? styles.enterRight
                : incomingDir === 'left' ? styles.enterLeft
                : ''
              }`}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {multiple && (
            <button className={styles.arrow} onClick={(e) => { e.stopPropagation(); goNext() }} aria-label="Next">
              <ChevronRight size={28} strokeWidth={1.5} />
            </button>
          )}
        </div>

        {multiple && (
          <button className={styles.sidePanel} onClick={(e) => { e.stopPropagation(); goNext() }} aria-label="Next">
            {isVideo(images[nextIdx]) ? (
              <div className={styles.sidePanelVideo}>
                <Play size={28} strokeWidth={1.5} />
              </div>
            ) : (
              <img src={images[nextIdx]} alt="" className={styles.sidePanelImg} />
            )}
          </button>
        )}
      </div>

      {multiple && (
        <span className={styles.counter}>{index + 1} / {images.length}</span>
      )}
    </div>,
    document.body
  )
}
