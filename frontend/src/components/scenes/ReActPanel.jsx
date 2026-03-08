import { motion, AnimatePresence } from 'framer-motion'
import useSceneStore from '../../stores/sceneStore'

// ── Style config ─────────────────────────────────────────────
const NODE_STYLES = {
  thought: {
    label: 'Thought',
    color: '#14b8a6',
    lightColor: '#5eead4',
    bg: '#14b8a615',
    border: '#14b8a640',
  },
  action: {
    label: 'Action',
    color: '#f59e0b',
    lightColor: '#fcd34d',
    bg: '#f59e0b15',
    border: '#f59e0b40',
  },
  observation: {
    label: 'Observation',
    color: '#3b82f6',
    lightColor: '#93c5fd',
    bg: '#3b82f615',
    border: '#3b82f640',
  },
  answer: {
    label: 'Final Answer',
    color: '#ec4899',
    lightColor: '#f9a8d4',
    bg: '#ec489915',
    border: '#ec489940',
  },
}

// ── Explainer content ────────────────────────────────────────
const STEP_EXPLAINERS = {
  thought: {
    title: 'What is a Thought?',
    content:
      'In the ReAct framework, the agent reasons out loud before acting. This "chain of thought" helps the model plan its next move — which tool to call, what information it still needs, and how to structure the answer.',
  },
  action: {
    title: 'What is an Action?',
    content:
      'An action is a tool call the agent decides to make. Instead of guessing, the agent delegates tasks to specialised tools — like a search engine for information or a calculator for maths.',
  },
  observation: {
    title: 'What is an Observation?',
    content:
      'The observation is the result returned by the tool. The agent reads this output and decides what to do next — it might need more information (another action) or it might have enough to answer.',
  },
  answer: {
    title: 'Final Answer',
    content:
      'After gathering enough information through the Think → Act → Observe loop, the agent synthesises everything into a coherent response grounded in real data from tool calls.',
  },
}

const TOOL_EXPLAINERS = {
  rag_search: {
    title: 'Tool: RAG Search',
    content:
      'The agent calls the same vector search from Scene 1 — embedding the query and finding the closest matches in ChromaDB. This grounds the response in real product data rather than the model\'s training knowledge.',
  },
  calculator: {
    title: 'Tool: Calculator',
    content:
      'LLMs are notoriously unreliable at arithmetic. Rather than risk a wrong calculation, the agent delegates maths to a deterministic calculator tool. £1,800 x 12 = £21,600 — guaranteed correct every time.',
  },
}

// ── Timeline step card ───────────────────────────────────────
function StepCard({ step, index, state }) {
  const style = NODE_STYLES[step.type] || NODE_STYLES.thought
  const isActive = state === 'active'
  const isFuture = state === 'future'

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: isFuture ? 0.35 : 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="relative flex gap-3"
    >
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center shrink-0" style={{ width: 20 }}>
        <div
          className="w-3 h-3 rounded-full shrink-0 mt-3 z-10 transition-all duration-300"
          style={{
            background: isFuture ? '#2a2d3a' : style.color,
            boxShadow: isActive ? `0 0 10px ${style.color}80` : 'none',
            border: isFuture ? '2px solid #3a3d4a' : 'none',
          }}
        />
        <div
          className="w-px flex-1 -mt-px"
          style={{ background: isFuture ? '#2a2d3a' : `${style.color}40` }}
        />
      </div>

      {/* Card */}
      <div
        className="flex-1 rounded-lg mb-3 overflow-hidden transition-all duration-300"
        style={{
          background: '#1a1d27',
          border: `1px solid ${isActive ? style.color : isFuture ? '#2a2d3a' : style.border}`,
          boxShadow: isActive ? `0 0 20px ${style.color}20` : 'none',
        }}
      >
        {/* Card header */}
        <div
          className="px-3 py-2 flex items-center gap-2"
          style={{ borderBottom: `1px solid ${isFuture ? '#2a2d3a' : style.border}` }}
        >
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: isFuture ? '#64748b' : style.lightColor }}
          >
            {style.label}
            {step.type === 'action' && step.tool && (
              <span className="font-mono normal-case ml-1 opacity-80">
                — {step.tool}()
              </span>
            )}
          </span>
        </div>

        {/* Card body */}
        {!isFuture && (
          <div className="px-3 py-2.5 text-xs leading-relaxed text-[#cbd5e1]">
            {step.type === 'thought' && <p className="m-0">{step.content}</p>}
            {step.type === 'action' && step.params && (
              <code className="block bg-black/20 rounded p-2 font-mono text-[10px] break-all">
                {JSON.stringify(step.params, null, 2)}
              </code>
            )}
            {step.type === 'observation' && (
              <div className="bg-black/20 rounded p-2 font-mono text-[10px] max-h-16 overflow-y-auto">
                {step.result}
              </div>
            )}
            {step.type === 'answer' && (
              <p className="m-0" style={{ color: '#f9a8d4' }}>
                {step.content}
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Main component ───────────────────────────────────────────
export default function ReActPanel() {
  const trace = useSceneStore((s) => s.trace)
  const reactStepIndex = useSceneStore((s) => s.reactStepIndex)
  const advanceReact = useSceneStore((s) => s.advanceReact)
  const sceneCompleted = useSceneStore((s) => s.sceneCompleted)
  const currentScene = useSceneStore((s) => s.currentScene)

  const traceSteps = trace?.steps || []
  const isStarted = reactStepIndex >= 0
  const isDone = sceneCompleted[currentScene]

  // Compute loop summary stats
  const visibleSteps = traceSteps.slice(0, reactStepIndex + 1)
  const thoughtCount = visibleSteps.filter((s) => s.type === 'thought').length
  const toolCalls = visibleSteps.filter((s) => s.type === 'action').length
  const iterations = visibleSteps.filter((s) => s.type === 'observation').length

  // Active explainer
  const activeStep = reactStepIndex >= 0 ? traceSteps[reactStepIndex] : null
  const explainer = activeStep
    ? activeStep.type === 'action' && activeStep.tool && TOOL_EXPLAINERS[activeStep.tool]
      ? TOOL_EXPLAINERS[activeStep.tool]
      : STEP_EXPLAINERS[activeStep.type]
    : null
  const activeStyle = activeStep ? NODE_STYLES[activeStep.type] : null

  // Answer step (for output column)
  const answerStep = visibleSteps.find((s) => s.type === 'answer')

  // Button label
  let buttonLabel = 'Next Step'
  if (reactStepIndex >= 0 && reactStepIndex < traceSteps.length - 1) {
    const nextStep = traceSteps[reactStepIndex + 1]
    const nextStyle = NODE_STYLES[nextStep.type]
    buttonLabel = `Next: ${nextStyle?.label || 'Step'}`
    if (nextStep.type === 'action' && nextStep.tool) {
      buttonLabel += ` (${nextStep.tool})`
    }
  } else if (reactStepIndex >= traceSteps.length - 1 && !isDone) {
    buttonLabel = 'Complete'
  }

  if (!isStarted) {
    return (
      <div className="w-full h-full flex items-center justify-center text-[#64748b] text-sm">
        Press "Play Scene" to start the ReAct loop
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Responsive layout: single column on mobile, 3-column on md+ */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4">

        {/* ── MOBILE: stacked layout ── */}
        <div className="md:hidden flex flex-col gap-3 h-full pb-9">
          {/* Compact query + stats bar */}
          <div className="flex gap-2 items-start">
            <div className="flex-1 min-w-0 rounded-lg border border-[#ffffff20] bg-[#1a1d27] px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#ffffffcc] mb-1">Query</p>
              <p className="text-xs text-white leading-relaxed m-0 line-clamp-2">{trace?.query}</p>
            </div>
            <div className="shrink-0 rounded-lg border border-[#2a2d3a] bg-[#1a1d27] px-3 py-2 flex gap-3 text-[10px]">
              <div className="text-center">
                <p className="text-white font-medium">{iterations}</p>
                <p className="text-[#64748b]">Loops</p>
              </div>
              <div className="text-center">
                <p className="text-white font-medium">{toolCalls}</p>
                <p className="text-[#64748b]">Tools</p>
              </div>
            </div>
          </div>

          {/* ReAct pattern + active explainer */}
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-1 text-[10px]">
              <span className="px-1.5 py-0.5 rounded" style={{
                background: activeStep?.type === 'thought' ? '#14b8a630' : 'transparent',
                color: activeStep?.type === 'thought' ? '#5eead4' : '#64748b',
              }}>Think</span>
              <span className="text-[#64748b]">&rarr;</span>
              <span className="px-1.5 py-0.5 rounded" style={{
                background: activeStep?.type === 'action' ? '#f59e0b30' : 'transparent',
                color: activeStep?.type === 'action' ? '#fcd34d' : '#64748b',
              }}>Act</span>
              <span className="text-[#64748b]">&rarr;</span>
              <span className="px-1.5 py-0.5 rounded" style={{
                background: activeStep?.type === 'observation' ? '#3b82f630' : 'transparent',
                color: activeStep?.type === 'observation' ? '#93c5fd' : '#64748b',
              }}>Observe</span>
            </div>
          </div>

          {/* Agent loop timeline — takes most space */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {traceSteps.map((step, i) => {
              let state = 'future'
              if (i < reactStepIndex) state = 'past'
              else if (i === reactStepIndex) state = 'active'
              if (step.type === 'answer') return null
              return <StepCard key={i} step={step} index={i} state={state} />
            })}
          </div>

          {/* Explainer — below timeline on mobile */}
          <AnimatePresence mode="wait">
            {explainer && activeStep?.type !== 'answer' && (
              <motion.div
                key={`${activeStep?.type}-${reactStepIndex}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="rounded-lg px-3 py-2.5"
                style={{
                  background: activeStyle?.bg || '#1a1d27',
                  border: `1px solid ${activeStyle?.border || '#2a2d3a'}`,
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-0.5 h-3.5 rounded-full" style={{ background: activeStyle?.color }} />
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider m-0" style={{ color: activeStyle?.lightColor }}>
                    {explainer.title}
                  </h4>
                </div>
                <p className="text-[11px] leading-relaxed text-[#cbd5e1] m-0">{explainer.content}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Answer — at bottom on mobile */}
          {answerStep && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg overflow-hidden"
              style={{ border: `1px solid ${NODE_STYLES.answer.border}`, background: '#1a1d27' }}
            >
              <div className="px-3 py-2 flex items-center gap-2" style={{ borderBottom: `1px solid ${NODE_STYLES.answer.border}` }}>
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" fill="#ec4899" />
                </svg>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#f9a8d4]">Final Answer</span>
              </div>
              <div className="px-3 py-2.5">
                <p className="text-xs leading-relaxed text-[#f9a8d4] m-0">{answerStep.content}</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* ── DESKTOP: 3-column grid with emphasis on center ── */}
        <div className="hidden md:grid grid-cols-[minmax(160px,1fr)_3fr_minmax(180px,1.2fr)] gap-4 h-full min-h-0">

          {/* ── LEFT COLUMN: Input + Summary ── */}
          <div className="flex flex-col gap-4">
            {/* Input card */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748b] mb-2 px-1">
                Input
              </p>
              <div className="rounded-lg border border-[#ffffff20] bg-[#1a1d27] overflow-hidden">
                <div className="px-3 py-2 border-b border-[#ffffff15]">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#ffffffcc]">
                    User Query
                  </span>
                </div>
                <div className="px-3 py-2.5">
                  <p className="text-xs text-white leading-relaxed m-0">
                    {trace?.query}
                  </p>
                </div>
              </div>
            </div>

            {/* Loop summary */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748b] mb-2 px-1">
                Loop Summary
              </p>
              <div className="rounded-lg border border-[#2a2d3a] bg-[#1a1d27] px-3 py-2.5 space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#64748b]">Iterations</span>
                  <span className="text-white font-medium">{iterations}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#64748b]">Tool calls</span>
                  <span className="text-white font-medium">{toolCalls}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#64748b]">Thoughts</span>
                  <span className="text-white font-medium">{thoughtCount}</span>
                </div>
              </div>
            </div>

            {/* ReAct pattern legend */}
            <div className="rounded-lg border border-[#2a2d3a] bg-[#1a1d27] px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748b] mb-2">
                ReAct Pattern
              </p>
              <div className="flex items-center gap-1 text-[10px] flex-wrap">
                <span
                  className="px-1.5 py-0.5 rounded transition-colors"
                  style={{
                    background: activeStep?.type === 'thought' ? '#14b8a630' : 'transparent',
                    color: activeStep?.type === 'thought' ? '#5eead4' : '#64748b',
                  }}
                >
                  Think
                </span>
                <span className="text-[#64748b]">&rarr;</span>
                <span
                  className="px-1.5 py-0.5 rounded transition-colors"
                  style={{
                    background: activeStep?.type === 'action' ? '#f59e0b30' : 'transparent',
                    color: activeStep?.type === 'action' ? '#fcd34d' : '#64748b',
                  }}
                >
                  Act
                </span>
                <span className="text-[#64748b]">&rarr;</span>
                <span
                  className="px-1.5 py-0.5 rounded transition-colors"
                  style={{
                    background: activeStep?.type === 'observation' ? '#3b82f630' : 'transparent',
                    color: activeStep?.type === 'observation' ? '#93c5fd' : '#64748b',
                  }}
                >
                  Observe
                </span>
              </div>
            </div>
          </div>

          {/* ── CENTER COLUMN: Agent Loop Timeline ── */}
          <div className="flex flex-col min-h-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748b] mb-2 px-1">
              Agent Loop
            </p>
            <div className="flex-1 overflow-y-auto pr-1">
              {traceSteps.map((step, i) => {
                let state = 'future'
                if (i < reactStepIndex) state = 'past'
                else if (i === reactStepIndex) state = 'active'

                // Don't render answer in the timeline — it goes in the output column
                if (step.type === 'answer') return null

                return (
                  <StepCard key={i} step={step} index={i} state={state} />
                )
              })}
            </div>
          </div>

          {/* ── RIGHT COLUMN: Output + Explainer ── */}
          <div className="flex flex-col gap-4">
            {/* Output */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748b] mb-2 px-1">
                Output
              </p>
              {answerStep ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg overflow-hidden"
                  style={{
                    border: `1px solid ${NODE_STYLES.answer.border}`,
                    background: '#1a1d27',
                  }}
                >
                  <div
                    className="px-3 py-2 flex items-center gap-2"
                    style={{ borderBottom: `1px solid ${NODE_STYLES.answer.border}` }}
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z"
                        fill="#ec4899"
                      />
                    </svg>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#f9a8d4]">
                      Final Answer
                    </span>
                  </div>
                  <div className="px-3 py-2.5">
                    <p className="text-xs leading-relaxed text-[#f9a8d4] m-0">
                      {answerStep.content}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="rounded-lg border border-[#2a2d3a] bg-[#1a1d27] px-3 py-6 text-center">
                  <p className="text-[11px] text-[#64748b] m-0">
                    Awaiting agent completion...
                  </p>
                </div>
              )}
            </div>

            {/* Explainer */}
            <AnimatePresence mode="wait">
              {explainer && activeStep?.type !== 'answer' && (
                <motion.div
                  key={`${activeStep?.type}-${reactStepIndex}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748b] mb-2 px-1">
                    What's happening
                  </p>
                  <div
                    className="rounded-lg px-3 py-2.5"
                    style={{
                      background: activeStyle?.bg || '#1a1d27',
                      border: `1px solid ${activeStyle?.border || '#2a2d3a'}`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className="w-0.5 h-3.5 rounded-full"
                        style={{ background: activeStyle?.color }}
                      />
                      <h4
                        className="text-[10px] font-semibold uppercase tracking-wider m-0"
                        style={{ color: activeStyle?.lightColor }}
                      >
                        {explainer.title}
                      </h4>
                    </div>
                    <p className="text-[11px] leading-relaxed text-[#cbd5e1] m-0">
                      {explainer.content}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom: advance button */}
      {!isDone && (
        <div className="px-4 pt-3 pb-4 border-t border-[#2a2d3a]">
          <button
            onClick={advanceReact}
            className="w-full py-2 px-3 rounded-lg text-xs font-semibold
                       bg-teal-500/20 text-teal-300 border border-teal-500/30
                       hover:bg-teal-500/30 transition-colors"
          >
            {buttonLabel}
          </button>
        </div>
      )}
    </div>
  )
}
