import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Github, Twitter, Mail, ArrowRight, ArrowLeft, X, FileText } from 'lucide-react'
import MDEditor from '@uiw/react-md-editor'

export default function Articles() {
  const [settings, setSettings] = useState<any>(null)
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
      setSettings(s || { siteTitle: 'My Project', themeColor: '#000' })
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

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="animate-pulse w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
      </div>
    )
  }

  const buildTree = (cats: any[]) => {
    const tree: any[] = []
    const map: any = {}
    cats.forEach(c => map[c.id] = { ...c, children: [] })
    cats.forEach(c => {
      if (c.parentId && map[c.parentId]) {
        map[c.parentId].children.push(map[c.id])
      } else {
        tree.push(map[c.id])
      }
    })
    return { tree, map }
  }

  const { tree, map } = buildTree(categories)

  // Find the root category (Level 1) of the currently active category
  let rootCategory: any = null
  if (activeCategory !== 'all' && map[activeCategory]) {
    let current = map[activeCategory]
    while (current.parentId && map[current.parentId]) {
      current = map[current.parentId]
    }
    rootCategory = current
  } else if (activeCategory !== 'all') {
    // fallback if not found
    rootCategory = null
  }

  // Get all descendant category IDs to filter posts correctly
  const getDescendantIds = (cat: any): string[] => {
    let ids = [cat.id]
    if (cat.children) {
      cat.children.forEach((child: any) => {
        ids = ids.concat(getDescendantIds(child))
      })
    }
    return ids
  }

  const activeCategoryDescendants = activeCategory !== 'all' && map[activeCategory] 
    ? getDescendantIds(map[activeCategory]) 
    : []

  const filteredPosts = activeCategory === 'all' 
    ? posts 
    : posts.filter(p => activeCategoryDescendants.includes(p.categoryId))

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const renderCategoryNode = (node: any, level: number = 1) => {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expandedCategories.has(node.id) || activeCategoryDescendants.includes(node.id)
    const isActive = activeCategory === node.id

    // Only show level 2 and 3 in the sidebar, since level 1 is the page context
    if (level === 1) {
      return (
        <li key={node.id} className="mb-6">
          <button
            onClick={() => setActiveCategory(node.id)}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-colors mb-2 ${
              isActive
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                : 'text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
          >
            {node.name}
            <span className="float-right opacity-60 font-normal">{posts.filter(p => getDescendantIds(node).includes(p.categoryId)).length}</span>
          </button>
          {hasChildren && (
            <ul className="space-y-1 ml-2 border-l border-zinc-200 dark:border-zinc-800 pl-2">
              {node.children.map((child: any) => renderCategoryNode(child, level + 1))}
            </ul>
          )}
        </li>
      )
    }

    return (
      <li key={node.id}>
        <div className={`flex items-center w-full rounded-lg transition-colors ${
          isActive
            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium'
            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
        }`}>
          {hasChildren && (
            <button 
              onClick={(e) => toggleExpand(node.id, e)}
              className="p-2 hover:text-zinc-900 dark:hover:text-white"
            >
              <svg className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          <button
            onClick={() => setActiveCategory(node.id)}
            className={`flex-1 text-left py-2 text-sm ${!hasChildren ? 'pl-7' : 'pl-1'}`}
          >
            {node.name}
            <span className="float-right opacity-60 pr-4">{posts.filter(p => getDescendantIds(node).includes(p.categoryId)).length}</span>
          </button>
        </div>
        {hasChildren && isExpanded && (
          <ul className="space-y-1 ml-4 border-l border-zinc-200 dark:border-zinc-800 pl-2 mt-1">
            {node.children.map((child: any) => renderCategoryNode(child, level + 1))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-[var(--primary)] selection:text-white">
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
              {settings.siteTitle} <span className="text-zinc-400 dark:text-zinc-600 font-normal ml-2">/ 文章</span>
            </div>
          </div>
          <div className="flex items-center space-x-6 text-sm font-medium">
            <a href="/#projects" className="hover:text-[var(--primary)] transition-colors">项目展示</a>
            <a href="/#featured-posts" className="hover:text-[var(--primary)] transition-colors">精选内容</a>
            {categories.filter(c => !c.parentId).map(c => (
              <button 
                key={c.id} 
                onClick={() => setActiveCategory(c.id)} 
                className="hover:text-[var(--primary)] transition-colors"
              >
                {c.name}
              </button>
            ))}
            <Link to="/admin" className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full hover:scale-105 transition-transform">后台管理</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full flex flex-col md:flex-row gap-12 relative z-10">
        {/* Sidebar Categories */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-24">
            <h2 className="text-sm font-bold tracking-wider text-zinc-400 uppercase mb-4">栏目分类</h2>
            <ul className="space-y-2">
              {rootCategory 
                ? renderCategoryNode(rootCategory)
                : tree.map(node => renderCategoryNode(node))
              }
            </ul>
          </div>
        </aside>

        {/* Posts Grid */}
        <main className="flex-1">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">该栏目下暂无文章</h3>
              <p className="text-zinc-500 dark:text-zinc-400">请尝试选择其他分类或稍后再来看看</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredPosts.map((post) => (
                <div 
                  key={post.id} 
                  onClick={() => setActivePost(post)}
                  className="group cursor-pointer bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-zinc-100 dark:border-zinc-800 hover:-translate-y-1 flex flex-col"
                >
                  <div className="aspect-[16/9] overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
                    {post.thumbnailUrl || post.imageUrl ? (
                      <img src={post.thumbnailUrl || post.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                        <FileText className="w-12 h-12 text-zinc-300 dark:text-zinc-700" />
                      </div>
                    )}
                    {post.isFeatured && (
                      <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                        精选
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center text-xs font-semibold tracking-wider uppercase mb-2 text-zinc-500">
                      <span className="text-[var(--primary)]">{post.category?.name}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3 group-hover:text-[var(--primary)] transition-colors line-clamp-2">{post.title}</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm line-clamp-3 mb-4">{post.summary || '暂无概要'}</p>
                    <div className="mt-auto flex items-center text-[var(--primary)] font-medium text-sm">
                      阅读全文 <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="py-12 text-center text-zinc-500 dark:text-zinc-400 relative z-10">
        <p className="font-medium text-sm">© {new Date().getFullYear()} {settings.siteTitle}. All rights reserved.</p>
      </footer>

      {/* Post Modal */}
      {activePost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setActivePost(null)}></div>
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
