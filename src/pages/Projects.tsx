import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Project } from '@prisma/client'
import FloatingRobot from '../components/FloatingRobot'
import Typewriter from 'typewriter-effect'

// Extending Project to match the data we fetch
interface ExtendedProject extends Project {
  tags?: string
}

// Extending Setting to include new fields without rewriting the entire type
interface ExtendedSetting {
  siteTitle: string
  themeColor: string
  projectsBgUrl?: string | null
  projectsBgOpacity?: number
  projectsSubtitle?: string
}

export default function Projects() {
  const [projects, setProjects] = useState<ExtendedProject[]>([])
  const [settings, setSettings] = useState<ExtendedSetting | null>(null)

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => setProjects(data))
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
    if (data?.themeColor) {
          setSettings({ ...data, badgeText: data.badgeText || 'AVAILABLE FOR NEW OPPORTUNITIES', skillsMatrixTitle: data.skillsMatrixTitle || '技能矩阵' })
          document.documentElement.style.setProperty('--primary', data.themeColor)
          const hex2rgb = (hex: string) => {
            const r = parseInt(hex.slice(1, 3), 16)
            const g = parseInt(hex.slice(3, 5), 16)
            const b = parseInt(hex.slice(5, 7), 16)
            return `${r}, ${g}, ${b}`
          }
          document.documentElement.style.setProperty('--primary-rgb', hex2rgb(data.themeColor))
        }
      })
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white selection:bg-[var(--primary)] selection:text-white">
      {/* Background Wallpaper */}
      {settings?.projectsBgUrl && (
        <div 
          className="fixed inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `url(${settings.projectsBgUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            opacity: settings.projectsBgOpacity ?? 1
          }}
        />
      )}

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/70 dark:bg-zinc-950/70 border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-bold text-xl tracking-tight" style={{ color: 'var(--primary)' }}>
            {settings?.siteTitle || 'My Portfolio'}
          </Link>
          <div className="flex items-center space-x-6 text-sm font-medium">
            <Link to="/" className="hover:text-[var(--primary)] transition-colors">首页</Link>
            <Link to="/projects" className="hover:text-[var(--primary)] transition-colors">作品集</Link>
            <Link to="/articles" className="hover:text-[var(--primary)] transition-colors">博客</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-20 pt-32 pb-24 min-h-screen flex flex-col">
        <div className="max-w-7xl mx-auto px-6 w-full flex-1">
          <motion.div 
            className="mb-16 text-center flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="pixel-font text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white text-balance drop-shadow-md">
              作品集
            </h1>
            <div className="text-zinc-600 dark:text-zinc-300 max-w-2xl text-lg drop-shadow-sm font-medium bg-white/40 dark:bg-black/40 px-6 py-2 rounded-full backdrop-blur-sm">
              <div className="pixel-font tracking-wide">
                <Typewriter
                  options={{
                    strings: settings?.projectsSubtitle 
                      ? settings.projectsSubtitle.split(',').map(s => s.trim())
                      : ['这里展示了我近期参与开发或主导的核心项目', '涵盖前端交互、全栈开发与用户体验设计'],
                    autoStart: true,
                    loop: true,
                    delay: 50,
                    deleteSpeed: 30,
                    cursor: '_'
                  }}
                />
              </div>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {projects.map((p, index) => (
              <motion.a
                key={p.id}
                href={p.projectUrl}
                target="_blank"
                rel="noreferrer"
                className="group relative flex flex-col rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:border-white/60 dark:hover:border-white/20 hover:ring-1 hover:ring-[var(--primary)]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
              >
                {/* Image Section */}
                <div className="aspect-[4/3] w-full overflow-hidden bg-white/20 dark:bg-black/20 relative z-0">
                  {p.coverUrl ? (
                    <img
                      src={p.coverUrl}
                      alt={p.title}
                      width={800}
                      height={600}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400 font-medium">Image Not Available</div>
                  )}
                  {/* Arrow Icon that slides in on hover */}
                  <div className="absolute top-4 right-4 w-10 h-10 bg-white/60 dark:bg-black/40 backdrop-blur-md border border-white/30 dark:border-white/10 rounded-full flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg z-20">
                    <ArrowRight className="w-4 h-4 text-zinc-900 dark:text-white -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                  </div>
                </div>

                {/* Text Content Section */}
                <div className="p-6 md:p-8 flex flex-col flex-grow z-10 relative bg-transparent">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 group-hover:text-[var(--primary)] transition-colors line-clamp-1 drop-shadow-sm">
                    {p.title}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed line-clamp-2 mb-4 flex-grow drop-shadow-sm">
                    {p.description}
                  </p>

                  {/* Tags */}
                  {p.tags && (
                    <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-zinc-200/30 dark:border-zinc-700/30">
                      {p.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean).slice(0, 3).map((tag: string) => (
                        <span key={tag} className="text-xs font-medium px-2.5 py-1 rounded-md bg-white/50 dark:bg-white/10 border border-white/20 text-zinc-700 dark:text-zinc-200 group-hover:bg-[var(--primary)]/10 group-hover:text-[var(--primary)] group-hover:border-[var(--primary)]/20 transition-colors duration-300 backdrop-blur-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.a>
            ))}
          </div>

          {projects.length === 0 && (
            <div className="text-center py-24 bg-white/50 dark:bg-zinc-900/30 backdrop-blur-md rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700">
              <p className="text-zinc-500 dark:text-zinc-400 text-lg">暂无作品集，请在后台添加</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-12 border-t border-zinc-200/50 dark:border-zinc-800/50 text-center relative z-10 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md">
        <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} {settings?.siteTitle || 'My Portfolio'}. All rights reserved.</p>
      </footer>

      <FloatingRobot />
    </div>
  )
}
