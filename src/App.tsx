import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ProjectsPage from './pages/Projects'
import Articles from './pages/Articles'
import AdminLayout from './components/AdminLayout'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import Settings from './pages/admin/Settings'
import Projects from './pages/admin/Projects'
import Categories from './pages/admin/Categories'
import Posts from './pages/admin/Posts'
import WorkExperiences from './pages/admin/WorkExperiences'
import ProjectExperiences from './pages/admin/ProjectExperiences'
import SkillMatrix from './pages/admin/SkillMatrix'

function App() {
  return (
    <BrowserRouter>
        <Routes>
          {/* Public Home Page */}
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/articles" element={<Articles />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<Login />} />

        {/* Admin Dashboard */}
        <Route path="/admin" element={<AdminLayout />}>
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
    </BrowserRouter>
  )
}

export default App
