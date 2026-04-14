import { useState, useEffect, useRef, forwardRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Palette, ChevronLeft, Check } from 'lucide-react'

const SKINS = [
  {
    id: 'default',
    name: '幻彩默认',
    bg: 'bg-white/90 dark:bg-zinc-900/90',
    ring: 'from-cyan-400 via-purple-500 to-pink-500',
    eye1: 'from-cyan-400 to-purple-500',
    eye2: 'from-purple-500 to-pink-500',
    glow: 'rgba(168,85,247,0.4)',
    accessory: null
  },
  {
    id: 'cyber',
    name: '赛博朋克',
    bg: 'bg-zinc-900/95 dark:bg-black/95',
    ring: 'from-yellow-400 via-red-500 to-pink-500',
    eye1: 'from-cyan-400 to-blue-500', // 撞色设计：红黄色外框配蓝色眼睛
    eye2: 'from-blue-500 to-cyan-400',
    glow: 'rgba(239,68,68,0.6)',
    accessory: 'sunglasses'
  },
  {
    id: 'ocean',
    name: '深海幽蓝',
    bg: 'bg-blue-950/90 dark:bg-slate-950/95',
    ring: 'from-blue-400 via-indigo-500 to-cyan-400',
    eye1: 'from-amber-300 to-orange-500', // 撞色设计：蓝色外框配橙色眼睛
    eye2: 'from-orange-500 to-amber-300',
    glow: 'rgba(59,130,246,0.6)',
    accessory: 'snorkel'
  },
  {
    id: 'forest',
    name: '森之精灵',
    bg: 'bg-emerald-950/90 dark:bg-green-950/95',
    ring: 'from-green-400 via-emerald-500 to-teal-400',
    eye1: 'from-rose-400 to-red-500', // 撞色设计：绿色外框配红色眼睛
    eye2: 'from-red-500 to-rose-400',
    glow: 'rgba(16,185,129,0.6)',
    accessory: 'leaf'
  },
  {
    id: 'sunset',
    name: '落日余晖',
    bg: 'bg-orange-50/90 dark:bg-orange-950/90',
    ring: 'from-orange-400 via-amber-500 to-red-400',
    eye1: 'from-teal-400 to-emerald-500', // 撞色设计：橙色外框配青色眼睛
    eye2: 'from-emerald-500 to-teal-400',
    glow: 'rgba(245,158,11,0.6)',
    accessory: null
  },
  {
    id: 'monochrome',
    name: '极简黑白',
    bg: 'bg-zinc-100/95 dark:bg-zinc-800/95',
    ring: 'from-zinc-400 via-zinc-600 to-zinc-800',
    eye1: 'from-zinc-800 to-black dark:from-white dark:to-zinc-200', // 极简对比
    eye2: 'from-black to-zinc-800 dark:from-zinc-200 dark:to-white',
    glow: 'rgba(113,113,122,0.5)',
    accessory: 'tie'
  },
  {
    id: 'neon',
    name: '霓虹闪烁',
    bg: 'bg-fuchsia-950/90 dark:bg-purple-950/95',
    ring: 'from-fuchsia-400 via-purple-500 to-violet-400',
    eye1: 'from-lime-400 to-green-500', // 撞色设计：紫色外框配荧光绿眼睛
    eye2: 'from-green-500 to-lime-400',
    glow: 'rgba(217,70,239,0.6)',
    accessory: 'crown'
  },
  {
    id: 'gold',
    name: '流金岁月',
    bg: 'bg-amber-950/90 dark:bg-yellow-950/95',
    ring: 'from-yellow-200 via-yellow-400 to-yellow-600',
    eye1: 'from-indigo-400 to-blue-600', // 撞色设计：金色外框配深蓝色眼睛
    eye2: 'from-blue-600 to-indigo-400',
    glow: 'rgba(250,204,21,0.6)',
    accessory: 'star'
  }
]

const FloatingRobot = forwardRef<HTMLDivElement>((props, externalRef) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [coreOffset, setCoreOffset] = useState({ x: 0, y: 0 })
  const dragRef = useRef({ startX: 0, startY: 0, elemX: 0, elemY: 0, isDragging: false, hasMoved: false })
  const robotRef = useRef<HTMLDivElement | null>(null)

  const setCombinedRef = (node: HTMLDivElement) => {
    robotRef.current = node;
    if (typeof externalRef === 'function') {
      externalRef(node);
    } else if (externalRef) {
      externalRef.current = node;
    }
  };
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuView, setMenuView] = useState<'main' | 'skins'>('main')
  
  const [skinId, setSkinId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('robotSkin') || 'default'
    }
    return 'default'
  })

  const currentSkin = SKINS.find(s => s.id === skinId) || SKINS[0]

  useEffect(() => {
    setPosition({ x: window.innerWidth - 80, y: window.innerHeight - 100 })
    setMounted(true)
  }, [])

  useEffect(() => {
    localStorage.setItem('robotSkin', skinId)
  }, [skinId])

  // Handle clicking outside to close menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuOpen && robotRef.current && !robotRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
        setTimeout(() => setMenuView('main'), 300) // Reset view after animation
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (robotRef.current && !menuOpen) {
        const rect = robotRef.current.getBoundingClientRect()
        const coreCenterX = rect.left + 28
        const coreCenterY = rect.top + 28
        const dx = e.clientX - coreCenterX
        const dy = e.clientY - coreCenterY
        const angle = Math.atan2(dy, dx)
        const distance = Math.min(4.5, Math.hypot(dx, dy) / 20)
        setCoreOffset({
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
        })
      }
      if (dragRef.current.isDragging) {
        dragRef.current.hasMoved = true
        let newX = dragRef.current.elemX + (e.clientX - dragRef.current.startX)
        let newY = dragRef.current.elemY + (e.clientY - dragRef.current.startY)
        newX = Math.max(10, Math.min(window.innerWidth - 66, newX))
        newY = Math.max(20, Math.min(window.innerHeight - 76, newY))
        setPosition({ x: newX, y: newY })
      }
    }

    const handlePointerUp = () => {
      if (dragRef.current.isDragging) {
        dragRef.current.isDragging = false
        setIsDragging(false)
      }
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [menuOpen])

  const handlePointerDown = (e: React.PointerEvent) => {
    if (menuOpen) return // Don't drag if menu is open
    e.preventDefault()
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      elemX: position.x,
      elemY: position.y,
      isDragging: true,
      hasMoved: false
    }
    setIsDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handleClick = () => {
    if (!dragRef.current.hasMoved && !isLoading) {
      if (menuOpen) {
        setMenuOpen(false)
        setTimeout(() => setMenuView('main'), 300)
      } else {
        setMenuOpen(true)
        setCoreOffset({ x: 0, y: 0 }) // look straight when clicked
      }
    }
  }

  const handleAdminClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(false)
    setIsLoading(true)
    setTimeout(() => {
      navigate('/admin')
      setIsLoading(false)
    }, 600)
  }

  const handleSkinClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuView('skins')
  }

  if (!mounted) return null

  const isBottomHalf = position.y > window.innerHeight / 2
  const isRightHalf = position.x > window.innerWidth / 2

  return (
    <div
      ref={setCombinedRef}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        touchAction: 'none',
        zIndex: 9999,
      }}
      className="relative"
    >
      <button
        type="button"
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        aria-label="小机器人"
        className={`cursor-pointer transition-transform duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-2xl ${isDragging ? 'scale-95' : 'hover:scale-110'} ${isLoading ? 'scale-75' : ''} group relative z-10`}
      >
        <div 
          className={`relative w-14 h-14 rounded-2xl ${currentSkin.bg || 'bg-white/90 dark:bg-zinc-900/90'} backdrop-blur-xl shadow-xl border border-zinc-200/50 dark:border-zinc-700/50 flex items-center justify-center overflow-hidden transition-[box-shadow,transform,background-color] duration-500`}
          style={{ boxShadow: isLoading ? `0 0 40px ${currentSkin.glow}` : menuOpen ? `0 0 20px ${currentSkin.glow}` : '' }}
        >
          
          <div className={`absolute inset-0 bg-gradient-to-tr ${currentSkin.ring} transition-[opacity,background-image] duration-500 ${isLoading || menuOpen ? 'opacity-50' : 'opacity-10 group-hover:opacity-20'}`} />
          
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${isLoading || menuOpen ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}>
            <div className={`w-24 h-24 bg-gradient-to-tr ${currentSkin.ring} ${isLoading ? 'animate-[spin_0.5s_linear_infinite]' : 'animate-[spin_3s_linear_infinite]'} transition-[background-image] duration-500`} />
          </div>

          <div className={`absolute inset-[3px] ${currentSkin.bg || 'bg-white dark:bg-zinc-900'} rounded-[13px] z-10 transition-colors duration-500 ${isLoading ? 'bg-transparent dark:bg-transparent' : ''}`} />

          <div 
            className={`relative z-20 flex gap-1.5 transition-transform duration-300 ${isLoading ? 'scale-150' : ''}`}
            style={isLoading ? { transform: 'translate(0px, 0px)' } : { transform: `translate(${coreOffset.x}px, ${coreOffset.y}px)` }}
          >
            <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${currentSkin.eye1} flex items-center justify-center transition-[transform,box-shadow,background-image] duration-500 ${isLoading ? 'scale-110 shadow-[0_0_20px_rgba(255,255,255,0.8)]' : `shadow-[0_0_8px_${currentSkin.glow}] group-hover:scale-125`}`}>
              <div className={`w-1 h-1 bg-white rounded-full shadow-[0_0_4px_rgba(255,255,255,1)] transition-transform duration-300 ${isLoading ? 'scale-[2.2] shadow-[0_0_8px_rgba(255,255,255,1)]' : ''}`} />
            </div>
            <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${currentSkin.eye2} flex items-center justify-center transition-[transform,box-shadow,background-image] duration-500 ${isLoading ? 'scale-110 shadow-[0_0_20px_rgba(255,255,255,0.8)]' : `shadow-[0_0_8px_${currentSkin.glow}] group-hover:scale-125`}`}>
              <div className={`w-1 h-1 bg-white rounded-full shadow-[0_0_4px_rgba(255,255,255,1)] transition-transform duration-300 ${isLoading ? 'scale-[2.2] shadow-[0_0_8px_rgba(255,255,255,1)]' : ''}`} />
            </div>
            
            {/* Accessories */}
            {currentSkin.accessory === 'sunglasses' && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-11 h-4 bg-zinc-950/95 border border-zinc-700/50 rounded-sm flex justify-between px-1 shadow-lg z-30 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50" />
                <div className="w-4 h-full border-b border-zinc-700"></div>
                <div className="w-4 h-full border-b border-zinc-700"></div>
              </div>
            )}
            {currentSkin.accessory === 'snorkel' && (
              <div className="absolute -top-3 -right-2 w-2 h-6 border-2 border-blue-400 rounded-t-full rounded-bl-full z-30 pointer-events-none transform rotate-12"></div>
            )}
            {currentSkin.accessory === 'leaf' && (
              <svg className="absolute -top-4 left-1/2 -translate-x-1/2 w-4 h-4 text-emerald-500 z-30 pointer-events-none" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C7.5 2 4 6 4 10.5c0 3.3 2 6.2 5 7.4V22h2v-4.1c1-.3 1.9-.8 2.7-1.4L18 22l1.4-1.4-4.2-5.4c1.8-1.5 3-3.8 3-6.2C18.2 5 15.6 2 12 2zm0 13c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z"/>
              </svg>
            )}
            {currentSkin.accessory === 'tie' && (
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[8px] border-l-transparent border-r-transparent border-t-zinc-800 z-30 pointer-events-none"></div>
            )}
            {currentSkin.accessory === 'crown' && (
              <svg className="absolute -top-4 left-1/2 -translate-x-1/2 w-5 h-5 text-yellow-400 z-30 pointer-events-none drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
              </svg>
            )}
            {currentSkin.accessory === 'star' && (
              <svg className="absolute -top-3 -right-2 w-4 h-4 text-yellow-500 z-30 pointer-events-none animate-[spin_4s_linear_infinite]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.4 7.4L22 9.8l-5.8 5.3 1.6 7.4-6.8-3.8-6.8 3.8 1.6-7.4L0 9.8l7.6-.4L12 2z"/>
              </svg>
            )}
          </div>
        </div>
      </button>

      {/* Popover Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.9, y: isBottomHalf ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: isBottomHalf ? 10 : -10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute z-0"
            style={{
              top: isBottomHalf ? 'auto' : '100%',
              bottom: isBottomHalf ? '100%' : 'auto',
              left: isRightHalf ? 'auto' : '0',
              right: isRightHalf ? '0' : 'auto',
              marginTop: isBottomHalf ? '0' : '12px',
              marginBottom: isBottomHalf ? '12px' : '0',
            }}
          >
            <div className="w-56 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-700/50 shadow-2xl rounded-2xl overflow-hidden relative">
              <AnimatePresence mode="wait">
                {menuView === 'main' ? (
                  <motion.div
                    key="main"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col p-2"
                  >
                    <button
                      onClick={handleSkinClick}
                      className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm font-medium text-zinc-700 dark:text-zinc-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg bg-gradient-to-tr ${currentSkin.ring} text-white shadow-sm`}>
                          <Palette className="w-4 h-4" />
                        </div>
                        更换皮肤
                      </div>
                      <ChevronLeft className="w-4 h-4 text-zinc-400 rotate-180 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                    
                    <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800 my-1 mx-2" />
                    
                    <button
                      onClick={handleAdminClick}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm font-medium text-zinc-700 dark:text-zinc-200"
                    >
                      <div className="p-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                        <Settings className="w-4 h-4" />
                      </div>
                      后台管理
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="skins"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col"
                  >
                    <div className="flex items-center gap-2 p-3 border-b border-zinc-100 dark:border-zinc-800">
                      <button
                        onClick={(e) => { e.stopPropagation(); setMenuView('main') }}
                        className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">选择皮肤</span>
                    </div>
                    <div className="p-3 grid grid-cols-4 gap-2">
                      {SKINS.map((skin) => (
                        <button
                          key={skin.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSkinId(skin.id)
                          }}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                            skinId === skin.id 
                              ? 'border-[var(--primary)] scale-110 shadow-md z-10' 
                              : 'border-transparent hover:scale-105 hover:shadow-sm'
                          }`}
                          title={skin.name}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-tr ${skin.ring} opacity-80`} />
                          {skinId === skin.id && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <Check className="w-4 h-4 text-white drop-shadow-md" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

export default FloatingRobot
