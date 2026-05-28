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
      <Route path="/portfolio/poster" element={<Portfolio />} />
      <Route path="/portfolio/web" element={<Portfolio />} />
      <Route path="/portfolio/more" element={<Portfolio />} />
      <Route path="/portfolio/:slug" element={<MindMap />} />
      <Route path="/body-parts" element={<BodyParts />} />
    </Routes>
  )
}
