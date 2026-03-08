import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ChatPanel from './ChatPanel'
import useSceneStore from '../../stores/sceneStore'

// Compact status text for the mobile bar (shorter than ChatPanel's version)
function getMobileStatus(phase, ingestStep, queryEmbedStep, currentScene, steps, sceneCompleted) {
  if (currentScene === 1 && phase === 'ingest') {
    if (!ingestStep) return null
    if (ingestStep === 'card') return { text: 'Reading document...', color: '#5eead4' }
    if (ingestStep === 'chunk') return { text: 'Chunking text...', color: '#fbbf24' }
    if (ingestStep === 'embed') return { text: 'Generating embedding...', color: '#6ee7b7' }
    if (ingestStep === 'place') return { text: 'Storing vector...', color: '#5eead4' }
  }
  if (currentScene === 1 && phase === 'query-embed') {
    if (queryEmbedStep === 'card') return { text: 'Preparing query...', color: '#f9a8d4' }
    if (queryEmbedStep === 'chunk') return { text: 'Chunking query...', color: '#fbbf24' }
    if (queryEmbedStep === 'embed') return { text: 'Embedding query...', color: '#6ee7b7' }
    if (queryEmbedStep === 'place') return { text: 'Placing in vector space...', color: '#f9a8d4' }
  }
  if (currentScene === 1 && phase === 'playing') {
    const hasAnswer = steps.some((s) => s.type === 'answer')
    if (hasAnswer) return null
    const hasObs = steps.some((s) => s.type === 'observation')
    if (hasObs) return { text: 'Generating response...', color: '#5eead4' }
    return { text: 'Searching vectors...', color: '#6ee7b7' }
  }
  if (currentScene >= 2 && !sceneCompleted[currentScene]) {
    const activeStep = steps[steps.length - 1]
    if (!activeStep) return null
    if (activeStep.type === 'thought') return { text: 'Thinking...', color: '#5eead4' }
    if (activeStep.type === 'action') return { text: `Tool: ${activeStep.tool}()`, color: '#fcd34d' }
    if (activeStep.type === 'observation') return { text: 'Reading result...', color: '#6ee7b7' }
    if (activeStep.type === 'routing_decision') return { text: 'Routing agents...', color: '#2dd4bf' }
    if (activeStep.type === 'edges_activated') return { text: 'Sending context...', color: '#2dd4bf' }
    if (activeStep.type === 'agent_working') return { text: `${activeStep.agent} working...`, color: '#fcd34d' }
    if (activeStep.type === 'agent_output') return { text: `${activeStep.agent} done`, color: '#6ee7b7' }
    if (activeStep.type === 'answer') return null
  }
  return null
}

// Get the label for the mobile action button
function getMobileButtonConfig(phase, ingestStep, queryEmbedStep, currentScene, isPlaying, steps, sceneCompleted, reactStepIndex) {
  const answerStep = steps.find((s) => s.type === 'answer')

  // Scene completed
  if (sceneCompleted[currentScene]) {
    return { label: 'Scene Complete', disabled: true, action: 'none' }
  }

  // Scene 1 — query embed phase
  if (currentScene === 1 && phase === 'query-embed') {
    const labels = {
      card: 'Next: Chunk query',
      chunk: 'Next: Embed query',
      embed: 'Next: Place vector',
      place: 'Start search',
    }
    return { label: labels[queryEmbedStep] || 'Next', action: 'advanceQueryEmbed', variant: 'pink' }
  }

  // Scene 1 — playing
  if (currentScene === 1 && phase === 'playing') {
    if (answerStep) return { label: 'Scene Complete', disabled: true, action: 'none' }
    return { label: 'Playing...', disabled: true, action: 'none' }
  }

  // Scene 1 — ready to play
  if (currentScene === 1 && phase === 'ready') {
    return { label: 'Play Scene', action: 'play' }
  }

  // Scene 1 — ingest phase (controls are in the overlay)
  if (currentScene === 1 && phase === 'ingest') {
    return null
  }

  // Scene 2+ — flowchart mode
  if (currentScene >= 2 && reactStepIndex >= 0) {
    return { label: 'Next Step', action: 'advanceReact' }
  }

  // Scene 2+ — ready to start
  if (currentScene >= 2 && !isPlaying) {
    return { label: 'Play Scene', action: 'play' }
  }

  return null
}

function MobileBottomBar() {
  const { trace, steps, isPlaying, play, phase, ingestStep, queryEmbedStep,
          advanceQueryEmbed, advanceReact, currentScene, reactStepIndex, sceneCompleted } = useSceneStore()
  const [expanded, setExpanded] = useState(false)

  const query = trace?.query || ''
  const answerStep = steps.find((s) => s.type === 'answer')

  // Auto-expand when answer arrives
  useEffect(() => {
    if (answerStep) setExpanded(true)
  }, [!!answerStep])
  const status = getMobileStatus(phase, ingestStep, queryEmbedStep, currentScene, steps, sceneCompleted)
  const btnConfig = getMobileButtonConfig(phase, ingestStep, queryEmbedStep, currentScene, isPlaying, steps, sceneCompleted, reactStepIndex)

  // During ingest phase, don't show the bottom bar (overlay has its own controls)
  if (phase === 'ingest') return null

  const handleAction = () => {
    if (!btnConfig) return
    if (btnConfig.action === 'play') play()
    else if (btnConfig.action === 'advanceQueryEmbed') advanceQueryEmbed()
    else if (btnConfig.action === 'advanceReact') advanceReact()
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 bg-[#1a1d27]/95 backdrop-blur-sm
                    border-t border-[#2a2d3a]">
      {/* Expandable answer area */}
      <AnimatePresence>
        {answerStep && expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pt-3 pb-1 max-h-[40vh] overflow-y-auto">
              <p className="text-[10px] font-semibold text-teal-400 mb-1">Apex AI</p>
              <p className="text-xs text-[#e2e8f0] leading-relaxed">
                {answerStep.content}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-3 py-2.5 space-y-2">
        {/* Query bubble */}
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-teal-300 font-semibold mb-0.5">Alex</p>
            <p className="text-xs text-white/90 line-clamp-2">{query}</p>
          </div>

          {/* Answer preview / expand toggle */}
          {answerStep && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="shrink-0 text-[10px] text-teal-400 hover:text-teal-300
                         px-2 py-1 rounded border border-teal-500/30 transition-colors"
            >
              {expanded ? 'Hide' : 'View'} answer
            </button>
          )}
        </div>

        {/* Status + action row */}
        <div className="flex items-center gap-2">
          {/* Processing status */}
          {status && (
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <svg className="w-3 h-3 shrink-0 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#2a2d3a" strokeWidth="3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke={status.color} strokeWidth="3" strokeLinecap="round" />
              </svg>
              <span className="text-[10px] truncate" style={{ color: status.color }}>
                {status.text}
              </span>
            </div>
          )}

          {/* Spacer when no status */}
          {!status && <div className="flex-1" />}

          {/* Action button */}
          {btnConfig && (
            <button
              onClick={handleAction}
              disabled={btnConfig.disabled}
              className={`shrink-0 text-xs font-semibold py-1.5 px-4 rounded-lg transition-colors
                ${btnConfig.variant === 'pink'
                  ? 'bg-pink-500 hover:bg-pink-600 text-white'
                  : 'bg-teal-500 hover:bg-teal-600 text-white'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {btnConfig.label}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MobileChatDrawer() {
  return (
    <>
      {/* Desktop: render ChatPanel inline as normal */}
      <div className="hidden md:flex md:w-[40%] md:flex-col">
        <ChatPanel />
      </div>

      {/* Mobile: compact bottom bar */}
      <div className="md:hidden">
        <MobileBottomBar />
      </div>
    </>
  )
}
