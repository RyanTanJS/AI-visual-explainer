import { motion, AnimatePresence } from 'framer-motion'
import useSceneStore from '../../stores/sceneStore'
import productsData from '../../data/products.json'

// Index products by ID for quick lookup
const PRODUCTS_MAP = Object.fromEntries(productsData.map((p) => [p.product_id, p]))

// Fake embedding numbers for visual effect
const FAKE_VECTOR = '[0.0234, -0.1891, 0.0412, 0.2184, 0.0970, 0.0167, ..., -0.0088]'
const FAKE_3D = '[0.21, 0.10, 0.02]'

// Chunk highlight colors — distinct enough to tell apart on dark background
const CHUNK_COLORS = [
  { bg: 'rgba(251, 191, 36, 0.20)', border: 'rgba(251, 191, 36, 0.5)' },  // amber
  { bg: 'rgba(52, 211, 153, 0.20)', border: 'rgba(52, 211, 153, 0.5)' },   // emerald
  { bg: 'rgba(129, 140, 248, 0.20)', border: 'rgba(129, 140, 248, 0.5)' }, // indigo
  { bg: 'rgba(244, 114, 182, 0.20)', border: 'rgba(244, 114, 182, 0.5)' }, // pink
  { bg: 'rgba(34, 211, 238, 0.20)', border: 'rgba(34, 211, 238, 0.5)' },   // cyan
  { bg: 'rgba(167, 139, 250, 0.20)', border: 'rgba(167, 139, 250, 0.5)' }, // violet
]

// Split description into sentence chunks for highlight mapping
function splitSentences(text) {
  return (text.match(/[^.!?]+[.!?]+/g) || [text]).map((s) => s.trim())
}

function ProductCard({ product, showChunks }) {
  if (!product) return null

  const sentences = splitSentences(product.description)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-[#1a1d27] border border-[#2a2d3a] rounded-lg p-4 mb-3"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-indigo-400" />
        <span className="text-white font-semibold text-sm">{product.product_name}</span>
      </div>

      {showChunks && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 mb-2"
        >
          <div className="w-1 h-4 bg-amber-500 rounded-full" />
          <span className="text-amber-400 text-[10px] font-semibold uppercase tracking-wide">
            Chunking (SentenceSplitter)
          </span>
        </motion.div>
      )}

      <div className="text-[11px] text-[#94a3b8] space-y-1">
        <p>{product.category} / {product.subcategory} / {`£${product.annual_fee}/yr`}</p>
        <p className="leading-relaxed">
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
            : product.description}
        </p>
        {product.benefits?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {product.benefits.map((b) => {
              const chunkIdx = sentences.length // benefits are the last "chunk"
              return (
                <motion.span
                  key={b}
                  initial={showChunks ? { backgroundColor: 'transparent' } : false}
                  animate={showChunks ? { backgroundColor: CHUNK_COLORS[chunkIdx % CHUNK_COLORS.length].bg } : {}}
                  transition={showChunks ? { delay: chunkIdx * 0.3, duration: 0.4 } : {}}
                  className="text-indigo-300 px-1.5 py-0.5 rounded text-[10px]"
                  style={showChunks ? {
                    borderBottom: `2px solid ${CHUNK_COLORS[chunkIdx % CHUNK_COLORS.length].border}`,
                  } : { backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                >
                  {b}
                </motion.span>
              )
            })}
          </div>
        )}
      </div>

      {/* Chunk legend */}
      {showChunks && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: sentences.length * 0.3 + 0.3 }}
          className="mt-3 pt-2 border-t border-[#2a2d3a] flex flex-wrap gap-2"
        >
          {sentences.map((_, i) => (
            <span key={i} className="text-[9px] text-[#64748b] flex items-center gap-1">
              <span
                className="inline-block w-2 h-2 rounded-sm"
                style={{ backgroundColor: CHUNK_COLORS[i % CHUNK_COLORS.length].border }}
              />
              chunk_{i}
            </span>
          ))}
          <span className="text-[9px] text-[#64748b] flex items-center gap-1">
            <span
              className="inline-block w-2 h-2 rounded-sm"
              style={{ backgroundColor: CHUNK_COLORS[sentences.length % CHUNK_COLORS.length].border }}
            />
            chunk_{sentences.length} (benefits)
          </span>
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
      className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3 mb-3 text-center"
    >
      <p className="text-indigo-300 text-xs">
        Vector stored in ChromaDB and placed in 3D space
      </p>
    </motion.div>
  )
}

const STEP_LABELS = {
  card: 'Next: Chunk text',
  chunk: 'Next: Generate embedding',
  embed: 'Next: Store vector',
  place: 'Done — store next product',
}

export default function IngestionOverlay() {
  const phase = useSceneStore((s) => s.phase)
  const ingestStep = useSceneStore((s) => s.ingestStep)
  const ingestingProductId = useSceneStore((s) => s.ingestingProductId)
  const ingestProductIndex = useSceneStore((s) => s.ingestProductIndex)
  const visibleVectorIds = useSceneStore((s) => s.visibleVectorIds)
  const storeOne = useSceneStore((s) => s.storeOne)
  const advanceIngest = useSceneStore((s) => s.advanceIngest)
  const storeAll = useSceneStore((s) => s.storeAll)
  const trace = useSceneStore((s) => s.trace)

  if (phase !== 'ingest') return null

  const isAnimating = ingestingProductId != null
  const storedCount = visibleVectorIds.size
  const totalProducts = trace?.all_vectors?.length || 20
  const allStored = storedCount >= totalProducts

  // Get current product info
  const currentProduct = ingestingProductId ? PRODUCTS_MAP[ingestingProductId] : null

  // Next product to store (for the button label)
  const nextVec = trace?.all_vectors?.[ingestProductIndex]
  const nextProduct = nextVec ? PRODUCTS_MAP[nextVec.product_id] : null

  return (
    <div className="absolute top-0 left-0 w-[340px] h-full z-10 flex flex-col p-4 overflow-y-auto
                    bg-gradient-to-r from-[#0f1117] via-[#0f1117]/95 to-transparent">
      <div className="mb-4">
        <h3 className="text-white text-sm font-semibold mb-1">
          Step 1: Building the Vector Database
        </h3>
        <p className="text-[#64748b] text-xs leading-relaxed">
          Before the AI can search, every product must be converted into a vector
          (a list of numbers) and stored. Watch how it works:
        </p>
      </div>

      {/* Animation steps */}
      <AnimatePresence mode="wait">
        {ingestStep && currentProduct && (
          <div key={`ingest-${ingestingProductId}`} className="flex-1 overflow-y-auto pr-1">
            <ProductCard
              product={currentProduct}
              showChunks={['chunk', 'embed', 'place'].includes(ingestStep)}
            />
            {['embed', 'place'].includes(ingestStep) && <EmbeddingView />}
            {ingestStep === 'place' && <PlaceView />}
          </div>
        )}
      </AnimatePresence>

      {/* Status */}
      {storedCount > 0 && !isAnimating && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[#64748b] text-xs mb-3"
        >
          {storedCount} / {totalProducts} products stored
        </motion.p>
      )}

      {/* Action buttons */}
      <div className="mt-auto pt-3 border-t border-[#2a2d3a] space-y-2">
        {/* Next / Store 1 button */}
        {isAnimating ? (
          <button
            onClick={advanceIngest}
            className="w-full py-2 px-3 rounded-lg text-xs font-semibold
                       bg-indigo-500/20 text-indigo-300 border border-indigo-500/30
                       hover:bg-indigo-500/30 transition-colors"
          >
            {STEP_LABELS[ingestStep] || 'Next'}
          </button>
        ) : (
          <button
            onClick={storeOne}
            disabled={allStored}
            className="w-full py-2 px-3 rounded-lg text-xs font-semibold
                       bg-indigo-500/20 text-indigo-300 border border-indigo-500/30
                       hover:bg-indigo-500/30 transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {allStored
              ? 'All products stored'
              : nextProduct
                ? `Store: ${nextProduct.product_name}`
                : 'Store 1 Product'}
          </button>
        )}
        <button
          onClick={storeAll}
          disabled={isAnimating || allStored}
          className="w-full py-2 px-3 rounded-lg text-xs font-semibold
                     bg-emerald-500/20 text-emerald-300 border border-emerald-500/30
                     hover:bg-emerald-500/30 transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Store All Products
        </button>
      </div>
    </div>
  )
}
