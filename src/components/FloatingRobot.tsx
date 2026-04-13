import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function FloatingRobot() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [coreOffset, setCoreOffset] = useState({ x: 0, y: 0 })
  const dragRef = useRef({ startX: 0, startY: 0, elemX: 0, elemY: 0, isDragging: false, hasMoved: false })
  const robotRef = useRef<HTMLButtonElement>(null)
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setPosition({ x: window.innerWidth - 80, y: window.innerHeight - 100 })
    setMounted(true)
  }, [])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (robotRef.current) {
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
        // Adjust bounds for the new 56x56 pixel robot + antenna/feet
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
  }, [])

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault() // prevent text selection
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
      setIsLoading(true)
      // Play a tasteful loading sequence before navigating
      setTimeout(() => {
        navigate('/admin')
        setIsLoading(false)
      }, 600) // 600ms allows the transition to play out
    }
  }

  if (!mounted) return null

  return (
    <button
      type="button"
      ref={robotRef}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        touchAction: 'none',
        zIndex: 9999,
      }}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      aria-label="打开后台管理"
      className={`cursor-pointer transition-transform duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950 rounded-2xl ${isDragging ? 'scale-95' : 'hover:scale-110'} ${isLoading ? 'scale-75' : ''} group`}
      title="后台管理"
    >
      <div className={`relative w-14 h-14 rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-xl border border-zinc-200/50 dark:border-zinc-700/50 flex items-center justify-center overflow-hidden transition-[box-shadow,transform] duration-500 ${isLoading ? 'shadow-[0_0_40px_rgba(168,85,247,0.8)] scale-125' : 'group-hover:shadow-[0_0_25px_rgba(168,85,247,0.4)]'}`}>
        
        <div className={`absolute inset-0 bg-gradient-to-tr from-cyan-500 via-purple-500 to-pink-500 transition-opacity duration-500 ${isLoading ? 'opacity-50' : 'opacity-10 group-hover:opacity-20'}`} />
        
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${isLoading ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}>
          <div className={`w-24 h-24 bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 ${isLoading ? 'animate-[spin_0.5s_linear_infinite]' : 'animate-[spin_3s_linear_infinite]'}`} />
        </div>

        <div className={`absolute inset-[3px] bg-white dark:bg-zinc-900 rounded-[13px] z-10 transition-colors duration-500 ${isLoading ? 'bg-transparent dark:bg-transparent' : ''}`} />

        <div 
          className={`relative z-20 flex gap-1.5 transition-transform duration-300 ${isLoading ? 'scale-150' : ''}`}
          style={isLoading ? { transform: 'translate(0px, 0px)' } : { transform: `translate(${coreOffset.x}px, ${coreOffset.y}px)` }}
        >
          <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 flex items-center justify-center transition-[transform,box-shadow] duration-300 ${isLoading ? 'scale-110 shadow-[0_0_20px_rgba(255,255,255,0.8)]' : 'shadow-[0_0_8px_rgba(168,85,247,0.6)] group-hover:scale-125'}`}>
            <div className={`w-1 h-1 bg-white rounded-full shadow-[0_0_4px_rgba(255,255,255,1)] transition-transform duration-300 ${isLoading ? 'scale-[2.2] shadow-[0_0_8px_rgba(255,255,255,1)]' : ''}`} />
          </div>
          <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center transition-[transform,box-shadow] duration-300 ${isLoading ? 'scale-110 shadow-[0_0_20px_rgba(255,255,255,0.8)]' : 'shadow-[0_0_8px_rgba(168,85,247,0.6)] group-hover:scale-125'}`}>
            <div className={`w-1 h-1 bg-white rounded-full shadow-[0_0_4px_rgba(255,255,255,1)] transition-transform duration-300 ${isLoading ? 'scale-[2.2] shadow-[0_0_8px_rgba(255,255,255,1)]' : ''}`} />
          </div>
        </div>

      </div>
    </button>
  )
}
