import { useRef, useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ReactFlow, Background, useNodesState, useEdgesState } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { portfolioItems } from '../../../data/portfolio'
import { nodeTypes } from './MindMapNodes'
import styles from './MindMap.module.css'

const DECAY = 0.8
const VELOCITY_ALPHA = 0.6

export default function MindMap() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const item = portfolioItems.find((p) => p.page === slug)

  const [nodes, , onNodesChange] = useNodesState(item?.mindmap?.nodes ?? [])
  const [edges, , onEdgesChange] = useEdgesState(item?.mindmap?.edges ?? [])

  const [exiting, setExiting] = useState(false)

  const rfInstanceRef = useRef(null)
  const velocityRef = useRef({ x: 0, y: 0 })
  const lastViewportRef = useRef(null)
  const lastTimeRef = useRef(null)
  const animFrameRef = useRef(null)
  const isMomentumRef = useRef(false)

  useEffect(() => () => cancelAnimationFrame(animFrameRef.current), [])

  const handlePointerDown = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current)
    isMomentumRef.current = false
    velocityRef.current = { x: 0, y: 0 }
    lastViewportRef.current = null
    lastTimeRef.current = null
  }, [])

  const handleMove = useCallback((_, viewport) => {
    if (isMomentumRef.current) return
    const now = performance.now()
    if (lastViewportRef.current && lastTimeRef.current) {
      const dt = now - lastTimeRef.current
      if (dt > 0 && dt < 100) {
        const rawVx = (viewport.x - lastViewportRef.current.x) / dt
        const rawVy = (viewport.y - lastViewportRef.current.y) / dt
        velocityRef.current = {
          x: VELOCITY_ALPHA * rawVx + (1 - VELOCITY_ALPHA) * velocityRef.current.x,
          y: VELOCITY_ALPHA * rawVy + (1 - VELOCITY_ALPHA) * velocityRef.current.y,
        }
      }
    }
    lastViewportRef.current = { ...viewport }
    lastTimeRef.current = now
  }, [])

  const handleMoveEnd = useCallback(() => {
    if (isMomentumRef.current) return
    if (!rfInstanceRef.current) return

    let vx = velocityRef.current.x
    let vy = velocityRef.current.y
    if (Math.abs(vx) < 0.01 && Math.abs(vy) < 0.01) return

    isMomentumRef.current = true

    const step = () => {
      vx *= DECAY
      vy *= DECAY
      if (Math.abs(vx) < 0.05 && Math.abs(vy) < 0.05) {
        isMomentumRef.current = false
        velocityRef.current = { x: 0, y: 0 }
        return
      }
      const { x, y, zoom } = rfInstanceRef.current.getViewport()
      rfInstanceRef.current.setViewport({ x: x + vx * 16, y: y + vy * 16, zoom }, { duration: 0 })
      animFrameRef.current = requestAnimationFrame(step)
    }

    animFrameRef.current = requestAnimationFrame(step)
  }, [])

  function handleBack() {
    setExiting(true)
    setTimeout(() => navigate('/portfolio'), 450)
  }

  if (!item) {
    return (
      <div className={styles.notFound}>
        <button onClick={handleBack} className={styles.back}>← Back</button>
        <p>Project not found.</p>
      </div>
    )
  }

  return (
    <div className={`${styles.canvas} ${exiting ? styles.canvasExit : ''}`} onPointerDown={handlePointerDown}>
      <button onClick={handleBack} className={styles.back}>← Back</button>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
        onInit={(instance) => { rfInstanceRef.current = instance }}
        onMove={handleMove}
        onMoveEnd={handleMoveEnd}
      >
        <Background color="var(--color-primary)" gap={32} size={1} style={{ opacity: 0.08 }} />
      </ReactFlow>
    </div>
  )
}
