import { motion } from 'framer-motion'

const EXPLAINERS = {
  1: {
    title: 'What just happened?',
    subtitle: 'RAG — Retrieval-Augmented Generation',
    points: [
      {
        heading: 'Embedding',
        text: 'Every product document was converted into a 3072-dimensional vector using Google\'s embedding model. These vectors capture the semantic meaning of the text, not just keywords.',
      },
      {
        heading: 'PCA Reduction',
        text: 'To visualise the vectors in 3D, we used Principal Component Analysis (PCA) to compress 3072 dimensions down to just 3 — while preserving the relative distances between points.',
      },
      {
        heading: 'Similarity Search',
        text: 'The user\'s query was embedded into the same vector space. ChromaDB then found the closest product vectors using cosine similarity — that\'s why "2-3 flights a month" matched travel cards, not the literal words.',
      },
      {
        heading: 'Why RAG?',
        text: 'LLMs have a knowledge cutoff and can hallucinate. RAG grounds the response in real, up-to-date data by retrieving relevant documents before generating an answer.',
      },
    ],
    next: 'Next: See how the AI reasons step-by-step with ReAct & Tool Calling',
  },
  2: {
    title: 'What just happened?',
    subtitle: 'ReAct — Reasoning + Acting',
    points: [
      {
        heading: 'Think → Act → Observe Loop',
        text: 'Instead of answering in one shot, the agent follows a loop: it thinks about what it needs, calls a tool to get it, reads the result, and decides whether to loop again or answer. This makes responses more reliable and grounded.',
      },
      {
        heading: 'Tool Calling',
        text: 'The agent delegated work to specialised tools — RAG Search for product data and a Calculator for arithmetic. LLMs are unreliable at maths, so offloading to a deterministic calculator guarantees accuracy.',
      },
      {
        heading: 'Chain of Thought',
        text: 'Each "Thought" step is the agent reasoning out loud. This chain-of-thought prompting helps the model plan multi-step tasks, decide which tool to use, and interpret results before forming a final answer.',
      },
      {
        heading: 'Why ReAct?',
        text: 'Pure chain-of-thought can hallucinate facts. Pure tool use can miss context. ReAct combines both — the agent reasons about when and why to use tools, then grounds its answer in real data. It\'s the pattern behind most production AI agents today.',
      },
    ],
    next: 'Next: See how multiple AI agents collaborate with Multi-Agent Orchestration',
  },
}

export default function SceneExplainer({ sceneId }) {
  const content = EXPLAINERS[sceneId]
  if (!content) return null

  return (
    <section className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4 md:px-8 py-12 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full"
      >
        <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-2">
          {content.subtitle}
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-10">
          {content.title}
        </h2>

        <div className="space-y-5 md:space-y-8">
          {content.points.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.4 }}
              className="flex gap-4"
            >
              <div className="shrink-0 w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30
                              flex items-center justify-center text-indigo-400 text-sm font-bold">
                {i + 1}
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">{point.heading}</h3>
                <p className="text-[#94a3b8] text-sm leading-relaxed">{point.text}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-10 md:mt-16 pt-6 md:pt-8 border-t border-[#2a2d3a] text-center"
        >
          <p className="text-[#64748b] text-sm mb-3">{content.next}</p>
          <div className="flex justify-center">
            <svg className="w-5 h-5 text-[#64748b] animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
