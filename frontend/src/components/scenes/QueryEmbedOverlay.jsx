import { motion, AnimatePresence } from 'framer-motion'
import useSceneStore from '../../stores/sceneStore'

const FAKE_VECTOR = '[0.0412, -0.2091, 0.1184, 0.0334, -0.0770, 0.0567, ..., 0.0188]'
const FAKE_3D = '[0.21, 0.06, 0.01]'

const CHUNK_COLORS = [
  { bg: 'rgba(244, 114, 182, 0.20)', border: 'rgba(244, 114, 182, 0.5)' },  // pink
  { bg: 'rgba(167, 139, 250, 0.20)', border: 'rgba(167, 139, 250, 0.5)' },  // violet
  { bg: 'rgba(34, 211, 238, 0.20)', border: 'rgba(34, 211, 238, 0.5)' },    // cyan
  { bg: 'rgba(251, 191, 36, 0.20)', border: 'rgba(251, 191, 36, 0.5)' },    // amber
  { bg: 'rgba(52, 211, 153, 0.20)', border: 'rgba(52, 211, 153, 0.5)' },    // emerald
]

function splitSentences(text) {
  return (text.match(/[^.!?]+[.!?]+/g) || [text]).map((s) => s.trim())
}

function QueryCard({ query, showChunks }) {
  if (!query) return null

  const sentences = splitSentences(query)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-[#1a1d27] border border-pink-500/30 rounded-lg p-4 mb-3"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rotate-45 bg-pink-500" />
        <span className="text-white font-semibold text-sm">User Query</span>
      </div>

      {showChunks && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 mb-2"
        >
          <div className="w-1 h-4 bg-pink-500 rounded-full" />
          <span className="text-pink-400 text-[10px] font-semibold uppercase tracking-wide">
            Chunking (SentenceSplitter)
          </span>
        </motion.div>
      )}

      <p className="text-[12px] text-[#cbd5e1] leading-relaxed">
        {showChunks
          ? sentences.map((sentence, i) => (
              <motion.span
                key={i}
                initial={{ backgroundColor: 'transparent' }}
                animate={{ backgroundColor: CHUNK_COLORS[i % CHUNK_COLORS.length].bg }}
                transition={{ delay: i * 0.3, duration: 0.4 }}
                style={{
                  borderBottom: `2px solid ${CHUNK_COLORS[i % CHUNK_COLORS.length].border}`,
                  borderRadius: '2px',
                  padding: '1px 0',
                }}
              >
                {sentence}{' '}
              </motion.span>
            ))
          : `"${query}"`}
      </p>

      {showChunks && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: sentences.length * 0.3 + 0.2 }}
          className="mt-2 text-[9px] text-[#64748b]"
        >
          {sentences.length === 1 ? '1 chunk (short query)' : `${sentences.length} chunks`}
        </motion.div>
      )}
    </motion.div>
  )
}

function EmbeddingView() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-2 mb-3"
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1 h-4 bg-emerald-500 rounded-full" />
        <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wide">
          Embedding (text-embedding-3072)
        </span>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-emerald-500/5 border border-emerald-500/20 rounded p-2"
      >
        <p className="text-[10px] text-emerald-400/60 mb-1">3072-dim vector:</p>
        <p className="text-[11px] text-emerald-300 font-mono break-all">{FAKE_VECTOR}</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-2"
      >
        <span className="text-[#64748b] text-[10px]">PCA 3072 → 3</span>
        <span className="text-[#64748b]">→</span>
        <span className="text-emerald-300 font-mono text-[11px]">{FAKE_3D}</span>
      </motion.div>
    </motion.div>
  )
}

function PlaceView() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-3 mb-3 text-center"
    >
      <p className="text-pink-300 text-xs">
        Query vector placed in 3D space — ready for similarity search
      </p>
    </motion.div>
  )
}

export default function QueryEmbedOverlay() {
  const phase = useSceneStore((s) => s.phase)
  const queryEmbedStep = useSceneStore((s) => s.queryEmbedStep)
  const trace = useSceneStore((s) => s.trace)

  if (phase !== 'query-embed' || !queryEmbedStep) return null

  const query = trace?.query || ''

  return (
    <div className="absolute top-0 left-0 h-full z-10 flex flex-col p-3 md:p-4 overflow-y-auto
                    bg-gradient-to-r from-[#0f1117] via-[#0f1117]/95 to-transparent"
         style={{ width: 'min(90%, 340px)' }}>
      <div className="mb-4">
        <h3 className="text-white text-sm font-semibold mb-1">
          Step 2: Embedding the Query
        </h3>
        <p className="text-[#64748b] text-xs leading-relaxed">
          The user's question goes through the same embedding process so it can
          be compared to the stored product vectors.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        <QueryCard
          query={query}
          showChunks={['chunk', 'embed', 'place'].includes(queryEmbedStep)}
        />
        {['embed', 'place'].includes(queryEmbedStep) && <EmbeddingView />}
        {queryEmbedStep === 'place' && <PlaceView />}
      </div>
    </div>
  )
}
