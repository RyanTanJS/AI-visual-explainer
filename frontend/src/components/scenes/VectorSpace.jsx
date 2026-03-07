import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text, Billboard, Line, Edges } from '@react-three/drei'
import { useMemo, useRef, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useSceneStore from '../../stores/sceneStore'
import IngestionOverlay from './IngestionOverlay'
import QueryEmbedOverlay from './QueryEmbedOverlay'

// Shape per subcategory — different shapes within each category to show sub-clusters
const SUBCATEGORY_SHAPES = {
  // Credit Card
  'Travel': 'sphere',
  'Cashback': 'octahedron',
  'Balance Transfer': 'box',
  // Mortgage
  'First-Time Buyer': 'sphere',
  'Buy-to-Let': 'octahedron',
  'Remortgage': 'box',
  'Green': 'cylinder',
  // Personal Loan
  'Standard': 'sphere',
  'Debt Consolidation': 'octahedron',
  'Car Finance': 'box',
  // Savings
  'ISA': 'sphere',
  'Fixed Rate': 'octahedron',
  'Investment ISA': 'box',
  'Junior ISA': 'cylinder',
  'Wealth Management': 'cone',
}

const SUBCATEGORY_COLORS = {
  // Credit Card
  'Travel': '#818cf8',
  'Cashback': '#a78bfa',
  'Balance Transfer': '#c4b5fd',
  // Mortgage
  'First-Time Buyer': '#fbbf24',
  'Buy-to-Let': '#f59e0b',
  'Remortgage': '#d97706',
  'Green': '#84cc16',
  // Personal Loan
  'Standard': '#34d399',
  'Debt Consolidation': '#10b981',
  'Car Finance': '#059669',
  // Savings
  'ISA': '#22d3ee',
  'Fixed Rate': '#06b6d4',
  'Investment ISA': '#0891b2',
  'Junior ISA': '#67e8f9',
  'Wealth Management': '#0ea5e9',
}

// Fallback: category-level colors for legend grouping
const CATEGORY_COLORS = {
  'Credit Card': '#6366f1',
  'Mortgage': '#f59e0b',
  'Personal Loan': '#22c55e',
  'Savings': '#06b6d4',
}

const SCALE = 8 // scale up the PCA coords for visibility

function ShapeGeometry({ shape, size }) {
  switch (shape) {
    case 'box':
      return <boxGeometry args={[size * 1.4, size * 1.4, size * 1.4]} />
    case 'octahedron':
      return <octahedronGeometry args={[size * 1.2]} />
    case 'cylinder':
      return <cylinderGeometry args={[size, size, size * 1.6, 16]} />
    case 'cone':
      return <coneGeometry args={[size, size * 2, 16]} />
    default:
      return <sphereGeometry args={[size, 16, 16]} />
  }
}

function ProductSphere({ point, isMatched, matchScore, hasSearched, onHover, onUnhover }) {
  const color = SUBCATEGORY_COLORS[point.subcategory] || CATEGORY_COLORS[point.category] || '#94a3b8'
  const shape = SUBCATEGORY_SHAPES[point.subcategory] || 'sphere'
  const timerRef = useRef(null)
  const pointerPos = useRef({ x: 0, y: 0 })

  const handlePointerOver = useCallback((e) => {
    e.stopPropagation()
    pointerPos.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY }
    timerRef.current = setTimeout(() => {
      onHover({ point, matchScore, ...pointerPos.current })
    }, 600)
  }, [point, matchScore, onHover])

  const handlePointerOut = useCallback(() => {
    clearTimeout(timerRef.current)
    onUnhover()
  }, [onUnhover])

  // Before search: all bright. After search: matched stay bright, rest fade out.
  const bright = !hasSearched || isMatched
  const size = isMatched ? 0.12 : 0.06

  return (
    <group position={[point.x * SCALE, point.y * SCALE, point.z * SCALE]}>
      <mesh onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
        <ShapeGeometry shape={shape} size={size} />
        <meshStandardMaterial
          color={color}
          emissive={bright ? color : '#000'}
          emissiveIntensity={bright ? 0.6 : 0}
          transparent
          opacity={bright ? 1 : 0.4}
        />
        <Edges threshold={15} color="#5a5858" lineWidth={0.5} />
      </mesh>
    </group>
  )
}

function QueryVector({ point }) {
  return (
    <group position={[point.x * SCALE, point.y * SCALE, point.z * SCALE]}>
      <mesh rotation={[Math.PI / 4, 0, Math.PI / 4]}>
        <octahedronGeometry args={[0.1]} />
        <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.6} />
      </mesh>
      <Billboard position={[0, 0.2, 0]} renderOrder={999}>
        <Text
          fontSize={0.07}
          color="#ec4899"
          anchorX="center"
          renderOrder={999}
          material-depthTest={false}
          material-depthWrite={false}
        >
          Query
        </Text>
      </Billboard>
    </group>
  )
}

function SimilarityLine({ from, to }) {
  const points = useMemo(
    () => [
      [from.x * SCALE, from.y * SCALE, from.z * SCALE],
      [to.x * SCALE, to.y * SCALE, to.z * SCALE],
    ],
    [from, to]
  )

  return (
    <Line
      points={points}
      color="#ec4899"
      lineWidth={3}
      transparent
      opacity={0.9}
      dashed
      dashSize={0.05}
      gapSize={0.03}
    />
  )
}

function Axes() {
  const axisLength = 2.5
  const axisColor = '#3a3d4a'
  const labelColor = '#64748b'

  return (
    <group>
      {/* X axis */}
      <Line points={[[-axisLength, 0, 0], [axisLength, 0, 0]]} color={axisColor} lineWidth={0.5} />
      {/* Y axis */}
      <Line points={[[0, -axisLength, 0], [0, axisLength, 0]]} color={axisColor} lineWidth={0.5} />
      {/* Z axis */}
      <Line points={[[0, 0, -axisLength], [0, 0, axisLength]]} color={axisColor} lineWidth={0.5} />

      {/* Axis labels */}
      <Billboard position={[axisLength + 0.15, 0, 0]} renderOrder={999}>
        <Text fontSize={0.06} color={labelColor} renderOrder={999} material-depthTest={false} material-depthWrite={false}>PC1</Text>
      </Billboard>
      <Billboard position={[0, axisLength + 0.15, 0]} renderOrder={999}>
        <Text fontSize={0.06} color={labelColor} renderOrder={999} material-depthTest={false} material-depthWrite={false}>PC2</Text>
      </Billboard>
      <Billboard position={[0, 0, axisLength + 0.15]} renderOrder={999}>
        <Text fontSize={0.06} color={labelColor} renderOrder={999} material-depthTest={false} material-depthWrite={false}>PC3</Text>
      </Billboard>
    </group>
  )
}

function CategoryLabels({ allVectors }) {
  const centroids = useMemo(() => {
    const groups = {}
    for (const pt of allVectors) {
      if (!groups[pt.category]) groups[pt.category] = { xs: [], ys: [], zs: [] }
      groups[pt.category].xs.push(pt.x * SCALE)
      groups[pt.category].ys.push(pt.y * SCALE)
      groups[pt.category].zs.push(pt.z * SCALE)
    }
    return Object.entries(groups).map(([cat, { xs, ys, zs }]) => ({
      category: cat,
      x: xs.reduce((a, b) => a + b, 0) / xs.length,
      y: ys.reduce((a, b) => a + b, 0) / ys.length - 0.25,
      z: zs.reduce((a, b) => a + b, 0) / zs.length,
    }))
  }, [allVectors])

  return (
    <>
      {centroids.map((c) => (
        <Billboard key={c.category} position={[c.x, c.y, c.z]} renderOrder={999}>
          <Text
            fontSize={0.09}
            color={CATEGORY_COLORS[c.category] || '#94a3b8'}
            anchorX="center"
            anchorY="top"
            renderOrder={999}
            depthTest={false}
            depthWrite={false}
            fillOpacity={0.6}
          >
            {c.category === 'Savings' ? 'Savings' : `${c.category}s`}
          </Text>
        </Billboard>
      ))}
    </>
  )
}

function AutoStopOrbitControls() {
  const controlsRef = useRef()
  const handleInteraction = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = false
    }
  }, [])

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan
      enableZoom
      enableRotate
      autoRotate
      autoRotateSpeed={0.5}
      zoomSpeed={0.1}
      onStart={handleInteraction}
    />
  )
}

function Scene3D({ onHover, onUnhover }) {
  const { trace, steps, phase, visibleVectorIds, queryVectorVisible } = useSceneStore()
  if (!trace) return null

  const allVectors = trace.all_vectors || []
  const queryVector = trace.query_vector
  const matchedIds = new Set((trace.matched_vectors || []).map((m) => m.product_id))
  const matchScoreMap = Object.fromEntries(
    (trace.matched_vectors || []).map((m) => [m.product_id, m.score])
  )

  // During ingestion, only show vectors that have been "stored"
  const displayVectors = phase === 'ingest'
    ? allVectors.filter((pt) => visibleVectorIds.has(pt.id))
    : allVectors

  // Show query + lines only after the action step has played
  const hasSearched = steps.some((s) => s.type === 'observation')
  // Show query vector during query-embed 'place' step or after search
  const showQueryVector = queryVectorVisible || hasSearched

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />

      {/* Grid */}
      <gridHelper args={[6, 12, '#1e2130', '#1e2130']} position={[0, -2.5, 0]} />
      <gridHelper args={[6, 12, '#1e2130', '#1e2130']} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -3]} />

      <Axes />
      {phase !== 'ingest' && <CategoryLabels allVectors={allVectors} />}

      {/* Product embedding shapes — incremental during ingest */}
      {displayVectors.map((pt) => (
        <ProductSphere
          key={pt.id}
          point={pt}
          isMatched={hasSearched && matchedIds.has(pt.product_id)}
          matchScore={hasSearched ? matchScoreMap[pt.product_id] : null}
          hasSearched={hasSearched}
          onHover={onHover}
          onUnhover={onUnhover}
        />
      ))}

      {/* Query vector — appears during query-embed 'place' or after search */}
      {showQueryVector && queryVector && <QueryVector point={queryVector} />}

      {/* Similarity lines from query to matched products */}
      {hasSearched &&
        queryVector &&
        allVectors
          .filter((pt) => matchedIds.has(pt.product_id))
          .map((pt) => (
            <SimilarityLine key={pt.id} from={queryVector} to={pt} />
          ))}

      <AutoStopOrbitControls />
    </>
  )
}

export default function VectorSpace() {
  const steps = useSceneStore((s) => s.steps)
  const queryVectorVisible = useSceneStore((s) => s.queryVectorVisible)
  const hasSearched = steps.some((s) => s.type === 'observation')
  const [tooltip, setTooltip] = useState(null)
  const containerRef = useRef(null)

  const handleHover = useCallback((data) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setTooltip({
      point: data.point,
      matchScore: data.matchScore,
      x: data.x - rect.left,
      y: data.y - rect.top,
    })
  }, [])

  const handleUnhover = useCallback(() => setTooltip(null), [])

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      <Canvas camera={{ position: [2.5, 1.5, 2.5], fov: 50 }}>
        <Scene3D onHover={handleHover} onUnhover={handleUnhover} />
      </Canvas>

      <IngestionOverlay />
      <QueryEmbedOverlay />

      {/* Hover tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 pointer-events-none bg-[#1a1d27]/95 border border-[#2a2d3a]
                       rounded-lg p-3 text-xs max-w-[220px] shadow-xl"
            style={{ left: tooltip.x + 12, top: tooltip.y - 8 }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: SUBCATEGORY_COLORS[tooltip.point.subcategory] || CATEGORY_COLORS[tooltip.point.category] || '#94a3b8' }}
              />
              <p className="font-semibold text-white leading-tight">{tooltip.point.label}</p>
            </div>
            <div className="space-y-0.5 text-[#94a3b8]">
              <p>{tooltip.point.category} · {tooltip.point.subcategory || '—'}</p>
              <p className="font-mono text-[10px] text-[#64748b]">{tooltip.point.product_id}</p>
              <p className="font-mono text-[10px]">
                Position: ({(tooltip.point.x * SCALE).toFixed(2)}, {(tooltip.point.y * SCALE).toFixed(2)}, {(tooltip.point.z * SCALE).toFixed(2)})
              </p>
            </div>
            {tooltip.matchScore != null && (
              <p className="text-pink-400 mt-1.5 pt-1.5 border-t border-[#2a2d3a]">
                Similarity score: {tooltip.matchScore}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-[#1a1d27]/90 rounded-lg p-3 text-xs space-y-2 max-h-[60%] overflow-y-auto">
        {Object.entries(CATEGORY_COLORS).map(([cat, catColor]) => {
          const catSubs = {
            'Credit Card': ['Travel', 'Cashback', 'Balance Transfer'],
            'Mortgage': ['First-Time Buyer', 'Buy-to-Let', 'Remortgage', 'Green'],
            'Personal Loan': ['Standard', 'Debt Consolidation', 'Car Finance'],
            'Savings': ['ISA', 'Fixed Rate', 'Investment ISA', 'Junior ISA', 'Wealth Management'],
          }
          return (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: catColor }} />
                <span className="text-[#94a3b8] font-semibold">{cat}</span>
              </div>
              <div className="ml-4 space-y-0.5">
                {catSubs[cat]?.map((sub) => {
                  const shape = SUBCATEGORY_SHAPES[sub] || 'sphere'
                  const color = SUBCATEGORY_COLORS[sub] || catColor
                  return (
                    <div key={sub} className="flex items-center gap-2">
                      <div className="w-2 h-2 shrink-0" style={{
                        backgroundColor: color,
                        borderRadius: shape === 'sphere' ? '50%' : shape === 'cylinder' ? '50%' : shape === 'box' ? '2px' : '0',
                        clipPath: shape === 'octahedron' ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
                          : shape === 'cone' ? 'polygon(50% 0%, 100% 100%, 0% 100%)' : 'none',
                      }} />
                      <span className="text-[#64748b]">{sub}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
        {(queryVectorVisible || hasSearched) && (
          <div className="flex items-center gap-2 pt-1 border-t border-[#2a2d3a]">
            <div className="w-2.5 h-2.5 rotate-45 bg-pink-500" />
            <span className="text-pink-400">Query vector</span>
          </div>
        )}
      </div>

      {/* Teaching callout */}
      {hasSearched && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-4 left-4 max-w-sm bg-indigo-500/10 border border-indigo-500/30
                     rounded-lg p-3 text-xs text-indigo-200"
        >
          <span className="font-semibold">How this works:</span> The query landed between
          the travel and cashback clusters — the AI understood that "saves me money on everyday
          spending" is semantically similar to cashback, and "2-3 times a month" maps to
          frequent travel. That's semantic search pulling from two subcategories at once.
        </motion.div>
      )}
    </div>
  )
}
