import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { Project } from '@prisma/client'
import FloatingRobot from '../components/FloatingRobot'

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
          <div className="mb-16 text-center flex flex-col items-center gap-4">
            <h1 className="pixel-font text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white text-balance drop-shadow-md">
              作品集
            </h1>
            <p className="text-zinc-600 dark:text-zinc-300 max-w-2xl text-lg drop-shadow-sm font-medium bg-white/40 dark:bg-black/40 px-6 py-2 rounded-full backdrop-blur-sm">
              这里展示了我近期参与开发或主导的核心项目，涵盖前端交互、全栈开发与用户体验设计。
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {projects.map((p, index) => (
              <a 
                key={p.id} 
                href={p.projectUrl} 
                target="_blank" 
                rel="noreferrer" 
                className={`group relative flex flex-col rounded-3xl overflow-hidden transition-[transform,box-shadow] duration-500 hover:-translate-y-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl hover:shadow-2xl hover:border-[var(--primary)]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${index % 2 === 1 ? 'md:mt-16' : ''}`}
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 relative z-0">
                  {p.coverUrl ? (
                    <>
                      <img
                        src={p.coverUrl}
                        alt={p.title}
                        width={800}
                        height={600}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500"></div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400 font-medium">Image Not Available</div>
                  )}
                  
                  <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 z-10">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="text-2xl font-bold text-white group-hover:text-[var(--primary)] transition-colors">{p.title}</h3>
                    </div>
                    <p className="text-zinc-300 text-base leading-relaxed line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{p.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {p.tags && p.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean).map((tag: string) => (
                        <span key={tag} className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/10">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="absolute top-6 right-6 w-12 h-12 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-[transform,opacity] duration-500 delay-100 shadow-xl z-20">
                    <ArrowRight className="w-5 h-5 text-zinc-900 dark:text-white -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                  </div>
                </div>
              </a>
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
