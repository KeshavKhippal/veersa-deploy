import { useState, useEffect } from 'react'
import API_BASE from '../config'

const AGENT_META = {
  intake_agent: { label: 'IntakeAgent', color: 'blue', icon: '📋', desc: 'Validates incoming PA requests' },
  decision_agent: { label: 'DecisionAgent', color: 'purple', icon: '⚖️', desc: 'Makes clinical decisions based on policy & patient data' },
  critic_agent: { label: 'CriticAgent', color: 'orange', icon: '🔍', desc: 'Adversarially reviews decisions for errors' },
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
      setMessage({ type: 'success', text: 'Prompt saved successfully!' })
      if (onSave) onSave()
    } catch {
      setMessage({ type: 'error', text: 'Failed to save prompt' })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleReset = () => { setPrompt(original); setMessage(null) }

  const borderColor = meta.color === 'blue' ? 'border-blue-500/30' : meta.color === 'purple' ? 'border-purple-500/30' : 'border-orange-500/30'
  const headingColor = meta.color === 'blue' ? 'text-blue-400' : meta.color === 'purple' ? 'text-purple-400' : 'text-orange-400'

  return (
    <div className={`glass-card p-5 border ${borderColor} animate-fade-in-up`}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{meta.icon}</span>
        <div>
          <h3 className={`font-bold text-sm ${headingColor}`}>{meta.label}</h3>
          <p className="text-xs text-slate-500">{meta.desc}</p>
        </div>
      </div>
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        rows={10}
        className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-600 text-slate-200 text-xs font-mono
          focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all resize-y leading-relaxed"
      />
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-slate-500">{prompt.length} characters</span>
        <div className="flex items-center gap-2">
          <button onClick={handleReset}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 transition-all cursor-pointer">
            Reset
          </button>
          <button onClick={handleSave} disabled={saving || prompt === original}
            className="px-4 py-1.5 text-xs rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-500 
              disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-lg shadow-blue-600/10">
            {saving ? 'Saving...' : 'Save Prompt'}
          </button>
        </div>
      </div>
      {message && (
        <div className={`mt-2 text-xs px-3 py-2 rounded-lg ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {message.text}
        </div>
      )}
    </div>
  )
}

export default function PromptStudio({ lastRequest, onRerun }) {
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Prompt Studio</h2>
        <p className="text-slate-400 text-sm">Edit agent prompts in real-time and re-run requests with updated behavior.</p>
      </div>

      {loadingPrompts ? (
        <div className="text-center py-12 text-slate-400">Loading prompts...</div>
      ) : (
        <div className="space-y-6">
          {Object.keys(AGENT_META).map(key => (
            <PromptCard key={key} agentKey={key} config={prompts[key]} onSave={fetchPrompts} />
          ))}
        </div>
      )}

      {lastRequest && (
        <div className="mt-8 p-5 glass-card border border-cyan-500/20 text-center">
          <p className="text-sm text-slate-300 mb-3">
            Re-run your last request (<strong>{lastRequest.patient_id}</strong> + <strong>{lastRequest.drug_requested}</strong>) with updated prompts:
          </p>
          <button onClick={onRerun}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cyan-600 to-blue-600 
              hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-600/20 transition-all cursor-pointer">
            🔄 Re-run with Updated Prompts
          </button>
        </div>
      )}
    </div>
  )
}
