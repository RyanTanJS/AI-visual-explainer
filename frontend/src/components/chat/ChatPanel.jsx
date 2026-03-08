import { motion, AnimatePresence } from 'framer-motion'
import useSceneStore from '../../stores/sceneStore'
import MessageBubble from './MessageBubble'

// Determine processing status text from current state
function getProcessingStatus(phase, ingestStep, queryEmbedStep, currentScene, reactStepIndex, steps, sceneCompleted) {
  // Scene 1 — ingestion phase
  if (currentScene === 1 && phase === 'ingest') {
    if (!ingestStep) return { text: 'Waiting to build vector database...', color: '#64748b' }
    if (ingestStep === 'card') return { text: 'Reading product document...', color: '#5eead4' }
    if (ingestStep === 'chunk') return { text: 'Chunking text with SentenceSplitter...', color: '#fbbf24' }
    if (ingestStep === 'embed') return { text: 'Generating embedding vector...', color: '#6ee7b7' }
    if (ingestStep === 'place') return { text: 'Storing vector in ChromaDB...', color: '#5eead4' }
  }

  // Scene 1 — query embedding
  if (currentScene === 1 && phase === 'query-embed') {
    if (queryEmbedStep === 'card') return { text: 'Preparing query for embedding...', color: '#f9a8d4' }
    if (queryEmbedStep === 'chunk') return { text: 'Chunking query text...', color: '#fbbf24' }
    if (queryEmbedStep === 'embed') return { text: 'Embedding query into vector space...', color: '#6ee7b7' }
    if (queryEmbedStep === 'place') return { text: 'Placing query vector for similarity search...', color: '#f9a8d4' }
  }

  // Scene 1 — playing (trace replay)
  if (currentScene === 1 && phase === 'playing') {
    const hasObs = steps.some((s) => s.type === 'observation')
    const hasAnswer = steps.some((s) => s.type === 'answer')
    if (hasAnswer) return null
    if (hasObs) return { text: 'Generating response from retrieved documents...', color: '#5eead4' }
    return { text: 'Searching vector database...', color: '#6ee7b7' }
  }

  // Scene 2 — ReAct flowchart
  if (currentScene === 2 && reactStepIndex >= 0 && !sceneCompleted[currentScene]) {
    const traceSteps = steps
    const activeStep = traceSteps[reactStepIndex]
    if (!activeStep) return null
    if (activeStep.type === 'thought') return { text: 'Thinking — planning next step...', color: '#5eead4' }
    if (activeStep.type === 'action' && activeStep.tool === 'rag_search') return { text: 'Calling tool: rag_search()...', color: '#fcd34d' }
    if (activeStep.type === 'action' && activeStep.tool === 'calculator') return { text: 'Calling tool: calculator()...', color: '#fcd34d' }
    if (activeStep.type === 'action') return { text: `Calling tool: ${activeStep.tool}()...`, color: '#fcd34d' }
    if (activeStep.type === 'observation') return { text: 'Reading tool result...', color: '#6ee7b7' }
    if (activeStep.type === 'answer') return { text: 'Composing final answer...', color: '#f9a8d4' }
  }

  // Scene 3 — Multi-agent orchestration
  if (currentScene === 3 && reactStepIndex >= 0 && !sceneCompleted[currentScene]) {
    const traceSteps = steps
    const activeStep = traceSteps[reactStepIndex]
    if (!activeStep) return null
    if (activeStep.type === 'thought') return { text: 'Orchestrator analysing query...', color: '#5eead4' }
    if (activeStep.type === 'routing_decision') return { text: 'Routing to specialised agents...', color: '#2dd4bf' }
    if (activeStep.type === 'edges_activated') return { text: 'Passing context to all agents...', color: '#2dd4bf' }
    if (activeStep.type === 'agent_working') return { text: `${activeStep.agent.replace('_', ' ')} processing...`, color: '#fcd34d' }
    if (activeStep.type === 'agent_output') return { text: `${activeStep.agent.replace('_', ' ')} complete`, color: '#6ee7b7' }
    if (activeStep.type === 'answer') return { text: 'Synthesising final response...', color: '#f9a8d4' }
  }

  return null
}

function ProcessingIndicator({ status }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex justify-start"
    >
      <div className="flex items-center gap-3 bg-[#2a2d3a] rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%]">
        {/* Spinning circle */}
        <svg
          className="w-4 h-4 shrink-0 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12" cy="12" r="10"
            stroke="#2a2d3a"
            strokeWidth="3"
          />
          <path
            d="M12 2a10 10 0 0 1 10 10"
            stroke={status.color}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <span className="text-xs" style={{ color: status.color }}>
          {status.text}
        </span>
      </div>
    </motion.div>
  )
}

export default function ChatPanel() {
  const { trace, steps, isPlaying, play, reset, phase, ingestStep, queryEmbedStep, advanceQueryEmbed, currentScene, reactStepIndex, sceneCompleted } = useSceneStore()

  const query = trace?.query || ''
  const answerStep = steps.find((s) => s.type === 'answer')
  const isQueryEmbed = phase === 'query-embed'
  const isReactMode = currentScene >= 2 && reactStepIndex >= 0

  const processingStatus = getProcessingStatus(phase, ingestStep, queryEmbedStep, currentScene, reactStepIndex, steps, sceneCompleted)

  return (
    <div className="w-full h-full flex flex-col border-r border-[#2a2d3a] bg-[#1a1d27]">
      {/* Chat header */}
      <div className="px-4 py-3 border-b border-[#2a2d3a]">
        <p className="text-sm font-medium text-white">Alex's Conversation</p>
        <p className="text-xs text-[#64748b]">Apex Bank AI Assistant</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {query && <MessageBubble sender="alex" text={query} />}

        {/* Processing indicator */}
        <AnimatePresence mode="wait">
          {processingStatus && !answerStep && (
            <ProcessingIndicator key={processingStatus.text} status={processingStatus} />
          )}
        </AnimatePresence>

        {answerStep && <MessageBubble sender="ai" text={answerStep.content} />}
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-[#2a2d3a] flex gap-2">
        {sceneCompleted[currentScene] ? (
          <div className="flex-1 flex items-center justify-center gap-2 text-emerald-400 text-sm py-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Scene Complete
          </div>
        ) : isQueryEmbed ? (
          <button
            onClick={advanceQueryEmbed}
            className="flex-1 bg-pink-500 hover:bg-pink-600
                       text-white text-sm py-2 px-4 rounded-lg transition-colors"
          >
            {queryEmbedStep === 'card' && 'Next: Chunk query'}
            {queryEmbedStep === 'chunk' && 'Next: Embed query'}
            {queryEmbedStep === 'embed' && 'Next: Place in vector space'}
            {queryEmbedStep === 'place' && 'Start search'}
          </button>
        ) : isReactMode ? (
          <div className="flex-1 text-center text-xs text-[#64748b] py-2">
            Use the flowchart controls to step through &rarr;
          </div>
        ) : (
          <button
            onClick={play}
            disabled={isPlaying || phase === 'ingest'}
            className="flex-1 bg-teal-500 hover:bg-teal-600 disabled:opacity-40
                       text-white text-sm py-2 px-4 rounded-lg transition-colors"
          >
            {isPlaying ? 'Playing...' : 'Play Scene'}
          </button>
        )}
        <button
          onClick={reset}
          className="text-sm text-[#94a3b8] hover:text-white py-2 px-4
                     rounded-lg border border-[#2a2d3a] transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
