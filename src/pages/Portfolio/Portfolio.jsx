import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react'
import { ZoomIn, ChevronsLeftRight, ChevronDown } from 'lucide-react'
import { portfolioItems } from '../../data/portfolio'
import PortfolioItem from './PortfolioItem'
import GalleryModal from '../../components/GalleryModal/GalleryModal'
import styles from './Portfolio.module.css'

const MAIN_CATEGORIES = ['all', 'poster', 'web', '3d', '2d']
const MORE_CATEGORIES = ['club', 'video', 'branding']
const VALID_CATEGORIES = [...MAIN_CATEGORIES, ...MORE_CATEGORIES]
const IDLE_INTERVAL_MS = 3000

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function Portfolio() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const segment = pathname.split('/').pop()
  const active = VALID_CATEGORIES.includes(segment) ? segment : 'all'
  // Memoised so `items` keeps a stable reference across renders within the same
  // category. It's a dependency of the scroll-metrics effect below; rebuilding
  // the array on every render would re-run that effect (which calls setThumb),
  // which re-renders, which rebuilds the array — an infinite update loop.
  const items = useMemo(
    () => active === 'all'
      ? portfolioItems
      : portfolioItems.filter((item) => item.tags?.includes(active)),
    [active]
  )

  const [moreOpen, setMoreOpen] = useState(() => MORE_CATEGORIES.includes(active))
  const [expandedId, setExpandedId] = useState(null)
  const [previewGalleryOpen, setPreviewGalleryOpen] = useState(false)
  const tableWrapRef = useRef(null)
  const scrollTrackRef = useRef(null)
  const thumbRef = useRef(null)
  const dragStateRef = useRef(null)
  const [thumb, setThumb] = useState({ visible: false, heightPct: 100, topPct: 0 })
  const [hintVisible, setHintVisible] = useState(false)

  const bodyRef = useRef(null)
  const imagePanelRef = useRef(null)
  const panelDragRef = useRef(null)
  const [panelWidthPct, setPanelWidthPct] = useState(35)
  const [panelHeight, setPanelHeight] = useState(null)

  // Keep the list column the same height as the image preview: measure the
  // image panel (its height is derived from its aspect-ratio + drag-resizable
  // width, so it's not knowable in CSS) and feed it to the list as --panel-h.
  useLayoutEffect(() => {
    const node = imagePanelRef.current
    if (!node) return
    const observer = new ResizeObserver(() => {
      setPanelHeight(node.offsetHeight)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  function handleDividerPointerDown(e) {
    e.preventDefault()
    const body = bodyRef.current
    if (!body) return
    panelDragRef.current = { startX: e.clientX, startWidth: panelWidthPct, bodyWidth: body.getBoundingClientRect().width }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handleDividerPointerMove(e) {
    const drag = panelDragRef.current
    if (!drag || !drag.bodyWidth) return
    const deltaPct = ((e.clientX - drag.startX) / drag.bodyWidth) * 100
    const next = Math.min(Math.max(drag.startWidth + deltaPct, 20), 60)
    setPanelWidthPct(next)
  }

  function handleDividerPointerUp(e) {
    panelDragRef.current = null
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  function handleToggle(id) {
    const isClosing = expandedId === id
    setExpandedId(isClosing ? null : id)
    if (!isClosing) {
      const expandedItem = items.find(item => item.id === id)
      if (expandedItem?.hero) showImage(expandedItem.hero)
    }
  }

  useEffect(() => {
    if (MORE_CATEGORIES.includes(active)) setMoreOpen(true)
  }, [active])

  useEffect(() => {
    if (!expandedId) return
    function handleOutsideClick(e) {
      if (!tableWrapRef.current?.contains(e.target)) setExpandedId(null)
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [expandedId])

  useEffect(() => {
    const node = tableWrapRef.current
    if (!node) return

    function computeTopPct(heightPct) {
      const { scrollTop, scrollHeight, clientHeight } = node
      const maxTopPct = 100 - heightPct
      if (scrollHeight <= clientHeight) return 0
      return Math.min((scrollTop / (scrollHeight - clientHeight)) * maxTopPct, maxTopPct)
    }

    // Show the scroll hint only while there's more list below the fold. The
    // guarded setState keeps this from re-rendering on every scroll tick.
    function updateHint() {
      const { scrollTop, scrollHeight, clientHeight } = node
      const hasMore = scrollHeight - clientHeight - scrollTop > 8
      setHintVisible(prev => (prev === hasMore ? prev : hasMore))
    }

    // Writes the thumb's position straight to the DOM (bypassing React) so it
    // tracks the mouse wheel / trackpad at native frame rate instead of being
    // gated behind a full component re-render on every scroll tick.
    let ticking = false
    function updateTopDirectly() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        if (thumbRef.current) {
          thumbRef.current.style.top = `${computeTopPct(thumb.heightPct)}%`
        }
        updateHint()
      })
    }

    // Bail out when the metrics are unchanged so an identical setThumb can't
    // schedule a needless re-render (this effect depends on thumb.heightPct, so
    // a no-op object update would otherwise re-trigger the effect).
    function applyThumb(next) {
      setThumb(prev =>
        prev.visible === next.visible && prev.heightPct === next.heightPct && prev.topPct === next.topPct
          ? prev
          : next
      )
    }

    function updateMetrics() {
      updateHint()
      const { scrollHeight, clientHeight } = node
      if (scrollHeight <= clientHeight) {
        applyThumb({ visible: true, heightPct: 100, topPct: 0 })
        return
      }
      const heightPct = Math.max((clientHeight / scrollHeight) * 100, 8)
      applyThumb({ visible: true, heightPct, topPct: computeTopPct(heightPct) })
    }

    updateMetrics()
    node.addEventListener('scroll', updateTopDirectly, { passive: true })
    window.addEventListener('resize', updateMetrics)
    const resizeObserver = new ResizeObserver(updateMetrics)
    resizeObserver.observe(node)

    return () => {
      node.removeEventListener('scroll', updateTopDirectly)
      window.removeEventListener('resize', updateMetrics)
      resizeObserver.disconnect()
    }
  }, [items, expandedId, thumb.heightPct])

  const scrollByTrackRatio = useCallback((ratio) => {
    const node = tableWrapRef.current
    if (!node) return
    const { scrollHeight, clientHeight } = node
    node.scrollTop = ratio * (scrollHeight - clientHeight)
  }, [])

  function handleThumbPointerDown(e) {
    e.preventDefault()
    e.stopPropagation()
    const node = tableWrapRef.current
    if (!node) return
    dragStateRef.current = { startY: e.clientY, startScrollTop: node.scrollTop }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handleThumbPointerMove(e) {
    const node = tableWrapRef.current
    const drag = dragStateRef.current
    if (!node || !drag) return
    const track = scrollTrackRef.current
    const trackHeight = track?.clientHeight || node.clientHeight
    const { scrollHeight, clientHeight } = node
    const deltaY = e.clientY - drag.startY
    const scrollableTrack = trackHeight - (thumb.heightPct / 100) * trackHeight
    const scrollableContent = scrollHeight - clientHeight
    if (scrollableTrack <= 0) return
    node.scrollTop = drag.startScrollTop + (deltaY / scrollableTrack) * scrollableContent
  }

  function handleThumbPointerUp(e) {
    dragStateRef.current = null
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  function handleTrackClick(e) {
    if (e.target !== e.currentTarget) return
    const track = e.currentTarget
    const rect = track.getBoundingClientRect()
    const ratio = (e.clientY - rect.top) / rect.height
    scrollByTrackRatio(Math.min(Math.max(ratio, 0), 1))
  }

  const [layers, setLayers] = useState(() => {
    const heroItems = portfolioItems.filter(item => item.hero)
    const initial = heroItems.length > 0 ? pickRandom(heroItems).hero : null
    return [initial, null]
  })
  const [activeIdx, setActiveIdx] = useState(0)

  const activeItemIdx = layers[activeIdx]
    ? items.findIndex((item) => item.hero === layers[activeIdx])
    : -1
  const activeItem = activeItemIdx >= 0 ? items[activeItemIdx] : null
  const previewImages = activeItem?.gallery?.length > 0 ? activeItem.gallery : (activeItem?.hero ? [activeItem.hero] : [])
  const activeIdxRef = useRef(0)
  const [hoveredHero, setHoveredHero] = useState(null)
  const [exiting, setExiting] = useState(false)

  function handleBack() {
    setExiting(true)
    setTimeout(() => navigate('/'), 450)
  }

  const showImage = useCallback((src) => {
    if (!src) return
    const inactiveIdx = 1 - activeIdxRef.current
    setLayers(prev => {
      const next = [...prev]
      next[inactiveIdx] = src
      return next
    })
    requestAnimationFrame(() => {
      activeIdxRef.current = inactiveIdx
      setActiveIdx(inactiveIdx)
    })
  }, [])

  useEffect(() => {
    if (hoveredHero || expandedId || previewGalleryOpen) return
    const heroItems = items.filter(item => item.hero)
    if (heroItems.length === 0) return

    const interval = setInterval(() => {
      showImage(pickRandom(heroItems).hero)
    }, IDLE_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [hoveredHero, expandedId, previewGalleryOpen, items, showImage])

  function handleHover(item) {
    if (expandedId) return
    if (item.hero) {
      setHoveredHero(item.hero)
      showImage(item.hero)
    }
  }

  function handleHoverEnd() {
    setHoveredHero(null)
  }

  return (
    <main className={`${styles.page} ${exiting ? styles.pageExit : ''}`}>
      <button className={styles.back} onClick={handleBack}>← Back</button>

      <div className={styles.header}>
        <h1 className={styles.heading}>Portfolio</h1>
        <nav className={styles.catNav}>
          {MAIN_CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to={`/portfolio/${cat}`}
              className={`${styles.catLink} ${active === cat ? styles.catLinkActive : ''}`}
            >
              {cat}
            </Link>
          ))}
          <button
            className={`${styles.catLink} ${MORE_CATEGORIES.includes(active) ? styles.catLinkActive : ''}`}
            onClick={() => setMoreOpen(p => !p)}
          >
            {moreOpen ? 'less' : 'more'}
          </button>
          <div className={`${styles.moreTags} ${moreOpen ? styles.moreTagsOpen : ''}`}>
            <div className={styles.moreTagsInner}>
              {MORE_CATEGORIES.map((cat) => (
                <Link
                  key={cat}
                  to={`/portfolio/${cat}`}
                  className={`${styles.catLink} ${active === cat ? styles.catLinkActive : ''}`}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </div>

      <div className={styles.body} ref={bodyRef}>
        <div
          className={styles.imagePanel}
          ref={imagePanelRef}
          style={{ width: `${panelWidthPct}%` }}
          onClick={() => previewImages.length > 0 && setPreviewGalleryOpen(true)}
        >
          <div className={styles.imagePanelInner}>
            {layers.map((src, i) =>
              src && (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className={`${styles.heroImg} ${activeIdx === i ? styles.heroImgVisible : styles.heroImgHidden}`}
                />
              )
            )}
            <span className={styles.zoomIcon}>
              <ZoomIn size={16} />
            </span>
          </div>
        </div>

        <div
          className={styles.divider}
          onPointerDown={handleDividerPointerDown}
          onPointerMove={handleDividerPointerMove}
          onPointerUp={handleDividerPointerUp}
        >
          <span className={styles.dividerGrip}>
            <ChevronsLeftRight size={12} strokeWidth={2.5} />
          </span>
        </div>

        {items.length > 0 ? (
          <div
            className={styles.tableScrollArea}
            style={{ '--panel-h': panelHeight ? `${panelHeight}px` : undefined }}
          >
            <div className={styles.tableWrap} ref={tableWrapRef}>
              <table className={styles.table}>
                <thead>
                  <tr className={`${styles.headRow} ${activeItemIdx === 0 ? styles.headRowActive : ''}`}>
                    <th className={styles.headCell}>Project</th>
                    <th className={styles.headCell}>Tags</th>
                    <th className={`${styles.headCell} ${styles.dateCell}`}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <PortfolioItem
                      key={item.id}
                      {...item}
                      isActive={idx === activeItemIdx}
                      isPrevRow={idx === activeItemIdx - 1}
                      isExpanded={expandedId === item.id}
                      onToggle={() => handleToggle(item.id)}
                      onMouseEnter={() => handleHover(item)}
                      onMouseLeave={handleHoverEnd}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <div className={`${styles.scrollHint} ${hintVisible ? '' : styles.scrollHintHidden}`}>
              <ChevronDown size={16} strokeWidth={6} />
              <ChevronDown size={16} strokeWidth={6} />
              <ChevronDown size={16} strokeWidth={6} />
            </div>
            <div
              className={styles.scrollTrack}
              ref={scrollTrackRef}
              onClick={handleTrackClick}
            >
              {thumb.visible && (
                <div
                  ref={thumbRef}
                  className={styles.scrollThumb}
                  style={{ height: `${thumb.heightPct}%`, top: `${thumb.topPct}%` }}
                  onPointerDown={handleThumbPointerDown}
                  onPointerMove={handleThumbPointerMove}
                  onPointerUp={handleThumbPointerUp}
                />
              )}
            </div>
          </div>
        ) : (
          <p className={styles.empty}>No items in this category yet.</p>
        )}
      </div>

      <div className={styles.bottomPadding} />

      {previewGalleryOpen && (
        <GalleryModal images={previewImages} onClose={() => setPreviewGalleryOpen(false)} />
      )}
    </main>
  )
}
