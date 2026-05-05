import { useState, useEffect } from 'react'
import API_BASE from '../config'

export default function ClinicianProfile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/user`)
      .then(res => res.json())
      .then(data => {
        setUser(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center gap-3 pl-2 animate-pulse">
      <div className="text-right hidden md:block">
        <div className="h-3 w-20 bg-slate-100 rounded mb-1"></div>
        <div className="h-2 w-24 bg-slate-50 rounded"></div>
      </div>
      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200"></div>
    </div>
  )

  if (!user) return null

  return (
    <div className="flex items-center gap-3 pl-2 group cursor-pointer">
      <div className="text-right hidden md:block">
        <div className="text-[12px] font-bold text-med-text group-hover:text-med-primary transition-colors">{user.name}</div>
        <div className="text-[10px] font-medium text-med-text-muted">{user.role}</div>
      </div>
      <div className={`w-10 h-10 rounded-xl bg-${user.avatar_color}/10 border border-${user.avatar_color}/20 flex items-center justify-center text-${user.avatar_color} shadow-inner group-hover:shadow-md transition-all`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
    </div>
  )
}
