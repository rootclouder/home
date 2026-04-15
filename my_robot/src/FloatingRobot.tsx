import { forwardRef, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronLeft, Palette } from 'lucide-react'
import { defaultSkins } from './defaultSkins'
import type { FloatingRobotAction, FloatingRobotProps, FloatingRobotSkin } from './types'

type DragState = {
  startX: number
  startY: number
  elemX: number
  elemY: number
  isDragging: boolean
  hasMoved: boolean
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

const FloatingRobot = forwardRef<HTMLDivElement, FloatingRobotProps>((props, externalRef) => {
  const {
    actions = [],
    skins = defaultSkins,
    enableSkins = true,
    defaultSkinId = 'default',
    storageKey = 'robotSkin',
    onSkinChange,
    enableEyeTracking = true,
    eyeTrackingMaxOffset = 3.5,
    eyeTrackingSensitivity = 25,
    enableDrag = true,
    defaultPosition,
    boundsPadding = 10,
  } = props

  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuView, setMenuView] = useState<'main' | 'skins'>('main')
  const [isDragging, setIsDragging] = useState(false)
  const [coreOffset, setCoreOffset] = useState({ x: 0, y: 0 })

  const robotRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<DragState>({
    startX: 0,
    startY: 0,
    elemX: 0,
    elemY: 0,
    isDragging: false,
    hasMoved: false,
  })

  const setCombinedRef = (node: HTMLDivElement) => {
    robotRef.current = node
    if (typeof externalRef === 'function') externalRef(node)
    else if (externalRef) externalRef.current = node
  }

  const [skinId, setSkinId] = useState(() => {
    if (typeof window === 'undefined') return defaultSkinId
    return localStorage.getItem(storageKey) || defaultSkinId
  })

  const currentSkin: FloatingRobotSkin =
    skins.find(s => s.id === skinId) || skins.find(s => s.id === defaultSkinId) || skins[0] || defaultSkins[0]

  useEffect(() => {
    if (typeof window === 'undefined') return
    const initial = defaultPosition || { x: window.innerWidth - 80, y: window.innerHeight - 100 }
    const x = clamp(initial.x, boundsPadding, window.innerWidth - 66 - boundsPadding)
    const y = clamp(initial.y, boundsPadding, window.innerHeight - 76 - boundsPadding)
    setPosition({ x, y })
    setMounted(true)
  }, [boundsPadding, defaultPosition])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(storageKey, skinId)
    onSkinChange?.(skinId)
  }, [onSkinChange, skinId, storageKey])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!menuOpen) return
      if (robotRef.current && !robotRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
        setTimeout(() => setMenuView('main'), 220)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  useEffect(() => {
    if (typeof window === 'undefined') return
    let animationFrameId = 0
    const handlePointerMove = (e: PointerEvent) => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
      animationFrameId = requestAnimationFrame(() => {
        if (enableEyeTracking && robotRef.current && !menuOpen) {
          const rect = robotRef.current.getBoundingClientRect()
          const coreCenterX = rect.left + 28
          const coreCenterY = rect.top + 28
          const dx = e.clientX - coreCenterX
          const dy = e.clientY - coreCenterY
          const angle = Math.atan2(dy, dx)
          const distance = Math.min(eyeTrackingMaxOffset, Math.hypot(dx, dy) / eyeTrackingSensitivity)
          setCoreOffset({ x: Math.cos(angle) * distance, y: Math.sin(angle) * distance })
        }

        if (enableDrag && dragRef.current.isDragging) {
          dragRef.current.hasMoved = true
          let newX = dragRef.current.elemX + (e.clientX - dragRef.current.startX)
          let newY = dragRef.current.elemY + (e.clientY - dragRef.current.startY)
          newX = clamp(newX, boundsPadding, window.innerWidth - 66 - boundsPadding)
          newY = clamp(newY, boundsPadding, window.innerHeight - 76 - boundsPadding)
          setPosition({ x: newX, y: newY })
        }
      })
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
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [boundsPadding, enableDrag, enableEyeTracking, eyeTrackingMaxOffset, eyeTrackingSensitivity, menuOpen])

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!enableDrag) return
    if (menuOpen) return
    e.preventDefault()
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      elemX: position.x,
      elemY: position.y,
      isDragging: true,
      hasMoved: false,
    }
    setIsDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handleRootClick = () => {
    if (dragRef.current.hasMoved) return
    if (menuOpen) {
      setMenuOpen(false)
      setTimeout(() => setMenuView('main'), 220)
      return
    }
    setMenuOpen(true)
    setCoreOffset({ x: 0, y: 0 })
  }

  const handleSkinClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuView('skins')
  }

  const handleActionClick = async (e: React.MouseEvent, action: FloatingRobotAction) => {
    e.stopPropagation()
    setMenuOpen(false)
    setTimeout(() => setMenuView('main'), 220)
    await action.onClick()
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
        onClick={handleRootClick}
        aria-label="Floating Robot"
        className={`cursor-pointer transition-transform duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-2xl ${isDragging ? 'scale-95' : 'hover:scale-110'} group relative z-10`}
      >
        <div
          className={`relative w-14 h-14 rounded-2xl ${currentSkin.bg} backdrop-blur-xl shadow-xl border border-zinc-200/50 dark:border-zinc-700/50 flex items-center justify-center overflow-hidden transition-[box-shadow,transform,background-color] duration-500`}
          style={{ boxShadow: menuOpen ? `0 0 20px ${currentSkin.glow}` : '' }}
        >
          {/* 底层微弱的光晕 */}
          <div className={`absolute inset-0 bg-gradient-to-tr ${currentSkin.ring} transition-[opacity,background-image] duration-500 ${menuOpen ? 'opacity-20' : 'opacity-10 group-hover:opacity-20'}`} />
          
          {/* 动态旋转流光束（利用 conic-gradient 和皮肤的 gradient-stops 实现彗星扫尾效果） */}
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${menuOpen ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}>
            <div 
              className={`absolute w-[250%] h-[250%] ${currentSkin.ring} animate-[spin_3s_linear_infinite] transition-[background-image] duration-500`} 
              style={{ background: 'conic-gradient(from 0deg, transparent 20%, var(--tw-gradient-stops), transparent 80%)' }}
            />
          </div>

          <div className={`absolute inset-[2px] ${currentSkin.bg} rounded-[14px] z-10 transition-colors duration-500`} />

          <div
            className={`relative z-20 flex gap-1.5 transition-transform ${menuOpen ? 'duration-150' : 'duration-75 ease-out'}`}
            style={{ transform: `translate(${coreOffset.x}px, ${coreOffset.y}px)` }}
          >
            <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${currentSkin.eye1} flex items-center justify-center transition-[transform,box-shadow,background-image] duration-500 shadow-[0_0_8px_${currentSkin.glow}] group-hover:scale-125`}>
              <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_4px_rgba(255,255,255,1)]" />
            </div>
            <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${currentSkin.eye2} flex items-center justify-center transition-[transform,box-shadow,background-image] duration-500 shadow-[0_0_8px_${currentSkin.glow}] group-hover:scale-125`}>
              <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_4px_rgba(255,255,255,1)]" />
            </div>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
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
                    {enableSkins && (
                      <button
                        onClick={handleSkinClick}
                        className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm font-medium text-zinc-700 dark:text-zinc-200 group"
                        type="button"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg bg-gradient-to-tr ${currentSkin.ring} text-white shadow-sm`}>
                            <Palette className="w-4 h-4" />
                          </div>
                          更换皮肤
                        </div>
                        <ChevronLeft className="w-4 h-4 text-zinc-400 rotate-180 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    )}

                    {actions.length > 0 && enableSkins && <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800 my-1 mx-2" />}

                    {actions.map(action => (
                      <button
                        key={action.id}
                        onClick={e => void handleActionClick(e, action)}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm font-medium text-zinc-700 dark:text-zinc-200"
                        type="button"
                      >
                        {action.icon ? (
                          <div className="p-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">{action.icon}</div>
                        ) : (
                          <div className="p-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
                        )}
                        {action.label}
                      </button>
                    ))}
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
                        onClick={e => {
                          e.stopPropagation()
                          setMenuView('main')
                        }}
                        className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500"
                        type="button"
                        aria-label="Back"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">选择皮肤</span>
                    </div>
                    <div className="p-3 grid grid-cols-4 gap-2">
                      {skins.map(skin => (
                        <button
                          key={skin.id}
                          onClick={e => {
                            e.stopPropagation()
                            setSkinId(skin.id)
                          }}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                            skinId === skin.id ? 'border-[var(--primary)] scale-110 shadow-md z-10' : 'border-transparent hover:scale-105 hover:shadow-sm'
                          }`}
                          title={skin.name}
                          type="button"
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

