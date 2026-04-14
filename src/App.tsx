import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Home from './pages/Home'
import ProjectsPage from './pages/Projects'
import Articles from './pages/Articles'
import AdminLayout from './components/AdminLayout'
import Login from './pages/admin/Login'
import FakeLogin from './pages/admin/FakeLogin'
import Dashboard from './pages/admin/Dashboard'
import Settings from './pages/admin/Settings'
import Projects from './pages/admin/Projects'
import Categories from './pages/admin/Categories'
import Posts from './pages/admin/Posts'
import WorkExperiences from './pages/admin/WorkExperiences'
import ProjectExperiences from './pages/admin/ProjectExperiences'
import SkillMatrix from './pages/admin/SkillMatrix'

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Home Page */}
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/projects" element={<PageTransition><ProjectsPage /></PageTransition>} />
        <Route path="/articles" element={<PageTransition><Articles /></PageTransition>} />
      
        <Route path="/admin" element={<PageTransition><FakeLogin /></PageTransition>} />
        <Route path="/admin/*" element={<PageTransition><FakeLogin /></PageTransition>} />

        <Route path="/console-center/login" element={<Login />} />
        <Route path="/console-center" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="settings" element={<Settings />} />
          <Route path="projects" element={<Projects />} />
          <Route path="project-experiences" element={<ProjectExperiences />} />
          <Route path="work-experiences" element={<WorkExperiences />} />
          <Route path="skill-matrix" element={<SkillMatrix />} />
          <Route path="categories" element={<Categories />} />
          <Route path="posts" element={<Posts />} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data?.siteTitle) document.title = data.siteTitle
        const href = data?.faviconUrl || '/favicon.svg'
        const existing = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null
        if (existing) {
          existing.href = href
        } else {
          const link = document.createElement('link')
          link.rel = 'icon'
          link.href = href
          document.head.appendChild(link)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}

export default App
