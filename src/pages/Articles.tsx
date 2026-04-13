import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Folder, ChevronRight, X, Calendar, FileText } from 'lucide-react'
import MDEditor from '@uiw/react-md-editor'
import { motion, AnimatePresence } from 'framer-motion'
import FloatingRobot from '../components/FloatingRobot'
import Typewriter from 'typewriter-effect'

interface ExtendedSetting {
  siteTitle: string
  themeColor: string
  heroBgUrl?: string | null
  heroBgOpacity?: number
  blogBgUrl?: string | null
  blogBgOpacity?: number
  blogSubtitle?: string
}

export default function Articles() {
  const [settings, setSettings] = useState<ExtendedSetting | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [activePost, setActivePost] = useState<any>(null)

  // Get initial categoryId from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const categoryId = params.get('categoryId')
    if (categoryId) {
      setActiveCategory(categoryId)
    }
  }, [])

  useEffect(() => {
    Promise.all([
      fetch('/api/settings').then(r => r.ok ? r.json() : null),
      fetch('/api/categories').then(r => r.ok ? r.json() : []),
      fetch('/api/posts').then(r => r.ok ? r.json() : [])
    ]).then(([s, c, po]) => {
      setSettings(s ? { ...s } : { siteTitle: 'My Project', themeColor: '#000' })
      setCategories(c || [])
      setPosts(po || [])
      
      if (s?.themeColor) {
        document.documentElement.style.setProperty('--primary', s.themeColor)
        
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
      setSettings({ siteTitle: 'Error', themeColor: '#000' })
    })
  }, [])

  const { tree, map } = useMemo(() => {
    const tree: any[] = []
    const map: any = {}
    categories.forEach(c => map[c.id] = { ...c, children: [] })
    categories.forEach(c => {
      if (c.parentId && map[c.parentId]) {
        map[c.parentId].children.push(map[c.id])
      } else {
        tree.push(map[c.id])
      }
    })
    return { tree, map }
  }, [categories])

  // By default expand all top-level categories
  useEffect(() => {
    if (categories.length > 0 && expandedCategories.size === 0) {
      const initialExpanded = new Set<string>()
      // We could expand everything, or just level 1.
      // Let's expand all categories to match the aiking.dev layout (where top level folders are just sections)
      // Actually, wait, aiking.dev has folders that don't expand, they are just section headings.
      // But we have a dynamic tree. Let's expand everything that has children so it behaves like accordions by default, or just leave them closed. Let's leave them open if it's the first time.
      Object.values(map).forEach((cat: any) => {
        if (cat.children && cat.children.length > 0) initialExpanded.add(cat.id)
      })
      setExpandedCategories(initialExpanded)
    }
  }, [categories, map, expandedCategories.size])

  // Handle clicking outside the article content to close it
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activePost) {
        setActivePost(null)
      }
    }
    
    const handleClickOutside = (e: MouseEvent) => {
      if (activePost) {
        const articleContainer = document.getElementById('article-content-container')
        if (articleContainer && !articleContainer.contains(e.target as Node)) {
          // Check if we didn't click inside a button/link which might be navigation
          const target = e.target as HTMLElement
          if (!target.closest('button') && !target.closest('a')) {
             setActivePost(null)
          }
        }
      }
    }

    window.addEventListener('keydown', handleEsc)
    // Add click listener with a slight delay to avoid triggering on the click that opens the post
    const timer = setTimeout(() => {
      window.addEventListener('click', handleClickOutside)
    }, 100)

    return () => {
      window.removeEventListener('keydown', handleEsc)
      window.removeEventListener('click', handleClickOutside)
      clearTimeout(timer)
    }
  }, [activePost])

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="animate-pulse w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
      </div>
    )
  }

  const toggleExpand = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const totalPosts = posts.length

  // Helper to recursively get all descendants
  const getDescendantIds = (cat: any): string[] => {
    let ids = [cat.id]
    if (cat.children) {
      cat.children.forEach((child: any) => {
        ids = ids.concat(getDescendantIds(child))
      })
    }
    return ids
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-[var(--primary)] selection:text-white">
      {/* Background Wallpaper */}
      {settings?.blogBgUrl && (
        <div 
          className="fixed inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `url(${settings.blogBgUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            opacity: settings.blogBgOpacity ?? 1
          }}
        />
      )}
      
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="sticky top-0 w-full z-50 backdrop-blur-md bg-white/70 dark:bg-zinc-950/70 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="text-zinc-500 hover:text-[var(--primary)] mr-4 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div 
                className={`font-bold text-xl tracking-tight ${settings.themeColor?.includes('gradient') ? 'text-primary-gradient' : ''}`} 
                style={settings.themeColor?.includes('gradient') ? {} : { color: 'var(--primary)' }}
              >
                {settings.siteTitle} <span className="text-zinc-400 dark:text-zinc-600 font-normal ml-2">/ 博客</span>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm font-medium">
              <Link to="/" className="hover:text-[var(--primary)] transition-colors">首页</Link>
              <Link to="/projects" className="hover:text-[var(--primary)] transition-colors">作品集</Link>
              <Link to="/articles" className="text-[var(--primary)] transition-colors">博客</Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="pt-24 pb-16 px-6 text-center relative z-10">
          <motion.h1 
            className="pixel-font text-4xl md:text-5xl font-extrabold tracking-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            博客
          </motion.h1>
          <motion.div 
            className="text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl mx-auto mb-8 h-8 flex items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="pixel-font tracking-wide">
              <Typewriter
                options={{
                  strings: settings?.blogSubtitle 
                    ? settings.blogSubtitle.split(',').map(s => s.trim())
                    : ['AIGC 实践心得', '开发经验', '技术探索笔记'],
                  autoStart: true,
                  loop: true,
                  delay: 50,
                  deleteSpeed: 30,
                  cursor: '_'
                }}
              />
            </div>
          </motion.div>
          <motion.div 
            className="inline-flex items-center px-4 py-1.5 rounded-full bg-zinc-200/50 dark:bg-zinc-800/50 text-sm font-medium text-zinc-600 dark:text-zinc-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            共 {totalPosts} 篇文章
          </motion.div>
        </div>

        {/* Main Content Container */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 relative z-10">
          <AnimatePresence mode="wait">
            {!activePost ? (
              <motion.div 
                key="list-view"
                className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-[2rem] p-6 md:p-10 shadow-sm"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {tree.length === 0 ? (
                  <div className="text-center py-20 text-zinc-500">
                    暂无分类数据
                  </div>
                ) : (
                  <div className="space-y-12">
                    {tree.map((category: any) => {
                      const descendantIds = getDescendantIds(category)
                      const count = posts.filter(p => descendantIds.includes(p.categoryId)).length
                      
                      return (
                        <div key={category.id} className="group">
                          {/* Top Level Category Header */}
                          <div className="flex items-center gap-3 mb-6">
                            <Folder className="w-6 h-6 text-[var(--primary)]" />
                            <h2 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{category.name}</h2>
                            <span className="px-2.5 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold tabular-nums">
                              {count}
                            </span>
                          </div>

                          {/* Content of Top Level Category */}
                          <div className="space-y-3">
                            {category.children && category.children.map((child: any) => (
                              <SubCategoryAccordion 
                                key={child.id}
                                category={child}
                                posts={posts}
                                expandedCategories={expandedCategories}
                                toggleExpand={toggleExpand}
                                setActivePost={setActivePost}
                                getDescendantIds={getDescendantIds}
                              />
                            ))}
                            
                            {/* Direct posts under this top level category */}
                            {posts.filter(p => p.categoryId === category.id).map(post => (
                              <PostRow key={post.id} post={post} onClick={() => setActivePost(post)} />
                            ))}

                            {count === 0 && (
                              <div className="pl-9 text-sm text-zinc-400">
                                该分类下暂无文章
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                id="article-content-container"
                key="post-view"
                layoutId={`post-${activePost.id}`}
                className="bg-white dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-[2rem] p-6 md:p-12 shadow-xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="flex justify-between items-start mb-12 border-b border-zinc-100 dark:border-zinc-800/50 pb-8">
                  <div>
                    <motion.h1 
                      layoutId={`post-title-${activePost.id}`}
                      className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-zinc-900 dark:text-white leading-tight mb-6"
                    >
                      {activePost.title}
                    </motion.h1>
                    <motion.div 
                      className="flex flex-wrap items-center gap-4 text-zinc-500 dark:text-zinc-400 font-medium text-sm"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <span className="flex items-center gap-1.5"><Folder className="w-4 h-4" /> {activePost.category?.name || '未分类'}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(activePost.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </motion.div>
                  </div>
                  <button 
                    onClick={() => setActivePost(null)} 
                    className="p-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all shadow-sm hover:scale-105 active:scale-95 shrink-0 ml-4"
                    aria-label="返回列表"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Post Content */}
                <motion.div 
                  className="prose dark:prose-invert max-w-none prose-zinc prose-headings:text-[var(--primary)] prose-a:text-[var(--primary)] prose-img:rounded-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div data-color-mode="light" className="dark:hidden">
                    <MDEditor.Markdown source={activePost.content} style={{ backgroundColor: 'transparent', color: 'inherit' }} />
                  </div>
                  <div data-color-mode="dark" className="hidden dark:block">
                    <MDEditor.Markdown source={activePost.content} style={{ backgroundColor: 'transparent', color: 'inherit' }} />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="py-12 text-center text-zinc-500 dark:text-zinc-400 relative z-10">
          <p className="font-medium text-sm">© {new Date().getFullYear()} {settings.siteTitle}. All rights reserved.</p>
        </footer>
      </div>

      {/* Floating Robot for Admin Navigation */}
      <FloatingRobot />
    </div>
  )
}

function SubCategoryAccordion({ category, posts, expandedCategories, toggleExpand, setActivePost, getDescendantIds }: any) {
  const isExpanded = expandedCategories.has(category.id)
  const descendantIds = getDescendantIds(category)
  const count = posts.filter((p: any) => descendantIds.includes(p.categoryId)).length
  const directPosts = posts.filter((p: any) => p.categoryId === category.id)

  if (count === 0) return null

  return (
    <div className="mb-3">
      <button 
        onClick={() => toggleExpand(category.id)}
        className="w-full flex items-center justify-between p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/30 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-700/50 transition-colors text-left group"
      >
        <div className="flex items-center gap-3">
          <ChevronRight className={`w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          <span className="font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">{category.name}</span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-zinc-200/50 dark:bg-zinc-700/50 text-zinc-600 dark:text-zinc-400 text-xs font-bold tabular-nums">
          {count}
        </span>
      </button>
      
      {isExpanded && (
        <div className="pl-4 pr-2 py-3 mt-1 space-y-1.5 border-l-2 border-zinc-200 dark:border-zinc-800 ml-6 animate-in fade-in slide-in-from-top-2 duration-300">
          {category.children && category.children.map((child: any) => (
            <SubCategoryAccordion 
              key={child.id}
              category={child}
              posts={posts}
              expandedCategories={expandedCategories}
              toggleExpand={toggleExpand}
              setActivePost={setActivePost}
              getDescendantIds={getDescendantIds}
            />
          ))}
          {directPosts.map((post: any) => (
            <PostRow key={post.id} post={post} onClick={() => setActivePost(post)} />
          ))}
        </div>
      )}
    </div>
  )
}

function PostRow({ post, onClick }: { post: any, onClick: () => void }) {
  return (
    <motion.button 
      layoutId={`post-${post.id}`}
      onClick={onClick}
      className="w-full group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 transition-colors text-left gap-2"
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <FileText className="w-4 h-4 text-zinc-400 group-hover:text-[var(--primary)] shrink-0 transition-colors" />
        <motion.span 
          layoutId={`post-title-${post.id}`}
          className="text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white truncate transition-colors font-medium"
        >
          {post.title}
        </motion.span>
      </div>
      <span className="text-xs text-zinc-400 shrink-0 sm:ml-4 tabular-nums font-medium tracking-wide">
        {new Date(post.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })}
      </span>
    </motion.button>
  )
}
