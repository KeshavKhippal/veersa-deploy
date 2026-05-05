import { useState, useEffect } from 'react'
import { useStore } from '@nanostores/react'
import { motion, AnimatePresence } from 'framer-motion'
import { $result, $loading, $lastRequest, setResult, setLoading, setLastRequest } from '../store'
import API_BASE from '../config'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
}

export default function SubmitRequest() {
  const result = useStore($result)
  const loading = useStore($loading)
  const lastPersistedRequest = useStore($lastRequest)
  
  const [patients, setPatients] = useState([])
  const [scenarios, setScenarios] = useState([])
  const [form, setForm] = useState({
    patient_id: '',
    drug_requested: '',
    diagnosis_code: '',
    requesting_doctor: '',
    additional_notes: '',
  })

  useEffect(() => {
    fetch(`${API_BASE}/patients`)
      .then(r => r.json())
      .then(data => setPatients(data))
      .catch(() => {})

    fetch(`${API_BASE}/scenarios`)
      .then(r => r.json())
      .then(data => setScenarios(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (lastPersistedRequest && !form.patient_id) {
      setForm(prev => ({ ...prev, ...lastPersistedRequest }))
    }
  }, [lastPersistedRequest])

  const loadScenario = (scenario) => {
    setForm({ ...scenario.request })
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.patient_id || !form.drug_requested || !form.diagnosis_code || !form.requesting_doctor) return
    
    setLoading(true)
    setLastRequest(form)
    
    try {
      const res = await fetch(`${API_BASE}/submit-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
  }

  const getStatusClasses = (decision) => {
    if (!decision) return 'bg-slate-100 text-slate-600'
    const d = decision.toUpperCase()
    if (d === 'APPROVED') return 'bg-status-success-bg text-status-success border-status-success/20'
    if (d === 'DENIED') return 'bg-status-error-bg text-status-error border-status-error/20'
    return 'bg-status-warning-bg text-status-warning border-status-warning/20'
  }

  return (
    <motion.div 
      className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Left Column — Request Form */}
      <motion.div className="lg:col-span-7 space-y-8" variants={itemVariants}>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-med-primary rounded-full shadow-sm" />
            <h2 className="text-2xl font-extrabold tracking-tight text-med-text">Clinical Intake</h2>
          </div>
          <p className="text-med-text-muted text-sm font-medium">Prior Authorization Protocol Entry</p>
        </div>

        {/* Scenario Selectors */}
        <div className="med-card p-6 border-med-primary/10 bg-med-primary-muted/30">
           <div className="med-label text-med-primary/70 flex items-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
             Preset Case Scenarios
           </div>
           <div className="flex flex-wrap gap-2">
            {scenarios.map((s) => (
              <button
                key={s.id}
                onClick={() => loadScenario(s)}
                className="px-4 py-1.5 text-[11px] font-bold rounded-lg border border-med-border bg-white text-med-text-muted 
                  hover:border-med-primary hover:text-med-primary transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="med-card p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Patient Dropdown */}
            <div className="md:col-span-2">
              <label className="med-label">Patient Record Index</label>
              <div className="relative">
                <select
                    name="patient_id"
                    value={form.patient_id}
                    onChange={handleChange}
                    className="med-input pr-10 appearance-none cursor-pointer"
                >
                    <option value="">-- SELECT CLINICAL SUBJECT --</option>
                    {patients.map(p => (
                    <option key={p.patient_id} value={p.patient_id}>
                        {p.patient_id} // {p.name} ({p.payer})
                    </option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-med-text-muted">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>

            {/* Drug Requested */}
            <div>
              <label className="med-label">Requested Therapeutic</label>
              <input
                type="text"
                name="drug_requested"
                value={form.drug_requested}
                onChange={handleChange}
                placeholder="Drug name or ID..."
                className="med-input"
              />
            </div>

            {/* Diagnosis Code */}
            <div>
              <label className="med-label">Clinical Indication (ICD-10)</label>
              <input
                type="text"
                name="diagnosis_code"
                value={form.diagnosis_code}
                onChange={handleChange}
                placeholder="E.g., E11.9"
                className="med-input"
              />
            </div>
          </div>

          {/* Requesting Doctor */}
          <div>
            <label className="med-label">Clinician Name</label>
            <input
              type="text"
              name="requesting_doctor"
              value={form.requesting_doctor}
              onChange={handleChange}
              placeholder="Full name & credentials..."
              className="med-input"
            />
          </div>

          {/* Additional Details */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Additional Details
              <span className="ml-2 text-xs text-gray-500 font-normal">— optional</span>
            </label>

            <textarea
              value={form.additional_notes || ""}
              onChange={(e) => setForm({ ...form, additional_notes: e.target.value })}
              placeholder={`Extra context for the agents — examples:\n• HbA1c: 9.2% (last tested 2 weeks ago)\n• Patient tried Metformin but discontinued due to GI side effects\n• Referred by specialist Dr. Kapoor — urgent case\n• Previous PA denied on 2024-01-10, appealing now`}
              rows={5}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 text-sm focus:border-blue-400 focus:outline-none placeholder-gray-400 resize-none leading-relaxed"
            />

            <p className="text-xs text-gray-500 mt-1">This text is passed to all 3 agents. More context = better decisions.</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !form.patient_id}
            className="w-full med-btn-primary py-4 text-sm tracking-widest uppercase flex items-center justify-center gap-3 disabled:opacity-30 disabled:hover:scale-100 disabled:shadow-none"
          >
            {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Orchestrating Review...
                </>
              ) : (
                <>Initialize Authorization Cycle</>
              )}
          </button>
        </form>
      </motion.div>

      {/* Right Column — Decision Output */}
      <motion.div className="lg:col-span-5 space-y-8" variants={itemVariants}>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
             <div className="w-2.5 h-2.5 bg-med-accent rounded-full" />
             <h2 className="text-2xl font-extrabold tracking-tight text-med-text">Analysis Output</h2>
          </div>
          <p className="text-med-text-muted text-sm font-medium">Real-time Agentic Evaluation</p>
        </div>

        <AnimatePresence mode="wait">
            {!result && !loading && (
            <motion.div 
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="med-card p-24 text-center border-dashed flex flex-col items-center justify-center opacity-60"
            >
                <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-400 mb-2">Idle Mode</h3>
                <p className="text-xs font-medium text-slate-400 max-w-[200px]">Awaiting secure clinical data packet transmission</p>
            </motion.div>
            )}

            {loading && (
            <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="med-card p-20 flex flex-col items-center justify-center bg-white"
            >
                <div className="w-20 h-20 relative mb-8">
                    <div className="absolute inset-0 border-4 border-med-primary/10 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-med-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="text-center">
                    <div className="text-sm font-bold text-med-primary mb-3 animate-pulse uppercase tracking-[0.2em]">Cross-Checking Agents...</div>
                    <div className="flex justify-center gap-1.5">
                        {[1,2,3].map(i => (
                            <div key={i} className="w-1.5 h-1.5 bg-med-primary/40 rounded-full animate-bounce" style={{ animationDelay: `${i*0.1}s` }} />
                        ))}
                    </div>
                </div>
            </motion.div>
            )}

            {result && !loading && (
            <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
            >
                {/* Decision Banner */}
                <div className={`p-10 med-card text-center border-2 ${getStatusClasses(result.final_decision)}`}>
                    <div className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3 opacity-60">Auth Determination</div>
                    <div className="text-5xl font-extrabold tracking-tight mb-4">
                        {result.final_decision || "ERROR"}
                    </div>
                    {result.status === 'REJECTED_AT_INTAKE' && (
                        <div className="text-[10px] font-bold text-status-error uppercase border border-status-error/20 py-1.5 px-4 inline-flex items-center gap-2 rounded-full bg-white/50">
                            <span className="w-2 h-2 rounded-full bg-status-error animate-ping"></span>
                            Incomplete Intake Data
                        </div>
                    )}
                </div>

                {/* Metrics */}
                {result.confidence !== undefined && (
                <div className="med-card p-6 bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <span className="med-label mb-0">Agent Confidence Index</span>
                        <span className="text-lg font-extrabold text-med-text">{Math.round(result.confidence * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full relative overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${result.confidence * 100}%` }}
                            transition={{ duration: 1.2, ease: "circOut" }}
                            className={`h-full rounded-full ${result.confidence > 0.8 ? 'bg-status-success' : 'bg-status-warning'}`}
                        />
                    </div>
                </div>
                )}

                {/* Critic Feedback */}
                {result.revision_made && (
                <div className="med-card p-6 border-status-warning/40 bg-status-warning-bg/30">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-status-warning/10 border border-status-warning/20 flex items-center justify-center text-status-warning shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-status-warning uppercase tracking-wider mb-1">Critic Recalibration Performed</div>
                            <p className="text-[11px] font-medium text-med-secondary leading-relaxed uppercase">
                                Initial decision corrected by Adversarial Critic. Verified policy exceptions applied.
                            </p>
                        </div>
                    </div>
                </div>
                )}

                {/* Reasoning Trace */}
                <div className="med-card p-6 bg-white">
                    <div className="med-label border-b border-slate-100 pb-4 mb-5">Decision Logic Stream</div>
                    <div className="space-y-4">
                        {result.reasoning?.map((r, i) => (
                            <motion.div 
                                key={i} 
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex gap-4 items-start group"
                            >
                                <span className="text-[10px] font-bold text-med-primary/30 mt-0.5">0{i+1}</span>
                                <p className="text-[12px] font-medium text-med-secondary leading-relaxed group-hover:text-med-text transition-colors">
                                    {r}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Footer Actions */}
                {result.trace && (
                <a
                    href="/trace"
                    className="flex items-center justify-center w-full py-4 border border-med-border bg-white rounded-2xl text-[11px] font-bold uppercase tracking-widest text-med-text-muted hover:border-med-primary hover:text-med-primary hover:shadow-lg hover:shadow-med-primary/5 transition-all active:scale-[0.98]"
                >
                    View Sequential Trace ({result.trace.length} Nodes)
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" className="ml-3"><path d="m9 18 6-6-6-6"/></svg>
                </a>
                )}
            </motion.div>
            )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
