import { Handle, Position } from '@xyflow/react'
import styles from './MindMap.module.css'

const assetSrc = (path) => path ? `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}` : null

export function HeroNode({ data }) {
  return (
    <div className={styles.heroNode} style={data.width ? { width: data.width } : undefined}>
      {data.image && <img src={assetSrc(data.image)} alt={data.label} className={styles.heroImage} />}
      {data.label && <p className={styles.heroLabel}>{data.label}</p>}
      <Handle type="source" position={Position.Right} className={styles.handle} />
      <Handle type="target" position={Position.Left} className={styles.handle} />
    </div>
  )
}

export function DetailNode({ data }) {
  return (
    <div className={styles.detailNode} style={data.width ? { width: data.width } : undefined}>
      {data.image && <img src={assetSrc(data.image)} alt={data.label} className={styles.detailImage} />}
      {data.label && <p className={styles.detailLabel}>{data.label}</p>}
      <Handle type="source" position={Position.Right} className={styles.handle} />
      <Handle type="target" position={Position.Left} className={styles.handle} />
    </div>
  )
}

export const nodeTypes = {
  hero: HeroNode,
  detail: DetailNode,
}
