import { useMemo, useState, useEffect, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Handle,
  Position,
  getBezierPath,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { motion, AnimatePresence } from 'framer-motion'
import useSceneStore from '../../stores/sceneStore'

// ── Agent colour config ────────────────────────────────────────
const AGENT_COLORS = {
  orchestrator: { bg: '#14b8a6', border: '#2dd4bf', text: '#99f6e4', glow: '#14b8a640' },
  product_agent: { bg: '#f59e0b', border: '#fbbf24', text: '#fef3c7', glow: '#f59e0b40' },
  eligibility_agent: { bg: '#3b82f6', border: '#60a5fa', text: '#dbeafe', glow: '#3b82f640' },
  recommendation_agent: { bg: '#ec4899', border: '#f472b6', text: '#fce7f3', glow: '#ec489940' },
  synthesiser: { bg: '#8b5cf6', border: '#a78bfa', text: '#ddd6fe', glow: '#8b5cf640' },
}

const AGENT_LABELS = {
  orchestrator: 'Orchestrator',
  product_agent: 'Product Agent',
  eligibility_agent: 'Eligibility Agent',
  recommendation_agent: 'Recommend Agent',
  synthesiser: 'Synthesiser',
}

// Node widths — responsive
function getNodeW(isMobile) {
  return isMobile
    ? { orchestrator: 150, agent: 180, synthesiser: 150 }
    : { orchestrator: 180, agent: 220, synthesiser: 180 }
}

// ── Animated edge with traveling pulse ─────────────────────────
function AnimatedEdge({
  id,
  sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  data,
}) {
  const { color, isActivated, isNew, isFlowing } = data || {}
  const pathRef = useRef(null)
  const [pathLength, setPathLength] = useState(0)

  const [edgePath] = getBezierPath({
    sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition,
  })

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength())
    }
  }, [edgePath])

  if (!isActivated) {
    // Inactive edge — dim line
    return (
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke="#2a2d3a"
        strokeWidth={1}
        opacity={0.3}
      />
    )
  }

  const drawDuration = '0.8s'

  return (
    <g>
      {/* Inject keyframes scoped to this edge */}
      {pathLength > 0 && (
        <style>{`
          @keyframes draw-on-${id} {
            from { stroke-dashoffset: ${pathLength}; }
            to   { stroke-dashoffset: 0; }
          }
          @keyframes pulse-flow-${id} {
            from { stroke-dashoffset: 0; }
            to   { stroke-dashoffset: -${pathLength}; }
          }
        `}</style>
      )}

      {/* Base glow layer — draws on left-to-right when new */}
      <path
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={4}
        opacity={0.15}
        filter="url(#edge-glow)"
        strokeDasharray={isNew && pathLength > 0 ? pathLength : 'none'}
        strokeDashoffset={0}
        style={isNew && pathLength > 0 ? {
          animation: `draw-on-${id} ${drawDuration} ease-out forwards`,
        } : undefined}
      />

      {/* Solid base line — draws on left-to-right when new */}
      <path
        ref={pathRef}
        id={id}
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        opacity={0.6}
        strokeDasharray={isNew && pathLength > 0 ? pathLength : 'none'}
        strokeDashoffset={0}
        style={isNew && pathLength > 0 ? {
          animation: `draw-on-${id} ${drawDuration} ease-out forwards`,
        } : undefined}
      />

      {/* Traveling pulse + dot — only while this edge is the active step */}
      {pathLength > 0 && isFlowing && (
        <>
          <path
            d={edgePath}
            fill="none"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeDasharray={`${pathLength * 0.25} ${pathLength * 0.75}`}
            opacity={isNew ? 0 : 0.9}
            style={{
              animation: isNew
                ? `draw-on-${id} ${drawDuration} ease-out forwards, pulse-flow-${id} 2s linear ${drawDuration} infinite`
                : `pulse-flow-${id} 2s linear infinite`,
              ...(isNew ? {} : { opacity: 0.9 }),
            }}
          />
          <circle r={3} fill={color} opacity={0.9}>
            <animateMotion
              dur={isNew ? drawDuration : '2s'}
              repeatCount={isNew ? '1' : 'indefinite'}
              path={edgePath}
            />
          </circle>
        </>
      )}
    </g>
  )
}

const edgeTypes = { animated: AnimatedEdge }

// ── Hexagon node component ─────────────────────────────────────
function HexagonNode({ data }) {
  const { agent, status, result, memory, isActive, isComplete, isMobile } = data
  const colors = AGENT_COLORS[agent] || AGENT_COLORS.orchestrator
  const isBookend = agent === 'orchestrator' || agent === 'synthesiser'
  const NODE_W = getNodeW(isMobile)
  const width = isBookend ? NODE_W.orchestrator : NODE_W.agent

  return (
    <div style={{ width }}>
      {/* Incoming handle */}
      {agent !== 'orchestrator' && (
        <Handle type="target" position={Position.Left} className="!bg-transparent !border-0 !w-3 !h-3" />
      )}

      {/* Card */}
      <motion.div
        animate={{
          boxShadow: isActive ? `0 0 20px ${colors.glow}` : '0 0 0px transparent',
          borderColor: isActive ? colors.border : isComplete ? `${colors.bg}60` : '#2a2d3a',
        }}
        transition={{ duration: 0.4 }}
        className="rounded-xl overflow-hidden"
        style={{
          background: '#1a1d27',
          border: `1.5px solid ${isComplete ? `${colors.bg}60` : '#2a2d3a'}`,
        }}
      >
        {/* Header */}
        <div
          className={`flex items-center gap-1.5 ${isMobile ? 'px-2 py-1.5' : 'px-3 py-2 gap-2'}`}
          style={{
            background: isActive || isComplete ? `${colors.bg}15` : 'transparent',
            borderBottom: `1px solid ${isActive ? `${colors.bg}30` : '#2a2d3a'}`,
          }}
        >
          {/* Hexagon icon */}
          <svg width={isMobile ? 10 : 14} height={isMobile ? 10 : 14} viewBox="0 0 24 24" className="shrink-0">
            <polygon
              points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5"
              fill={isActive || isComplete ? colors.bg : '#2a2d3a'}
              stroke={isActive ? colors.border : 'none'}
              strokeWidth="1"
            />
          </svg>
          <span
            className={`font-semibold uppercase tracking-wider truncate ${isMobile ? 'text-[9px]' : 'text-[10px]'}`}
            style={{ color: isActive || isComplete ? colors.text : '#64748b' }}
          >
            {AGENT_LABELS[agent]}
          </span>
          {isActive && (
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 rounded-full ml-auto shrink-0"
              style={{ background: colors.border }}
            />
          )}
          {isComplete && !isActive && (
            <span className="ml-auto text-[10px] shrink-0" style={{ color: colors.border }}>&#10003;</span>
          )}
        </div>

        {/* Body */}
        <AnimatePresence mode="wait">
          {(status || result || memory) && (
            <motion.div
              key={`${status}-${result ? 'r' : 's'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={isMobile ? 'px-2 py-1 space-y-0.5' : 'px-3 py-2 space-y-1.5'}
            >
              {status && !result && (
                <p className={`m-0 ${isMobile ? 'text-[9px]' : 'text-[10px] line-clamp-2'}`} style={{ color: colors.text }}>
                  {status}
                </p>
              )}
              {result && (
                <p className={`leading-relaxed text-[#cbd5e1] m-0 ${isMobile ? 'text-[9px]' : 'text-[10px] line-clamp-3'}`}>
                  {result}
                </p>
              )}
              {!isMobile && memory && (
                <div className="space-y-0.5 pt-1 border-t border-[#ffffff10]">
                  <p className="text-[8px] uppercase tracking-wider text-[#64748b] font-semibold m-0">Memory</p>
                  {memory.short_term && (
                    <div className="flex gap-1 text-[9px]">
                      <span className="text-[#f59e0b] shrink-0">ST</span>
                      <span className="text-[#94a3b8] truncate">{memory.short_term}</span>
                    </div>
                  )}
                  {memory.long_term && (
                    <div className="flex gap-1 text-[9px]">
                      <span className="text-[#10b981] shrink-0">LT</span>
                      <span className="text-[#94a3b8] truncate">{memory.long_term}</span>
                    </div>
                  )}
                  {memory.episodic && (
                    <div className="flex gap-1 text-[9px]">
                      <span className="text-[#8b5cf6] shrink-0">EP</span>
                      <span className="text-[#94a3b8] truncate">{memory.episodic}</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Outgoing handle */}
      {agent !== 'synthesiser' && (
        <Handle type="source" position={Position.Right} className="!bg-transparent !border-0 !w-3 !h-3" />
      )}
    </div>
  )
}

const nodeTypes = { hexagon: HexagonNode }

// ── Layout positions ───────────────────────────────────────────
function getLayout(isMobile) {
  if (isMobile) {
    return {
      orchestrator:          { x: 0, y: 160 },
      product_agent:         { x: 220, y: 0 },
      eligibility_agent:     { x: 220, y: 160 },
      recommendation_agent:  { x: 220, y: 350 },
      synthesiser:           { x: 460, y: 160 },
    }
  }
  return {
    orchestrator:          { x: 0, y: 200 },
    product_agent:         { x: 300, y: 0 },
    eligibility_agent:     { x: 300, y: 200 },
    recommendation_agent:  { x: 300, y: 420 },
    synthesiser:           { x: 640, y: 200 },
  }
}

// ── Build nodes & edges from trace state ──────────────────────
function buildGraph(trace, stepIndex, visibleSteps, isMobile) {
  if (!trace) return { nodes: [], edges: [] }
  const LAYOUT = getLayout(isMobile)

  const agentStates = {}

  // Track which edges are activated and which were just activated this step
  const activatedEdges = new Set()
  const newEdges = new Set()

  for (let i = 0; i < visibleSteps.length; i++) {
    const step = visibleSteps[i]
    const isCurrentStep = i === visibleSteps.length - 1

    if (step.type === 'thought' && step.agent === 'orchestrator') {
      agentStates.orchestrator = { status: step.content, isActive: true }
    }
    if (step.type === 'routing_decision') {
      agentStates.orchestrator = { status: 'Routing to agents...', isComplete: true, isActive: false }
    }
    if (step.type === 'edges_activated') {
      for (const edge of step.edges) {
        activatedEdges.add(edge)
        if (isCurrentStep) newEdges.add(edge)
      }
    }
    if (step.type === 'agent_working' && step.agent !== 'synthesiser') {
      agentStates[step.agent] = {
        status: step.status,
        memory: step.memory,
        isActive: true,
      }
      if (agentStates.orchestrator) {
        agentStates.orchestrator.isComplete = true
        agentStates.orchestrator.isActive = false
      }
    }
    if (step.type === 'agent_output') {
      agentStates[step.agent] = {
        ...agentStates[step.agent],
        result: step.result,
        isActive: false,
        isComplete: true,
      }
    }
    if (step.type === 'agent_working' && step.agent === 'synthesiser') {
      agentStates.synthesiser = { status: step.status, isActive: true }
    }
    if (step.type === 'answer') {
      if (agentStates.synthesiser) {
        agentStates.synthesiser.isComplete = true
        agentStates.synthesiser.isActive = false
      }
    }
  }

  const allAgents = ['orchestrator', 'product_agent', 'eligibility_agent', 'recommendation_agent', 'synthesiser']

  const nodes = allAgents.map((agent) => ({
    id: agent,
    type: 'hexagon',
    position: LAYOUT[agent],
    data: {
      agent,
      isMobile,
      status: agentStates[agent]?.status || null,
      result: agentStates[agent]?.result || null,
      memory: agentStates[agent]?.memory || null,
      isActive: agentStates[agent]?.isActive || false,
      isComplete: agentStates[agent]?.isComplete || false,
    },
  }))

  const edgeDefs = [
    { id: 'e-orch-prod', source: 'orchestrator', target: 'product_agent', traceId: 'orchestrator-product_agent' },
    { id: 'e-orch-elig', source: 'orchestrator', target: 'eligibility_agent', traceId: 'orchestrator-eligibility_agent' },
    { id: 'e-orch-rec', source: 'orchestrator', target: 'recommendation_agent', traceId: 'orchestrator-recommendation_agent' },
    { id: 'e-prod-synth', source: 'product_agent', target: 'synthesiser', traceId: 'product_agent-synthesiser' },
    { id: 'e-elig-synth', source: 'eligibility_agent', target: 'synthesiser', traceId: 'eligibility_agent-synthesiser' },
    { id: 'e-rec-synth', source: 'recommendation_agent', target: 'synthesiser', traceId: 'recommendation_agent-synthesiser' },
  ]

  const edges = edgeDefs.map((e) => {
    const isActivated = activatedEdges.has(e.traceId)
    const isNew = newEdges.has(e.traceId)
    const sourceColor = AGENT_COLORS[e.source]?.bg || '#14b8a6'

    return {
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'animated',
      data: {
        color: sourceColor,
        isActivated,
        isNew,
        isFlowing: isNew, // only animate pulse/dot on the step they first appear
      },
    }
  })

  return { nodes, edges }
}

// ── Explainer content ─────────────────────────────────────────
const STEP_EXPLAINERS = {
  thought: {
    title: 'Orchestrator Thinking',
    content: 'The orchestrator analyses the query to identify distinct intents. Each intent maps to a specialised agent.',
  },
  routing_decision: {
    title: 'Parallel Routing',
    content: 'Routes to multiple agents simultaneously. Parallel execution means all three agents work at the same time.',
  },
  edges_activated: {
    title: 'Context Passing',
    content: 'The orchestrator sends context to all agents in parallel. Watch the data flow along each connection simultaneously.',
  },
  agent_working: {
    title: 'Agent Processing',
    content: 'Each agent has its own memory (short-term, long-term, episodic) and works independently on its sub-task.',
  },
  agent_output: {
    title: 'Agent Complete',
    content: 'The agent produced its result. Once all agents complete, their outputs converge at the synthesiser.',
  },
  synthesiser_working: {
    title: 'Synthesising Results',
    content: 'Combines outputs from all agents into a single coherent response addressing every part of the query.',
  },
  answer: {
    title: 'Final Response',
    content: 'All agent outputs synthesised into one answer covering mortgage options, eligibility, and recommendations.',
  },
}

// ── Main component ────────────────────────────────────────────
export default function MultiAgentGraph() {
  const trace = useSceneStore((s) => s.trace)
  const reactStepIndex = useSceneStore((s) => s.reactStepIndex)
  const advanceReact = useSceneStore((s) => s.advanceReact)
  const sceneCompleted = useSceneStore((s) => s.sceneCompleted)
  const currentScene = useSceneStore((s) => s.currentScene)

  const traceSteps = trace?.steps || []
  const isStarted = reactStepIndex >= 0
  const isDone = sceneCompleted[currentScene]

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth < 768
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const visibleSteps = traceSteps.slice(0, reactStepIndex + 1)
  const activeStep = isStarted ? traceSteps[reactStepIndex] : null

  const getExplainerKey = (step) => {
    if (!step) return null
    if (step.type === 'agent_working' && step.agent === 'synthesiser') return 'synthesiser_working'
    return step.type
  }
  const explainer = activeStep ? STEP_EXPLAINERS[getExplainerKey(activeStep)] : null

  const { nodes, edges } = useMemo(
    () => buildGraph(trace, reactStepIndex, visibleSteps, isMobile),
    [trace, reactStepIndex, visibleSteps.length, isMobile]
  )

  // Button label
  let buttonLabel = 'Next Step'
  if (reactStepIndex >= 0 && reactStepIndex < traceSteps.length - 1) {
    const nextStep = traceSteps[reactStepIndex + 1]
    if (nextStep.type === 'thought') buttonLabel = 'Next: Orchestrator Thinks'
    else if (nextStep.type === 'routing_decision') buttonLabel = 'Next: Route to Agents'
    else if (nextStep.type === 'edges_activated') buttonLabel = 'Next: Send Context'
    else if (nextStep.type === 'agent_working') buttonLabel = `Next: ${AGENT_LABELS[nextStep.agent] || 'Agent'} Works`
    else if (nextStep.type === 'agent_output') buttonLabel = `Next: ${AGENT_LABELS[nextStep.agent] || 'Agent'} Output`
    else if (nextStep.type === 'answer') buttonLabel = 'Next: Final Answer'
  } else if (reactStepIndex >= traceSteps.length - 1 && !isDone) {
    buttonLabel = 'Complete'
  }

  if (!isStarted) {
    return (
      <div className="w-full h-full flex items-center justify-center text-[#64748b] text-sm">
        Press "Play Scene" to start the multi-agent orchestration
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* React Flow graph */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: isMobile ? 0.15 : 0.2 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={isMobile}
          zoomOnDoubleClick={false}
          minZoom={0.3}
          maxZoom={2}
          translateExtent={[[-200, -200], [900, 700]]}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#1e2130" gap={20} size={1} />
          {/* SVG filter for edge glow */}
          <svg style={{ position: 'absolute', width: 0, height: 0 }}>
            <defs>
              <filter id="edge-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          </svg>
        </ReactFlow>

        {/* Explainer overlay */}
        <AnimatePresence mode="wait">
          {explainer && (
            <motion.div
              key={getExplainerKey(activeStep)}
              initial={{ opacity: 0, y: isMobile ? -10 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: isMobile ? -10 : -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-3 right-3 md:top-auto md:bottom-4 md:right-4 w-56 md:w-64 rounded-xl overflow-hidden z-10"
              style={{
                background: 'rgba(26, 29, 39, 0.95)',
                border: '1px solid #2a2d3a',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div className="px-3 py-1.5 md:py-2 border-b border-[#2a2d3a]">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748b] m-0">
                  What's Happening
                </p>
              </div>
              <div className="px-3 py-2 md:py-2.5">
                <h4 className="text-[11px] font-semibold text-white m-0 mb-1">{explainer.title}</h4>
                <p className="text-[10px] leading-relaxed text-[#94a3b8] m-0">{explainer.content}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
