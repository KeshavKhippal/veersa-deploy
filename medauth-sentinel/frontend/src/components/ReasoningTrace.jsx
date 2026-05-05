import { useState } from 'react'
import { useStore } from '@nanostores/react'
import { motion, AnimatePresence } from 'framer-motion'
import { $result } from '../store'

const AGENT_META = {
  IntakeAgent: { color: 'med-primary', icon: '📋', label: 'Intake Validator' },
  DecisionAgent: { color: 'med-accent', icon: '⚖️', label: 'Decision Engine' },
  CriticAgent: { color: 'status-warning', icon: '🔍', label: 'Adversarial Critic' },
  DecisionAgent_Revised: { color: 'status-success', icon: '⚡', label: 'Recalibrated Engine' },
}

function TraceStep({ step, isLast, index }) {
  const [expanded, setExpanded] = useState(false)
  const meta = AGENT_META[step.agent] || { color: 'med-primary', icon: '🤖', label: step.agent }
  const output = step.output || {}
  
  const getStatusClasses = () => {
    if (step.agent === 'IntakeAgent') return output.valid ? 'text-status-success bg-status-success-bg' : 'text-status-error bg-status-error-bg'
    if (step.agent === 'CriticAgent') return output.agrees ? 'text-status-success bg-status-success-bg' : 'text-status-warning bg-status-warning-bg'
    if (output.decision === 'APPROVED') return 'text-status-success bg-status-success-bg'
    if (output.decision === 'DENIED') return 'text-status-error bg-status-error-bg'
    return 'text-status-warning bg-status-warning-bg'
  }

  return (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="relative pl-10 pb-10 group"
    >
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-[17px] top-10 bottom-0 w-[2px] bg-slate-100" />
      )}
      
      {/* Node Marker */}
      <div className={`absolute left-0 top-0 w-9 h-9 rounded-xl border-2 border-white bg-white shadow-md flex items-center justify-center z-10 
        group-hover:scale-110 transition-transform duration-300`}>
        <div className={`w-2.5 h-2.5 rounded-full bg-${meta.color}`} />
      </div>

      {/* Card Content */}
      <div 
        className={`med-card p-6 cursor-pointer hover:bg-slate-50/50 ${expanded ? 'border-med-primary/40 ring-4 ring-med-primary/5' : ''}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <span className="text-xl shrink-0">{meta.icon}</span>
            <div>
               <h3 className="text-[13px] font-bold text-med-text tracking-tight">{meta.label}</h3>
               <div className="text-[10px] font-medium text-med-text-muted mt-0.5">Step {step.step} // Execution Success</div>
            </div>
          </div>
          <div className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-current/10 ${getStatusClasses()}`}>
            {step.agent === 'IntakeAgent' ? (output.valid ? 'Verified' : 'Invalid') : 
             step.agent === 'CriticAgent' ? (output.agrees ? 'Agreement' : 'Override') : 
             (output.decision || 'Complete')}
          </div>
        </div>

        {/* Highlight Data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-slate-50 pt-4 mt-2">
           {output.confidence !== undefined && (
             <div>
                <span className="med-label text-[10px] opacity-60 mb-1">Confidence</span>
                <span className="text-[13px] font-bold text-med-text">{(output.confidence * 100).toFixed(1)}%</span>
             </div>
           )}
           {output.severity && (
             <div>
                <span className="med-label text-[10px] opacity-60 mb-1">Impact Level</span>
                <span className={`text-[13px] font-bold uppercase ${output.severity === 'major' ? 'text-status-error' : 'text-status-warning'}`}>{output.severity}</span>
             </div>
           )}
           {step.note && (
             <div className="col-span-2 md:col-span-1">
                <span className="med-label text-[10px] opacity-60 mb-1">System Correction</span>
                <span className="text-[12px] font-bold text-status-warning flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                    {step.note}
                </span>
             </div>
           )}
        </div>

        {/* Detailed Toggle Content */}
        <AnimatePresence>
            {expanded && (
            <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
            >
                <div className="mt-6 space-y-6 border-t border-slate-100 pt-6">
                    {output.reasoning && (
                    <div>
                        <h4 className="med-label text-med-primary text-[10px]">Reasoning Chain</h4>
                        <div className="space-y-3">
                            {output.reasoning.map((r, i) => (
                            <div key={i} className="flex gap-4 text-[12px] font-medium text-med-secondary leading-relaxed">
                                <span className="text-slate-300 font-bold shrink-0">{i+1}</span>
                                <p>{r}</p>
                            </div>
                            ))}
                        </div>
                    </div>
                    )}

                    {output.issues_found && output.issues_found.length > 0 && (
                    <div className="bg-status-error-bg/50 border border-status-error/10 p-5 rounded-2xl">
                        <h4 className="med-label text-status-error text-[10px] mb-3">Detected Discrepancies</h4>
                        <ul className="space-y-2.5">
                            {output.issues_found.map((x, i) => (
                            <li key={i} className="text-[12px] font-bold text-status-error/80 flex items-start gap-3">
                                <span className="mt-1.5 w-1.5 h-1.5 bg-status-error rounded-full shrink-0" /> {x}
                            </li>
                            ))}
                        </ul>
                    </div>
                    )}

                    {output.suggested_revision && (
                    <div className="bg-status-warning-bg border border-status-warning/10 p-5 rounded-2xl">
                        <h4 className="med-label text-status-warning text-[10px] mb-2">Prescribed Recalibration</h4>
                        <p className="text-[12px] font-bold text-status-warning/80 leading-relaxed italic">"{output.suggested_revision}"</p>
                    </div>
                    )}

                    <div className="pt-4">
                        <div className="med-label opacity-40 text-[9px] mb-2">Node Telemetry (JSON)</div>
                        <pre className="text-[11px] font-mono text-slate-400 bg-slate-50 p-5 rounded-2xl overflow-x-auto border border-slate-100 max-h-60">
                        {JSON.stringify(output, null, 2)}
                        </pre>
                    </div>
                </div>
            </motion.div>
            )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default function ReasoningTrace() {
  const result = useStore($result)

  if (!result || !result.trace) {
    return (
      <div className="med-card p-32 text-center bg-white border-dashed flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6 border border-slate-100 opacity-60">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <h3 className="text-xl font-extrabold text-slate-300 uppercase tracking-tighter">Trace Buffer Empty</h3>
        <p className="med-label mt-2 opacity-40">Execute authorization cycle to generate telemetry</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-12 border-b border-med-border pb-8 flex items-end justify-between">
        <div>
            <div className="med-label text-med-primary mb-2">Diagnostic Reasoning Pipeline</div>
            <h2 className="text-3xl font-extrabold text-med-text tracking-tight">Trace Analysis // {result.request?.patient_id || 'N/A'}</h2>
        </div>
        <div className="text-right hidden sm:block">
            <div className="med-label mb-1">Process ID</div>
            <div className="text-[11px] font-bold text-med-text-muted bg-white px-4 py-1.5 border border-med-border rounded-xl shadow-sm">
                TRC-SNTL-{Math.random().toString(36).substr(2, 5).toUpperCase()}
            </div>
        </div>
      </header>

      <div className="relative">
        {result.trace.map((s, i) => (
          <TraceStep 
            key={i} 
            index={i}
            step={s} 
            isLast={i === result.trace.length - 1} 
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: result.trace.length * 0.1 }}
        className="mt-10 med-card p-10 bg-white border-med-primary/10 flex items-center justify-between shadow-xl shadow-med-primary/5"
      >
        <div className="flex items-center gap-10">
          <div>
            <div className="med-label opacity-60 mb-1">Final Conclusion</div>
            <div className={`text-3xl font-extrabold tracking-tight ${
              result.final_decision === 'APPROVED' ? 'text-status-success' : 
              result.final_decision === 'DENIED' ? 'text-status-error' : 'text-status-warning'
            }`}>
              {result.final_decision}
            </div>
          </div>
          <div className="w-[1px] h-14 bg-slate-100" />
          <div>
            <div className="med-label opacity-60 mb-1">Pipeline Confidence</div>
            <div className="text-3xl font-extrabold text-med-text">
              {Math.round((result.confidence || 0) * 100)}%
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
           <div className="med-label opacity-60 mb-2">Cycle Status</div>
           <div className="flex items-center gap-2 px-5 py-2 bg-status-success-bg border border-status-success/20 text-[11px] font-bold text-status-success uppercase tracking-widest rounded-full shadow-sm">
             <div className="w-2 h-2 bg-status-success rounded-full animate-pulse" />
             Pipeline Verified
           </div>
        </div>
      </motion.div>
    </div>
  )
}
