import { useState, useEffect } from 'react'
import { useStore } from '@nanostores/react'
import { motion, AnimatePresence } from 'framer-motion'
import { $lastRequest } from '../store'
import API_BASE from '../config'

const AGENT_META = {
  intake_agent: { label: 'Intake Validator', color: 'med-primary', icon: '📋', desc: 'Syntactic & field integrity' },
  decision_agent: { label: 'Decision Engine', color: 'med-accent', icon: '⚖️', desc: 'Clinical logic & policy' },
  critic_agent: { label: 'Adversarial Critic', color: 'status-warning', icon: '🔍', desc: 'Error detection & review' },
}

function PromptCard({ agentKey, config, onSave }) {
  const meta = AGENT_META[agentKey]
  const [prompt, setPrompt] = useState(config?.system_prompt || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const original = config?.system_prompt || ''

  useEffect(() => { setPrompt(config?.system_prompt || '') }, [config])

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch(`${API_BASE}/prompts/${agentKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system_prompt: prompt }),
      })
      if (!res.ok) throw new Error('Save failed')
      setMessage({ type: 'success', text: 'Logic committed successfully' })
      if (onSave) onSave()
    } catch {
      setMessage({ type: 'error', text: 'Failed to commit logic' })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleReset = () => { setPrompt(original); setMessage(null) }

  return (
    <motion.div 
        layout
        className="med-card p-6 bg-white hover:shadow-xl hover:shadow-med-primary/5 transition-all duration-500"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl bg-${meta.color}/5 border border-${meta.color}/10 flex items-center justify-center text-xl`}>
            {meta.icon}
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-med-text tracking-tight">{meta.label}</h3>
            <p className="text-[10px] font-medium text-med-text-muted mt-0.5 tracking-wide uppercase opacity-70">{meta.desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
            <div className={`w-1.5 h-1.5 bg-${meta.color} rounded-full animate-pulse shadow-[0_0_8px_currentColor]`} />
            <span className="text-[10px] font-bold text-med-text-muted uppercase tracking-widest">Live Node</span>
        </div>
      </div>

      <div className="relative group rounded-2xl overflow-hidden border border-slate-100 bg-slate-50/50">
        <div className="absolute top-4 left-3 z-10 flex flex-col gap-1.5 opacity-20 pointer-events-none">
           {[...Array(12)].map((_, i) => (
             <span key={i} className="text-[9px] font-bold font-mono text-slate-300">{String(i+1).padStart(2, '0')}</span>
           ))}
        </div>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={12}
          className="w-full pl-12 pr-6 py-5 bg-transparent text-med-secondary font-medium text-[13px] focus:outline-none resize-none leading-relaxed selection:bg-med-primary/10"
          spellCheck="false"
        />
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center gap-6">
           <div className="text-[10px] font-bold text-med-text-muted uppercase tracking-widest">
             Payload: <span className="text-med-primary">{new Blob([prompt]).size} bytes</span>
           </div>
           <AnimatePresence>
                {message && (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className={`text-[10px] font-bold uppercase tracking-tight ${message.type === 'success' ? 'text-status-success' : 'text-status-error'}`}
                    >
                        {message.text}
                    </motion.div>
                )}
           </AnimatePresence>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={handleReset}
            className="px-5 py-2.5 text-[11px] font-bold text-med-text-muted hover:text-med-text transition-all cursor-pointer uppercase tracking-widest">
            Discard
          </button>
          <button onClick={handleSave} disabled={saving || prompt === original}
            className="med-btn-primary px-8 py-2.5 text-[11px] uppercase tracking-widest disabled:opacity-20 disabled:hover:scale-100">
            {saving ? 'Saving...' : 'Commit Changes'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function PromptStudio() {
  const lastRequest = useStore($lastRequest)
  const [prompts, setPrompts] = useState({})
  const [loadingPrompts, setLoadingPrompts] = useState(true)

  const fetchPrompts = async () => {
    setLoadingPrompts(true)
    try {
      const res = await fetch(`${API_BASE}/prompts`)
      const data = await res.json()
      setPrompts(data)
    } catch { /* ignore */ }
    setLoadingPrompts(false)
  }

  useEffect(() => { fetchPrompts() }, [])

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <header className="border-b border-med-border pb-8 flex items-end justify-between">
        <div>
            <div className="med-label text-med-primary mb-2">Cognitive Configuration Studio</div>
            <h2 className="text-3xl font-extrabold text-med-text tracking-tight uppercase">Agent Intelligence</h2>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-white border border-med-border rounded-2xl shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" className="text-med-primary animate-spin [animation-duration:4s]"><path d="M12 2v4"/><path d="m16.2 4.2 2.8 2.8"/><path d="M18 12h4"/><path d="m16.2 19.8 2.8-2.8"/><path d="M12 18v4"/><path d="m4.8 19.8 2.8-2.8"/><path d="M2 12h4"/><path d="m4.8 4.2 2.8 2.8"/></svg>
            <span className="text-[11px] font-bold text-med-text uppercase tracking-widest">All Nodes Online</span>
        </div>
      </header>

      {loadingPrompts ? (
        <div className="med-card p-40 text-center bg-white border-dashed flex flex-col items-center">
           <div className="w-16 h-16 border-4 border-med-primary/10 border-t-med-primary rounded-full animate-spin mb-8" />
           <div className="med-label opacity-40">Synchronizing Cognition Matrix...</div>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.keys(AGENT_META).map(key => (
            <PromptCard key={key} agentKey={key} config={prompts[key]} onSave={fetchPrompts} />
          ))}
        </div>
      )}

      {lastRequest && (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="med-card p-12 bg-med-primary/[0.03] border-med-primary/20 flex flex-col items-center text-center shadow-2xl shadow-med-primary/5"
        >
          <div className="med-label text-med-primary mb-6 flex items-center gap-5">
             <div className="w-16 h-[1px] bg-med-primary/20" /> 
             Regression Protocol Ready 
             <div className="w-16 h-[1px] bg-med-primary/20" />
          </div>
          <p className="text-sm font-bold text-med-secondary mb-10 max-w-lg leading-relaxed uppercase tracking-tight">
            Execute verification cycle for <span className="text-med-primary">{lastRequest.patient_id}</span> // <span className="text-med-primary">{lastRequest.drug_requested}</span> with updated logic?
          </p>
          <button onClick={() => window.location.href = '/'}
            className="med-btn-primary px-16 py-5 text-[12px] tracking-[0.3em] shadow-2xl shadow-med-primary/30">
            Initialize Regression Test
          </button>
        </motion.div>
      )}
    </div>
  )
}
