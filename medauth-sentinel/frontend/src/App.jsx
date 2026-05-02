import { useState, useEffect, useCallback } from 'react'
import './App.css'
import SubmitRequest from './components/SubmitRequest'
import ReasoningTrace from './components/ReasoningTrace'
import PromptStudio from './components/PromptStudio'
import API_BASE from './config'

const TABS = [
  { id: 'submit', label: 'Submit Request', icon: '📋' },
  { id: 'trace', label: 'Reasoning Trace', icon: '🔍' },
  { id: 'prompts', label: 'Prompt Studio', icon: '⚙️' },
]

function App() {
  const [activeTab, setActiveTab] = useState('submit')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastRequest, setLastRequest] = useState(null)
  const [backendStatus, setBackendStatus] = useState('waking')
  // possible values: 'waking' | 'ready' | 'error'

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 20; // tries for 60 seconds total

    const checkBackend = async () => {
      try {
        const healthUrl = API_BASE.replace('/api', '') + '/api/health';
        const res = await fetch(healthUrl, {
          signal: AbortSignal.timeout(5000)
        });
        if (res.ok) {
          setBackendStatus('ready');
          // Hide the ready banner after 3 seconds
          setTimeout(() => setBackendStatus('done'), 3000);
          return;
        }
      } catch (e) {
        // Backend still waking up, try again
      }
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(checkBackend, 3000);
      } else {
        setBackendStatus('error');
      }
    };

    checkBackend();
  }, []); // runs once on mount

  const handleSubmit = useCallback(async (request) => {
    setLoading(true)
    setLastRequest(request)
    try {
      const res = await fetch(`${API_BASE}/submit-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Request failed')
      }
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setResult({ status: 'ERROR', error: err.message })
    } finally {
      setLoading(false)
    }
  }, [])

  const handleViewTrace = useCallback(() => {
    setActiveTab('trace')
  }, [])

  const handleRerun = useCallback(() => {
    if (lastRequest) {
      handleSubmit(lastRequest)
      setActiveTab('submit')
    }
  }, [lastRequest, handleSubmit])

  return (
    <div className="min-h-screen flex flex-col">
      {backendStatus === 'waking' && (
        <div style={{
          background: '#78350f',
          color: '#fde68a',
          padding: '12px 20px',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: '500',
          letterSpacing: '0.01em'
        }}>
          ⏳ Backend is starting up on free tier —
          first load takes ~30 seconds. Please wait...
        </div>
      )}

      {backendStatus === 'ready' && (
        <div style={{
          background: '#14532d',
          color: '#86efac',
          padding: '8px 20px',
          textAlign: 'center',
          fontSize: '13px'
        }}>
          ✅ Backend connected — MedAuth Sentinel is ready
        </div>
      )}

      {backendStatus === 'error' && (
        <div style={{
          background: '#450a0a',
          color: '#fca5a5',
          padding: '12px 20px',
          textAlign: 'center',
          fontSize: '14px'
        }}>
          ❌ Backend unreachable. If deployed, check Render dashboard.
          If running locally, start with: uvicorn backend.main:app --reload
        </div>
      )}

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-700/50 bg-[#0d1117]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                MA
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">MedAuth Sentinel</h1>
                <p className="text-[10px] text-slate-400 -mt-0.5 tracking-widest uppercase">Agentic AI • Prior Auth</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-slate-800/50 rounded-xl p-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-400">System Active</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">
          {activeTab === 'submit' && (
            <SubmitRequest
              onSubmit={handleSubmit}
              result={result}
              loading={loading}
              onViewTrace={handleViewTrace}
            />
          )}
          {activeTab === 'trace' && (
            <ReasoningTrace result={result} />
          )}
          {activeTab === 'prompts' && (
            <PromptStudio
              lastRequest={lastRequest}
              onRerun={handleRerun}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        MedAuth Sentinel v1.0 — Veersa Hackathon 2026 — ABES Engineering College
      </footer>
    </div>
  )
}

export default App
