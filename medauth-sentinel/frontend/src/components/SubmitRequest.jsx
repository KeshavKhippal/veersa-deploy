import { useState, useEffect } from 'react'
import API_BASE from '../config'

export default function SubmitRequest({ onSubmit, result, loading, onViewTrace }) {
  const [patients, setPatients] = useState([])
  const [scenarios, setScenarios] = useState([])
  const [form, setForm] = useState({
    patient_id: '',
    drug_requested: '',
    diagnosis_code: '',
    requesting_doctor: '',
    additional_notes: '',
  })

  // Fetch patients and scenarios on mount
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

  const loadScenario = (scenario) => {
    setForm({ ...scenario.request })
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.patient_id || !form.drug_requested || !form.diagnosis_code || !form.requesting_doctor) return
    onSubmit(form)
  }

  const getDecisionBadgeClass = (decision) => {
    if (!decision) return ''
    const d = decision.toUpperCase()
    if (d === 'APPROVED') return 'badge-approved'
    if (d === 'DENIED') return 'badge-denied'
    if (d === 'REJECTED') return 'badge-rejected'
    return 'badge-request-more-info'
  }

  const getConfidenceColor = (conf) => {
    if (conf >= 0.8) return 'bg-emerald-500'
    if (conf >= 0.5) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column — Request Form */}
      <div className="animate-fade-in-up">
        <h2 className="text-2xl font-bold text-white mb-2">Submit Authorization Request</h2>
        <p className="text-slate-400 text-sm mb-6">Fill in the details or load a demo scenario below.</p>

        {/* Scenario Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => loadScenario(s)}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-600 text-slate-300 
                hover:border-blue-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-200 cursor-pointer"
              title={s.description}
            >
              {s.name}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Patient Dropdown */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Patient</label>
            <select
              name="patient_id"
              value={form.patient_id}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-600 text-white 
                focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all text-sm"
            >
              <option value="">Select a patient...</option>
              {patients.map(p => (
                <option key={p.patient_id} value={p.patient_id}>
                  {p.patient_id} — {p.name} ({p.payer}, Age {p.age})
                </option>
              ))}
            </select>
          </div>

          {/* Drug Requested */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Drug Requested</label>
            <input
              type="text"
              name="drug_requested"
              value={form.drug_requested}
              onChange={handleChange}
              placeholder="e.g. Ozempic"
              className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-600 text-white 
                placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all text-sm"
            />
          </div>

          {/* Diagnosis Code */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Diagnosis Code (ICD-10)</label>
            <input
              type="text"
              name="diagnosis_code"
              value={form.diagnosis_code}
              onChange={handleChange}
              placeholder="e.g. E11.9"
              className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-600 text-white 
                placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all text-sm"
            />
          </div>

          {/* Requesting Doctor */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Requesting Doctor</label>
            <input
              type="text"
              name="requesting_doctor"
              value={form.requesting_doctor}
              onChange={handleChange}
              placeholder="e.g. Dr. Mehta"
              className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-600 text-white 
                placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Additional Clinical Notes
              <span className="ml-2 text-xs text-gray-500 font-normal">
                — optional
              </span>
            </label>
            <textarea
              value={form.additional_notes || ""}
              onChange={e => setForm({...form, additional_notes: e.target.value})}
              placeholder={
                "Extra context for the agents — examples:\n" +
                "• HbA1c: 9.2% (last tested 2 weeks ago)\n" +
                "• Patient tried Metformin but discontinued due to GI side effects\n" +
                "• Referred by specialist Dr. Kapoor — urgent case\n" +
                "• Previous PA denied on 2024-01-10, appealing now"
              }
              rows={5}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-400 focus:outline-none placeholder-gray-500 resize-none leading-relaxed"
            />
            <p className="text-xs text-gray-500 mt-1">
              This text is passed to all 3 agents. More context = better decisions.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !form.patient_id}
            className="w-full py-3.5 rounded-xl font-semibold text-white text-sm
              bg-gradient-to-r from-blue-600 to-cyan-500 
              hover:from-blue-500 hover:to-cyan-400
              disabled:opacity-40 disabled:cursor-not-allowed
              shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30
              transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
                Processing with AI Agents...
              </>
            ) : (
              <>🚀 Submit Authorization Request</>
            )}
          </button>
        </form>
      </div>

      {/* Right Column — Decision Result */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
        {!result && !loading && (
          <div className="glass-card p-12 text-center">
            <div className="text-6xl mb-4">🏥</div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No Request Submitted</h3>
            <p className="text-slate-500 text-sm">
              Submit a request or load a demo scenario to see the AI decision pipeline in action.
            </p>
          </div>
        )}

        {loading && (
          <div className="glass-card p-12 text-center animate-pulse-glow">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full mx-auto mb-4" 
              style={{ animation: 'spin 1s linear infinite' }} />
            <h3 className="text-xl font-semibold text-white mb-2">Agents Processing...</h3>
            <p className="text-slate-400 text-sm">
              IntakeAgent → DecisionAgent → CriticAgent
            </p>
            <div className="mt-4 flex justify-center gap-1">
              {['IntakeAgent', 'DecisionAgent', 'CriticAgent'].map((name, i) => (
                <div key={name} className="px-3 py-1 rounded-full bg-slate-700/50 text-xs text-slate-400"
                  style={{ animation: `fadeIn 0.5s ease-out ${i * 0.5}s both` }}>
                  {name}
                </div>
              ))}
            </div>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-5">
            {/* Decision Banner */}
            <div className={`p-6 rounded-2xl text-center ${getDecisionBadgeClass(result.final_decision)}`}>
              <div className="text-4xl font-extrabold tracking-tight mb-1">
                {result.final_decision || result.status}
              </div>
              {result.status === 'REJECTED_AT_INTAKE' && (
                <p className="text-white/80 text-sm">Request failed intake validation</p>
              )}
            </div>

            {/* Confidence + Revision */}
            {result.confidence !== undefined && (
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-300">Confidence Score</span>
                  <span className="text-lg font-bold text-white">{Math.round(result.confidence * 100)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-700 ${getConfidenceColor(result.confidence)}`}
                    style={{ width: `${result.confidence * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Revision Badge */}
            {result.revision_made && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <span className="text-amber-400 font-bold text-sm">Critic Override — Decision Revised</span>
                    <p className="text-amber-400/70 text-xs mt-0.5">
                      The CriticAgent found issues and the DecisionAgent revised its decision.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Intake Summary */}
            {result.intake_summary && (
              <div className="glass-card p-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Intake Summary</h4>
                <p className="text-sm text-slate-200">{result.intake_summary}</p>
              </div>
            )}

            {/* Reasoning */}
            {result.reasoning && result.reasoning.length > 0 && (
              <div className="glass-card p-5">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Reasoning</h4>
                <ol className="space-y-2">
                  {result.reasoning.map((r, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 text-slate-300 text-xs flex items-center justify-center font-medium">
                        {i + 1}
                      </span>
                      <span className="text-slate-300">{r}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Issues (for rejected requests) */}
            {result.issues && result.issues.length > 0 && (
              <div className="glass-card p-5">
                <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">Issues Found</h4>
                <ul className="space-y-1">
                  {result.issues.map((issue, i) => (
                    <li key={i} className="text-sm text-red-300 flex items-start gap-2">
                      <span>⚠️</span> {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* View Trace Button */}
            {result.trace && (
              <button
                onClick={onViewTrace}
                className="w-full py-3 rounded-xl font-medium text-sm text-blue-400 
                  border border-blue-500/30 hover:bg-blue-500/10 
                  transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                🔍 View Full Agent Trace ({result.trace.length} steps) →
              </button>
            )}

            {/* Error */}
            {result.error && (
              <div className="glass-card p-5 border-red-500/30">
                <h4 className="text-sm font-semibold text-red-400 mb-1">Error</h4>
                <p className="text-sm text-red-300">{result.error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
