import { useEffect, useState } from 'react'
import { Github, Twitter, Mail, ArrowRight, X } from 'lucide-react'
import MDEditor from '@uiw/react-md-editor'
import Typewriter from 'typewriter-effect'
import FloatingRobot from '../components/FloatingRobot'

export default function Home() {
  const [settings, setSettings] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [experiences, setExperiences] = useState<any[]>([])
  const [projectExperiences, setProjectExperiences] = useState<any[]>([])
  const [activePost, setActivePost] = useState<any>(null)
  const [activeExpId, setActiveExpId] = useState<string | null>(null)
  const [activeProjectExpId, setActiveProjectExpId] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/settings').then(r => r.ok ? r.json() : null),
      fetch('/api/projects').then(r => r.ok ? r.json() : []),
      fetch('/api/categories').then(r => r.ok ? r.json() : []),
      fetch('/api/posts').then(r => r.ok ? r.json() : []),
      fetch('/api/work-experiences').then(r => r.ok ? r.json() : []),
      fetch('/api/project-experiences').then(r => r.ok ? r.json() : [])
    ]).then(([s, p, c, po, exp, pexp]) => {
      setSettings(s || { siteTitle: 'My Project', heroTitle: 'Welcome', heroSubtitle: 'Setup your site in admin panel', themeColor: '#000' })
      setProjects(p || [])
      setCategories(c || [])
      setPosts(po || [])
      setExperiences(exp || [])
      setProjectExperiences(pexp || [])
      if ((pexp || []).length > 0) setActiveProjectExpId((pexp || [])[0].id)
      
      // Inject CSS variable for theme color
      if (s?.themeColor) {
        document.documentElement.style.setProperty('--primary', s.themeColor)
        
        // Add a global style for gradient text utilities if it's a gradient
        if (s.themeColor.includes('gradient')) {
          const style = document.createElement('style')
          style.innerHTML = `
            .text-primary-gradient {
              background: ${s.themeColor};
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            .bg-primary-gradient {
              background: ${s.themeColor};
            }
          `
          document.head.appendChild(style)
        }
      }
    }).catch(e => {
      console.error('Failed to load data:', e)
      setSettings({ siteTitle: 'Error', heroTitle: 'Service Unavailable', heroSubtitle: 'Could not connect to API', themeColor: '#f00' })
    })
  }, [])

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="animate-pulse w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
      </div>
    )
  }

  const activeProjectExp =
    projectExperiences.find(p => p.id === activeProjectExpId) || projectExperiences[0] || null

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-[var(--primary)] selection:text-white">
      {settings.heroBgUrl && (
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ 
            backgroundImage: `url(${settings.heroBgUrl})`,
            opacity: settings.heroBgOpacity ?? 1
          }}
        />
      )}

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-white focus:text-zinc-900 focus:shadow-xl dark:focus:bg-zinc-900 dark:focus:text-white"
      >
        跳到主要内容
      </a>
      
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/70 dark:bg-zinc-950/70 border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight" style={{ color: 'var(--primary)' }}>
            {settings.siteTitle}
          </div>
          <div className="flex items-center space-x-6 text-sm font-medium">
            <a href="#experience" className="hover:text-[var(--primary)] transition-colors">工作经历</a>
            <a href="#project-experiences" className="hover:text-[var(--primary)] transition-colors">项目经历</a>
            <a href="#projects" className="hover:text-[var(--primary)] transition-colors">个人项目</a>
            <a href="#featured-posts" className="hover:text-[var(--primary)] transition-colors">技术博客</a>
            {categories.filter(c => !c.parentId).map(c => (
              <a key={c.id} href={`/articles?categoryId=${c.id}`} className="hover:text-[var(--primary)] transition-colors">{c.name}</a>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="main-content" className="relative min-h-screen flex items-center justify-center pt-20 pb-12 overflow-hidden scroll-mt-24">
        {/* Subtle background pattern/mesh */}
        <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col-reverse lg:flex-row items-center justify-between gap-16 lg:gap-24">
          <div className="flex-1 text-center lg:text-left mt-8 lg:mt-0">
            {/* {settings.badgeText && (
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-8 tracking-wide animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
                <span className="w-2 h-2 rounded-full mr-2 animate-pulse" style={{ backgroundColor: 'var(--primary)' }}></span>
                {settings.badgeText}
              </div>
            )} */}
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
              <span className="block text-transparent bg-clip-text" style={settings.themeColor?.includes('gradient') ? { backgroundImage: settings.themeColor } : { backgroundColor: 'var(--primary)', backgroundImage: `linear-gradient(to right, var(--primary), var(--primary))` }}>
                <Typewriter
                  options={{
                    strings: settings.heroTitle ? settings.heroTitle.split(',').map((s: string) => s.trim()) : ['独立开发者', '全栈工程师', '开源爱好者'],
                    autoStart: true,
                    loop: true,
                    wrapperClassName: 'pixel-font',
                    cursorClassName: 'pixel-font text-[var(--primary)]'
                  }}
                />
              </span>
            </h1>
            
            <div 
              className="mx-auto lg:mx-0 inline-flex items-center gap-4 px-6 py-3.5 mb-12 border border-zinc-200/80 dark:border-zinc-800/80 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md rounded-full shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.2)] animate-fade-in-up group hover:border-[var(--primary)]/30 transition-[border-color,box-shadow,background-color] duration-500"
              style={{ animationDelay: '300ms', animationFillMode: 'both' }}
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--primary)]/10">
                <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse shadow-[0_0_8px_var(--primary)]" />
              </div>
              <p className="text-base sm:text-lg text-zinc-700 dark:text-zinc-200 font-medium tracking-wide">
                {settings.heroSubtitle}
              </p>
            </div>
            
            {/* 这里原本是 "查看精选作品" 和 "阅读技术随笔" 的按钮链接 */}
            {/* <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 animate-fade-in-up" style={{ animationDelay: '500ms', animationFillMode: 'both' }}> ... </div> */}
          </div>
          
          {settings.avatarUrl && (
            <div className="flex-1 flex justify-center lg:justify-end animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
              <div className="relative group">
                <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-[var(--primary)] to-transparent opacity-20 group-hover:opacity-40 blur-2xl transition-opacity duration-700 animate-pulse"></div>
                <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-tr from-[var(--primary)] to-white/10 opacity-30 group-hover:opacity-60 blur-md transition-opacity duration-700"></div>
                <img 
                  src={settings.avatarUrl} 
                  alt="Avatar" 
                  width={384}
                  height={384}
                  fetchPriority="high"
                  className="relative z-10 w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-[2rem] border border-white/20 dark:border-zinc-800/50 shadow-2xl object-cover transition-transform duration-700 group-hover:scale-[1.02] group-hover:-rotate-2" 
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Experience Section */}
      {experiences.length > 0 && (
        <section id="experience" className="py-32 relative z-10 scroll-mt-24">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-zinc-900 dark:text-white" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              工作经历
            </h2>
            <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-4 md:ml-8 lg:ml-12 space-y-12 pb-8">
              {experiences.map((exp, idx) => {
                const isActive = activeExpId === exp.id
                return (
                  <button
                    key={exp.id}
                    type="button"
                    className="relative pl-8 md:pl-12 group w-full text-left rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950"
                    onClick={() => setActiveExpId(isActive ? null : exp.id)}
                  >
                    {/* Timeline Node */}
                    <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full transition-[transform,background-color] duration-500 ${isActive ? 'bg-[var(--primary)] scale-150' : 'bg-zinc-300 dark:bg-zinc-700 group-hover:bg-[var(--primary)] group-hover:scale-125'}`} style={{ boxShadow: isActive ? '0 0 15px var(--primary)' : 'none' }} />
                    
                    <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2">
                      <h3 className={`text-xl font-bold transition-colors duration-300 ${isActive ? 'text-[var(--primary)]' : 'text-zinc-900 dark:text-white group-hover:text-[var(--primary)]'}`}>
                        {exp.company}
                      </h3>
                      <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 font-mono mt-1 md:mt-0">
                        {exp.startDate} — {exp.endDate}
                      </span>
                    </div>
                    
                    <h4 className="text-lg text-zinc-700 dark:text-zinc-300 mb-3 font-medium">
                      {exp.position}
                    </h4>

                    {/* Expandable Content */}
                    <div className={`grid transition-opacity duration-500 ease-in-out ${isActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden">
                        <div className="pt-2 pb-4 text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap border-l-2 border-[var(--primary)]/30 pl-4 mt-2">
                          {exp.description}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {projectExperiences.length > 0 && (
        <section id="project-experiences" className="py-32 relative z-10 scroll-mt-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <h2 className="text-sm font-bold tracking-widest text-zinc-400 uppercase mb-3">Project Experience</h2>
                <h3 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">项目经历</h3>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-md text-lg">
                记录关键项目中的角色、目标与结果，点击左侧时间轴查看详情。
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-5">
                <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-4 space-y-10">
                  {projectExperiences.map((exp) => {
                    const isActive = activeProjectExpId === exp.id
                    return (
                      <button
                        key={exp.id}
                        type="button"
                        onClick={() => setActiveProjectExpId(exp.id)}
                        className="relative w-full text-left pl-8 group rounded-xl focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950"
                      >
                        <span
                          className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full transition-[transform,background-color] duration-500 ${isActive ? 'bg-[var(--primary)] scale-150' : 'bg-zinc-300 dark:bg-zinc-700 group-hover:bg-[var(--primary)] group-hover:scale-125'}`}
                          style={{ boxShadow: isActive ? '0 0 18px var(--primary)' : 'none' }}
                        />
                        <div className="flex items-baseline justify-between gap-4 mb-1">
                          <div className={`text-lg font-bold transition-colors duration-300 ${isActive ? 'text-[var(--primary)]' : 'text-zinc-900 dark:text-white group-hover:text-[var(--primary)]'}`}>
                            {exp.projectName}
                          </div>
                          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 font-mono whitespace-nowrap">
                            {exp.startDate} — {exp.endDate}
                          </div>
                        </div>
                        <div className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                          {exp.role}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md shadow-[0_12px_60px_-24px_rgba(0,0,0,0.25)] transition-shadow duration-700">
                  <div className="p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 mb-4">
                      <div className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                        {activeProjectExp?.projectName}
                      </div>
                      <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 font-mono">
                        {activeProjectExp?.startDate} — {activeProjectExp?.endDate}
                      </div>
                    </div>
                    <div className="text-zinc-700 dark:text-zinc-300 font-semibold mb-6">
                      {activeProjectExp?.role}
                    </div>

                    <div className="prose dark:prose-invert max-w-none prose-zinc prose-headings:text-[var(--primary)] prose-a:text-[var(--primary)] prose-img:rounded-xl">
                      <div data-color-mode="light" className="dark:hidden">
                        <MDEditor.Markdown source={activeProjectExp?.content || ''} style={{ backgroundColor: 'transparent', color: 'inherit' }} />
                      </div>
                      <div data-color-mode="dark" className="hidden dark:block">
                        <MDEditor.Markdown source={activeProjectExp?.content || ''} style={{ backgroundColor: 'transparent', color: 'inherit' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Projects Section */}
      <section id="projects" className="py-32 relative z-10 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-sm font-bold tracking-widest text-zinc-400 uppercase mb-3">Personal Projects</h2>
              <h3 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">个人项目</h3>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-md text-lg">
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
                className={`group relative flex flex-col rounded-3xl overflow-hidden transition-[transform,box-shadow] duration-500 hover:-translate-y-2 ${index % 2 === 1 ? 'md:mt-24' : ''}`}
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 rounded-3xl relative z-0">
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400 font-medium">Image Not Available</div>
                  )}
                  
                  <div className="absolute top-6 right-6 w-12 h-12 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-[transform,opacity] duration-500 delay-100 shadow-xl">
                    <ArrowRight className="w-5 h-5 text-zinc-900 dark:text-white -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                  </div>
                </div>
                
                <div className="pt-8 pb-4 relative z-10">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white group-hover:text-[var(--primary)] transition-colors">{p.title}</h3>
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed">{p.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      <section id="featured-posts" className="py-32 relative z-10 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-8">
            <div>
              <h2 className="text-sm font-bold tracking-widest text-zinc-400 uppercase mb-3">Tech Blog</h2>
              <h3 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">技术博客</h3>
            </div>
            <a 
              href="/articles" 
              className={`group inline-flex items-center font-bold text-lg hover:opacity-80 transition-opacity ${settings.themeColor?.includes('gradient') ? 'text-primary-gradient' : 'text-[var(--primary)]'}`}
            >
              查看全部博客 <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16">
            {posts.filter(p => p.isFeatured).map((post) => (
              <button
                key={post.id} 
                onClick={() => setActivePost(post)}
                type="button"
                className="group cursor-pointer flex flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950 rounded-3xl"
              >
                <div className="aspect-[4/5] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 rounded-3xl relative mb-6">
                  {post.thumbnailUrl ? (
                    <>
                      <img
                        src={post.thumbnailUrl}
                        alt={post.title}
                        width={600}
                        height={750}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300">暂无图片</div>
                  )}
                  
                  {post.category?.name && (
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-xs font-bold tracking-wider uppercase text-zinc-900 dark:text-white shadow-sm">
                        {post.category.name}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-3 text-sm text-zinc-400">
                    <time>{new Date(post.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })}</time>
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3 leading-snug group-hover:text-[var(--primary)] transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-base leading-relaxed line-clamp-3 mb-6">
                    {post.summary || '暂无概要'}
                  </p>
                  <div className="mt-auto flex items-center font-bold text-sm tracking-widest uppercase text-zinc-900 dark:text-white group-hover:text-[var(--primary)] transition-colors">
                    <span className="border-b-2 border-transparent group-hover:border-[var(--primary)] pb-1 transition-colors">阅读全文</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          {posts.filter(p => p.isFeatured).length === 0 && (
            <div className="text-center py-24 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-500 dark:text-zinc-400 text-lg">暂无技术博客，请在后台设置</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-200 dark:border-zinc-800 text-center relative z-10">
        <div className="flex justify-center space-x-6 mb-6">
          <a href="#" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"><Github className="w-6 h-6" /></a>
          <a href="#" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"><Twitter className="w-6 h-6" /></a>
          <a href="#" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"><Mail className="w-6 h-6" /></a>
        </div>
        <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} {settings.siteTitle}. All rights reserved.</p>
      </footer>
      </div>

      {/* Post Modal */}
      {activePost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 bg-black/60 backdrop-blur-sm">
          <button
            type="button"
            className="absolute inset-0"
            onClick={() => setActivePost(null)}
            aria-label="关闭"
          />
          <div className="relative bg-white dark:bg-zinc-900 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white truncate pr-8">{activePost.title}</h2>
              <button 
                onClick={() => setActivePost(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                aria-label="关闭"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 md:p-10">
              <div className="prose dark:prose-invert max-w-none prose-zinc prose-headings:text-[var(--primary)] prose-a:text-[var(--primary)] prose-img:rounded-xl">
                <div data-color-mode="light" className="dark:hidden">
                  <MDEditor.Markdown source={activePost.content} style={{ backgroundColor: 'transparent', color: 'inherit' }} />
                </div>
                <div data-color-mode="dark" className="hidden dark:block">
                  <MDEditor.Markdown source={activePost.content} style={{ backgroundColor: 'transparent', color: 'inherit' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Robot for Admin Navigation */}
      <FloatingRobot />
    </div>
  )
}
