import { Suspense, Component, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment } from '@react-three/drei'
import styles from './ModelViewer.module.css'

class CanvasErrorBoundary extends Component {
  state = { crashed: false }
  static getDerivedStateFromError() { return { crashed: true } }
  render() { return this.state.crashed ? null : this.props.children }
}

function Model({ path }) {
  useEffect(() => () => useGLTF.clear(path), [path])
  const { scene } = useGLTF(path)
  return <primitive object={scene.clone()} scale={1} position={[0, -0.3, 0]} />
}

export default function ModelViewer({ modelPath = `${import.meta.env.BASE_URL}model/mace.glb` }) {
  return (
    <div className={styles.canvas}>
      <CanvasErrorBoundary>
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <Suspense fallback={null}>
            <Model path={modelPath} />
            <Environment preset="sunset" />
          </Suspense>
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.2} />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  )
}
