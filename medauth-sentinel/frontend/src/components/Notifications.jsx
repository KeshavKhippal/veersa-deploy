import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import API_BASE from '../config'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    fetch(`${API_BASE}/notifications`)
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(() => {})

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-xl bg-white border border-med-border flex items-center justify-center text-med-text-muted hover:text-med-primary hover:border-med-primary/30 transition-all hover:shadow-md active:scale-95 group relative"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-status-error text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 bg-white border border-med-border rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-slate-50 flex items-center justify-between">
              <span className="text-[11px] font-bold text-med-text uppercase tracking-widest">Notifications</span>
              <span className="text-[10px] font-medium text-med-primary hover:underline cursor-pointer">Mark all as read</span>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-med-text-muted text-[11px]">No new notifications</div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${!n.read ? 'bg-med-primary/[0.02]' : ''}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-tight ${n.type === 'success' ? 'text-status-success' : 'text-med-accent'}`}>
                        {n.title}
                      </span>
                      <span className="text-[9px] text-slate-400">{n.timestamp}</span>
                    </div>
                    <p className="text-[11px] font-medium text-med-secondary leading-tight">{n.message}</p>
                    {!n.read && <div className="mt-2 w-1.5 h-1.5 rounded-full bg-med-primary"></div>}
                  </div>
                ))
              )}
            </div>
            <div className="p-3 bg-slate-50 text-center">
              <button className="text-[10px] font-bold text-med-text-muted hover:text-med-primary uppercase tracking-widest transition-colors">View All Analysis Activity</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
