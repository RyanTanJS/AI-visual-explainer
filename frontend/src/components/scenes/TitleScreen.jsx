import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Line, Text, Billboard } from '@react-three/drei'

function GridBackground() {
  const axisLength = 2.5
  const axisColor = '#3a3d4a'
  const labelColor = '#64748b'

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />

      <gridHelper args={[6, 12, '#1e2130', '#1e2130']} position={[0, -2.5, 0]} />
      <gridHelper args={[6, 12, '#1e2130', '#1e2130']} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -3]} />

      {/* Axes */}
      <Line points={[[-axisLength, 0, 0], [axisLength, 0, 0]]} color={axisColor} lineWidth={0.5} />
      <Line points={[[0, -axisLength, 0], [0, axisLength, 0]]} color={axisColor} lineWidth={0.5} />
      <Line points={[[0, 0, -axisLength], [0, 0, axisLength]]} color={axisColor} lineWidth={0.5} />

      <Billboard position={[axisLength + 0.15, 0, 0]} renderOrder={999}>
        <Text fontSize={0.06} color={labelColor} renderOrder={999} material-depthTest={false} material-depthWrite={false}>PC1</Text>
      </Billboard>
      <Billboard position={[0, axisLength + 0.15, 0]} renderOrder={999}>
        <Text fontSize={0.06} color={labelColor} renderOrder={999} material-depthTest={false} material-depthWrite={false}>PC2</Text>
      </Billboard>
      <Billboard position={[0, 0, axisLength + 0.15]} renderOrder={999}>
        <Text fontSize={0.06} color={labelColor} renderOrder={999} material-depthTest={false} material-depthWrite={false}>PC3</Text>
      </Billboard>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableRotate={false}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  )
}

const SCENES_PREVIEW = [
  {
    number: 1,
    title: 'RAG & Vector Search',
    desc: 'See how documents are embedded into a 3D vector space and retrieved by semantic similarity — not keyword matching.',
  },
  {
    number: 2,
    title: 'ReAct & Tool Calling',
    desc: 'Watch an AI agent reason step-by-step, calling specialised tools like a calculator and a search engine to build its answer.',
  },
  {
    number: 3,
    title: 'Multi-Agent Orchestration',
    desc: 'Multiple AI agents collaborate — a router delegates to specialists, each with their own memory and tools.',
  },
]

export default function TitleScreen() {
  return (
    <>
      {/* Hero */}
      <section className="h-dvh flex flex-col items-center justify-center relative px-6">
        {/* 3D grid background */}
        <div className="absolute inset-0 opacity-70 pointer-events-none">
          <Canvas camera={{ position: [4.5, 3, 4.5], fov: 35 }}>
            <GridBackground />
          </Canvas>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-xl relative z-10"
        >
          <p className="text-teal-400 text-xs font-semibold uppercase tracking-[0.25em] mb-4">
            Interactive Explainer
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Ask Apex
          </h1>
          <p className="text text-base md:text-lg leading-relaxed mb-2">
            A narrative walkthrough of how modern AI agents work.
          </p>
          <p className="text text-base md:text-lg leading-relaxed mb-2">
            From vector search to multi-agent orchestration.
          </p>
          <p className="text text-sm">
            Follow Chloe as they chat with an AI banking assistant. See what happens under the hood at every step.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 flex flex-col items-center gap-1 z-10"
        >
          <span className="text-[#64748b] text-xs">Scroll to begin</span>
          <svg className="w-4 h-4 text-[#64748b] animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </section>

      {/* What you'll see */}
      <section className="min-h-screen flex items-center justify-center px-4 md:px-8 py-12 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl w-full"
        >
          <p className="text-teal-400 text-xs font-semibold uppercase tracking-widest mb-2">
            The Story
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            What you're about to see
          </h2>
          <p className="text-[#94a3b8] text-sm leading-relaxed mb-8 md:mb-12">
            Chloe is a customer of Apex Bank. They're chatting with the bank's AI assistant to find the right products. Each scene shows a real AI technique — and you'll see exactly how it works under the hood.
          </p>

          <div className="space-y-6 md:space-y-8">
            {SCENES_PREVIEW.map((scene, i) => (
              <motion.div
                key={scene.number}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.4 }}
                className="flex gap-4"
              >
                <div className="shrink-0 w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30
                                flex items-center justify-center text-teal-400 text-sm font-bold">
                  {scene.number}
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm mb-1">{scene.title}</h3>
                  <p className="text-[#94a3b8] text-sm leading-relaxed">{scene.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-10 md:mt-16 pt-6 md:pt-8 border-t border-[#2a2d3a] text-center"
          >
            <p className="text-[#64748b] text-sm mb-3">Let's start with Scene 1: RAG & Vector Search</p>
            <div className="flex justify-center">
              <svg className="w-5 h-5 text-[#64748b] animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </>
  )
}
