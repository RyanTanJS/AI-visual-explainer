import { motion, AnimatePresence } from 'framer-motion'
import useSceneStore from '../../stores/sceneStore'

const STEP_STYLES = {
  action: {
    label: 'Action',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-300',
    icon: '⚡',
  },
  observation: {
    label: 'Observation',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-300',
    icon: '👁',
  },
  thought: {
    label: 'Thought',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    text: 'text-indigo-300',
    icon: '💭',
  },
  answer: {
    label: 'Answer',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-300',
    icon: '✓',
  },
}

function StepCard({ step, index }) {
  const style = STEP_STYLES[step.type] || STEP_STYLES.thought

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`${style.bg} border ${style.border} rounded-lg p-3`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-sm">{style.icon}</span>
        <span className={`text-xs font-semibold uppercase tracking-wide ${style.text}`}>
          {style.label}
          {step.type === 'action' && step.tool && (
            <span className="ml-1 normal-case font-mono">: {step.tool}()</span>
          )}
        </span>
        <span className="text-[10px] text-[#64748b] ml-auto">Step {index + 1}</span>
      </div>

      <div className="text-xs text-[#cbd5e1] leading-relaxed">
        {step.type === 'action' && step.params && (
          <code className="block bg-black/20 rounded p-2 font-mono text-[11px] break-all">
            {JSON.stringify(step.params, null, 2)}
          </code>
        )}
        {step.type === 'observation' && (
          <div className="bg-black/20 rounded p-2 max-h-32 overflow-y-auto font-mono text-[11px]">
            {step.result}
          </div>
        )}
        {step.type === 'thought' && <p>{step.content}</p>}
        {step.type === 'answer' && (
          <p className="text-emerald-200">{step.content?.slice(0, 200)}...</p>
        )}
      </div>
    </motion.div>
  )
}

export default function ReActPanel() {
  const steps = useSceneStore((s) => s.steps)
  const hasSteps = steps.some((s) => s.type !== 'answer')

  return (
    <div className="w-full h-full flex flex-col p-6 overflow-hidden">
      <h3 className="text-sm font-semibold text-white mb-4">
        ReAct Loop — Thought / Action / Observation
      </h3>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        <AnimatePresence>
          {steps.map((step, i) => (
            <StepCard key={i} step={step} index={i} />
          ))}
        </AnimatePresence>

        {steps.length === 0 && (
          <div className="flex items-center justify-center h-full text-[#64748b] text-sm">
            Press "Play Scene" to see the ReAct loop
          </div>
        )}
      </div>

      {/* Teaching callout */}
      {hasSteps && steps.some((s) => s.type === 'answer') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3 text-xs text-indigo-200"
        >
          <span className="font-semibold">Why tools matter:</span> The AI used a calculator
          for the maths — it didn't compute it in its head. LLMs are unreliable at arithmetic,
          so well-designed agents delegate numbers to deterministic tools.
        </motion.div>
      )}
    </div>
  )
}
