import { useEffect, useState } from 'react'
import { Github, Twitter, Mail, ArrowRight, X } from 'lucide-react'
import MDEditor from '@uiw/react-md-editor'
import Typewriter from 'typewriter-effect'

export default function Home() {
  const [settings, setSettings] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [activePost, setActivePost] = useState<any>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/settings').then(r => r.ok ? r.json() : null),
      fetch('/api/projects').then(r => r.ok ? r.json() : []),
      fetch('/api/categories').then(r => r.ok ? r.json() : []),
      fetch('/api/posts').then(r => r.ok ? r.json() : [])
    ]).then(([s, p, c, po]) => {
      setSettings(s || { siteTitle: 'My Project', heroTitle: 'Welcome', heroSubtitle: 'Setup your site in admin panel', themeColor: '#000' })
      setProjects(p || [])
      setCategories(c || [])
      setPosts(po || [])
      
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
      
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/70 dark:bg-zinc-950/70 border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight" style={{ color: 'var(--primary)' }}>
            {settings.siteTitle}
          </div>
          <div className="flex items-center space-x-6 text-sm font-medium">
            <a href="#projects" className="hover:text-[var(--primary)] transition-colors">项目展示</a>
            <a href="#featured-posts" className="hover:text-[var(--primary)] transition-colors">精选内容</a>
            {categories.filter(c => !c.parentId).map(c => (
              <a key={c.id} href={`/articles?categoryId=${c.id}`} className="hover:text-[var(--primary)] transition-colors">{c.name}</a>
            ))}
            <a href="/admin" className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full hover:scale-105 transition-transform">后台管理</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-12 overflow-hidden bg-white dark:bg-zinc-950">
        {/* Subtle background pattern/mesh */}
        <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        
        {settings.heroBgUrl && (
          <div className="absolute inset-0 z-0">
            <img src={settings.heroBgUrl} alt="Background" className="w-full h-full object-cover opacity-80 mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/80 to-white dark:from-zinc-950/60 dark:via-zinc-950/80 dark:to-zinc-950 backdrop-blur-[2px]"></div>
          </div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col-reverse lg:flex-row items-center justify-between gap-16 lg:gap-24">
          <div className="flex-1 text-center lg:text-left mt-8 lg:mt-0">
            {settings.badgeText && (
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-8 tracking-wide animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
                <span className="w-2 h-2 rounded-full mr-2 animate-pulse" style={{ backgroundColor: 'var(--primary)' }}></span>
                {settings.badgeText}
              </div>
            )}
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
              <span className="block text-zinc-900 dark:text-white mb-2">{settings.heroTitle}</span>
              <span className="block text-transparent bg-clip-text" style={settings.themeColor?.includes('gradient') ? { backgroundImage: settings.themeColor } : { backgroundColor: 'var(--primary)', backgroundImage: `linear-gradient(to right, var(--primary), var(--primary))` }}>
                <Typewriter
                  options={{
                    strings: ['独立开发者', '全栈工程师', '开源爱好者'],
                    autoStart: true,
                    loop: true,
                    wrapperClassName: 'pixel-font',
                    cursorClassName: 'pixel-font text-[var(--primary)]'
                  }}
                />
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-zinc-500 dark:text-zinc-400 mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light tracking-wide animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
              {settings.heroSubtitle}
            </p>
            
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
                  className="relative z-10 w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-[2rem] border border-white/20 dark:border-zinc-800/50 shadow-2xl object-cover transition-transform duration-700 group-hover:scale-[1.02] group-hover:-rotate-2" 
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-32 bg-zinc-50 dark:bg-zinc-900/30 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-sm font-bold tracking-widest text-zinc-400 uppercase mb-3">Selected Works</h2>
              <h3 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">精选项目</h3>
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
                className={`group relative flex flex-col rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 ${index % 2 === 1 ? 'md:mt-24' : ''}`}
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 rounded-3xl relative z-0">
                  {p.coverUrl ? (
                    <>
                      <img src={p.coverUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400 font-medium">Image Not Available</div>
                  )}
                  
                  <div className="absolute top-6 right-6 w-12 h-12 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100 shadow-xl">
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
      <section id="featured-posts" className="py-32 bg-white dark:bg-zinc-950 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-8">
            <div>
              <h2 className="text-sm font-bold tracking-widest text-zinc-400 uppercase mb-3">Featured Articles</h2>
              <h3 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">精选内容</h3>
            </div>
            <a 
              href="/articles" 
              className={`group inline-flex items-center font-bold text-lg hover:opacity-80 transition-opacity ${settings.themeColor?.includes('gradient') ? 'text-primary-gradient' : 'text-[var(--primary)]'}`}
            >
              查看全部文章 <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16">
            {posts.filter(p => p.isFeatured).map((post) => (
              <div 
                key={post.id} 
                onClick={() => setActivePost(post)}
                className="group cursor-pointer flex flex-col"
              >
                <div className="aspect-[4/5] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 rounded-3xl relative mb-6">
                  {post.thumbnailUrl ? (
                    <>
                      <img src={post.thumbnailUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
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
              </div>
            ))}
          </div>
          
          {posts.filter(p => p.isFeatured).length === 0 && (
            <div className="text-center py-24 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-500 dark:text-zinc-400 text-lg">暂无精选内容，请在后台设置</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-center relative z-10">
        <div className="flex justify-center space-x-6 mb-6">
          <a href="#" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"><Github className="w-6 h-6" /></a>
          <a href="#" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"><Twitter className="w-6 h-6" /></a>
          <a href="#" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"><Mail className="w-6 h-6" /></a>
        </div>
        <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} {settings.siteTitle}. All rights reserved.</p>
      </footer>

      {/* Post Modal */}
      {activePost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 bg-black/60 backdrop-blur-sm">
          <div 
            className="absolute inset-0" 
            onClick={() => setActivePost(null)}
          ></div>
          <div className="relative bg-white dark:bg-zinc-900 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white truncate pr-8">{activePost.title}</h2>
              <button 
                onClick={() => setActivePost(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
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
    </div>
  )
}
