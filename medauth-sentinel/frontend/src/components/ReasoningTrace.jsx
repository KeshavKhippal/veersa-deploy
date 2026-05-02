import { useState } from 'react'

const AGENT_COLORS = {
  IntakeAgent: { bg: 'from-blue-600 to-blue-500', ring: 'ring-blue-500/30', text: 'text-blue-400', dot: 'bg-blue-500' },
  DecisionAgent: { bg: 'from-purple-600 to-purple-500', ring: 'ring-purple-500/30', text: 'text-purple-400', dot: 'bg-purple-500' },
  CriticAgent: { bg: 'from-orange-600 to-orange-500', ring: 'ring-orange-500/30', text: 'text-orange-400', dot: 'bg-orange-500' },
  DecisionAgent_Revised: { bg: 'from-emerald-600 to-emerald-500', ring: 'ring-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-500' },
}

function TraceStep({ step, isLast }) {
  const i = step.step;
  const [expandedCard, setExpandedCard] = useState(null)
  const [expandedJson, setExpandedJson] = useState(null)
  
  const isRevised = step.agent === "DecisionAgent_Revised";
  const agentColor = 
    step.agent === "IntakeAgent" ? "blue" :
    step.agent === "DecisionAgent" ? "purple" :
    step.agent === "CriticAgent" ? "orange" :
    step.agent === "DecisionAgent_Revised" ? "green" : "gray";

  const agentLabel = isRevised ? "DecisionAgent (Revised)" : step.agent;
  
  const style = AGENT_COLORS[step.agent] || AGENT_COLORS.IntakeAgent
  const output = step.output || {}

  const getSummary = () => {
    if (step.agent === 'IntakeAgent')
      return <span className={output.valid ? 'text-emerald-400' : 'text-red-400'}>{output.valid ? '✅ Valid' : '❌ Invalid'}{output.intake_summary ? ` — ${output.intake_summary}` : ''}</span>
    if (step.agent === 'DecisionAgent' || step.agent === 'DecisionAgent_Revised')
      return <span className={output.decision === 'APPROVED' ? 'text-emerald-400' : output.decision === 'DENIED' ? 'text-red-400' : 'text-yellow-400'}>{output.decision}{output.confidence !== undefined ? ` • ${Math.round(output.confidence * 100)}%` : ''}</span>
    if (step.agent === 'CriticAgent')
      return <span className={output.agrees ? 'text-emerald-400' : 'text-amber-400'}>{output.agrees ? '✅ Agrees' : `⚠️ Disagrees (${output.severity})`}</span>
    return null
  }

  return (
    <div className="relative flex gap-4 animate-fade-in-up" style={{ animationDelay: `${step.step * 0.1}s` }}>
      {!isLast && <div className="absolute left-[18px] top-12 bottom-0 w-0.5 bg-slate-700" />}
      <div className={`relative z-10 flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br ${style.bg} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>{step.step}</div>
      <div className="flex-1 mb-6">
        <div className={`glass-card overflow-hidden cursor-pointer ${style.ring} ring-1`} onClick={() => setExpandedCard(expandedCard === i ? null : i)}>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${style.dot}`} />
              <h3 className={`font-semibold text-sm ${style.text}`}>{agentLabel.replace('_', ' ')}</h3>
              {step.note && <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">⚡ {step.note}</span>}
            </div>
            <span className={`text-slate-400 transition-transform duration-200 text-xs ${expandedCard === i ? 'rotate-180' : ''}`}>▼</span>
          </div>
          <div className="px-4 pb-3 text-xs text-slate-400">{getSummary()}</div>
          {expandedCard === i && (
            <div className="border-t border-slate-700/50 p-4 animate-slide-down">
              {isRevised && (
                <div className="mb-3 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2 flex items-center gap-2">
                  <span className="text-green-400 text-sm">⚡</span>
                  <p className="text-xs text-green-400 font-medium">
                    This is a revised decision made after CriticAgent feedback.
                    The original decision was overridden.
                  </p>
                </div>
              )}
              {output.reasoning && <div className="mb-3"><h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Reasoning</h4><ol className="space-y-1">{output.reasoning.map((r, i) => <li key={i} className="text-xs text-slate-300"><span className="text-slate-500">{i+1}.</span> {r}</li>)}</ol></div>}
              {output.issues_found && output.issues_found.length > 0 && <div className="mb-3"><h4 className="text-xs font-semibold text-amber-400 uppercase mb-2">⚠️ Issues</h4><ul className="space-y-1">{output.issues_found.map((x, i) => <li key={i} className="text-xs text-amber-300/80">• {x}</li>)}</ul></div>}
              {output.critic_summary && <p className="text-xs text-slate-300 mb-3"><strong className="text-slate-400">Critic:</strong> {output.critic_summary}</p>}
              {output.suggested_revision && <p className="text-xs text-orange-300/80 mb-3"><strong className="text-orange-400">Revision:</strong> {output.suggested_revision}</p>}
              {output.criteria_met && <div className="mb-3 grid grid-cols-2 gap-1">{Object.entries(output.criteria_met).map(([k, v]) => <div key={k} className="text-xs text-slate-400">{v === true ? '✅' : v === false ? '❌' : '➖'} {k.replace(/_/g, ' ')}</div>)}</div>}

              {step.output?.reasoning && (
                <div className="mt-3 bg-gray-900/40 border border-gray-700/40 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    How this conclusion was reached
                  </p>
                  <ol className="space-y-2">
                    {step.output.reasoning.map((r, ri) => (
                      <li key={ri} className="flex gap-2 text-xs">
                        <span className="text-gray-500 shrink-0 font-mono">
                          {String(ri + 1).padStart(2, '0')}.
                        </span>
                        <span className="text-gray-300 leading-relaxed">{r}</span>
                      </li>
                    ))}
                  </ol>
                  {step.output?.criteria_met && (
                    <div className="mt-3 pt-3 border-t border-gray-700/40">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Criteria Checklist
                      </p>
                      <div className="grid grid-cols-2 gap-1">
                        {Object.entries(step.output.criteria_met).map(([key, val]) => (
                          <div key={key} className="flex items-center gap-1.5 text-xs">
                            <span className={
                              val === true ? "text-green-400" :
                              val === false ? "text-red-400" :
                              "text-gray-400"
                            }>
                              {val === true ? "✅" : val === false ? "❌" : "—"}
                            </span>
                            <span className="text-gray-400 capitalize">
                              {key.replace(/_/g, " ")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {step.output?.decision && (
                    <div className="mt-3 pt-3 border-t border-gray-700/40 flex items-center justify-between">
                      <span className="text-xs text-gray-400">Final conclusion:</span>
                      <span className={`text-sm font-bold ${
                        step.output.decision === "APPROVED" ? "text-green-400" :
                        step.output.decision === "DENIED" ? "text-red-400" :
                        "text-yellow-400"
                      }`}>
                        {step.output.decision}
                        {step.output.confidence !== undefined && (
                          <span className="text-xs font-normal text-gray-400 ml-1">
                            ({(step.output.confidence * 100).toFixed(0)}% confidence)
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-gray-700/50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedJson(expandedJson === i ? null : i);
                  }}
                  className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors py-1 px-2 rounded bg-gray-800/80 hover:bg-gray-700"
                >
                  <span className="font-mono text-gray-400">{"{ }"}</span>
                  <span>{expandedJson === i ? "▲ Hide Raw JSON" : "▼ Show Raw JSON"}</span>
                </button>

                {expandedJson === i && (
                  <div className="mt-2 relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(
                          JSON.stringify(step.output, null, 2)
                        );
                      }}
                      className="absolute top-2 right-2 z-10 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-600 px-2 py-1 rounded transition-colors"
                    >
                      Copy
                    </button>
                    <pre className="text-xs text-gray-300 overflow-auto bg-gray-950 border border-gray-700/60 rounded-lg p-3 pt-8 max-h-80 whitespace-pre-wrap break-words">
                      {JSON.stringify(step.output, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ReasoningTrace({ result }) {
  if (!result || !result.trace) {
    return (<div className="text-center py-20"><div className="text-6xl mb-4">🔍</div><h3 className="text-xl font-semibold text-slate-300 mb-2">No Trace Available</h3><p className="text-slate-500 text-sm">Submit a request first to see the agent reasoning trace.</p></div>)
  }
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Agent Reasoning Trace</h2>
        <p className="text-slate-400 text-sm">{result.trace.length} steps • Click to expand</p>
        {result.revision_made && <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20"><span>⚡</span><span className="text-xs text-amber-400 font-medium">Critic Override — 4-step pipeline</span></div>}
      </div>
      <div>{result.trace.map((s, i) => <TraceStep key={s.step} step={s} isLast={i === result.trace.length - 1} />)}</div>
      <div className="glass-card p-5 mt-4 flex items-center justify-between">
        <div><h4 className="text-xs text-slate-400 uppercase font-semibold">Final Decision</h4><p className="text-lg font-bold text-white">{result.final_decision}</p></div>
        {result.confidence !== undefined && <div className="text-right"><h4 className="text-xs text-slate-400 uppercase font-semibold">Confidence</h4><p className="text-lg font-bold text-white">{Math.round(result.confidence * 100)}%</p></div>}
      </div>
    </div>
  )
}
