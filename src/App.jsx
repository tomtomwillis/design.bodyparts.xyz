import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import About from './pages/About/About'
import Portfolio from './pages/Portfolio/Portfolio'
import MindMap from './pages/Portfolio/MindMap/MindMap'
import BodyParts from './pages/BodyParts/BodyParts'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/portfolio/all" element={<Portfolio />} />
      <Route path="/portfolio/poster" element={<Portfolio />} />
      <Route path="/portfolio/web" element={<Portfolio />} />
      <Route path="/portfolio/3d" element={<Portfolio />} />
      <Route path="/portfolio/2d" element={<Portfolio />} />
      <Route path="/portfolio/club" element={<Portfolio />} />
      <Route path="/portfolio/video" element={<Portfolio />} />
      <Route path="/portfolio/branding" element={<Portfolio />} />
      <Route path="/portfolio/:slug" element={<MindMap />} />
      <Route path="/body-parts" element={<BodyParts />} />
    </Routes>
  )
}
