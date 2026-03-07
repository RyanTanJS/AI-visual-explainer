import { useEffect, useRef, useCallback } from 'react'
import useSceneStore from './stores/sceneStore'
import Header from './components/layout/Header'
import ChatPanel from './components/chat/ChatPanel'
import VectorSpace from './components/scenes/VectorSpace'
import ReActPanel from './components/scenes/ReActPanel'
import SceneExplainer from './components/scenes/SceneExplainer'
import { motion } from 'framer-motion'

function SceneHeader({ number, title, active }) {
  return (
    <div className="flex items-center gap-3 px-6 py-2 border-b border-[#2a2d3a] bg-[#1a1d27]/80 shrink-0">
      <span className={`text-xs font-mono px-2 py-0.5 rounded ${
        active ? 'bg-indigo-500/20 text-indigo-300' : 'bg-[#2a2d3a] text-[#64748b]'
      }`}>
        Scene {number}
      </span>
      <span className="text-xs text-[#94a3b8]">{title}</span>
    </div>
  )
}

function SceneComplete({ number, title }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-[#0f1117]">
      <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30
                      flex items-center justify-center text-emerald-400 text-lg">
        ✓
      </div>
      <p className="text-white text-sm font-semibold">Scene {number}: {title}</p>
      <p className="text-[#64748b] text-xs">Completed — scroll down to continue</p>
    </div>
  )
}

function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1"
    >
      <span className="text-[#64748b] text-xs">Scroll to continue</span>
      <svg className="w-4 h-4 text-[#64748b] animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </motion.div>
  )
}

function App() {
  const loadScene = useSceneStore((s) => s.loadScene)
  const currentScene = useSceneStore((s) => s.currentScene)
  const sceneCompleted = useSceneStore((s) => s.sceneCompleted)

  const scene2Ref = useRef(null)

  useEffect(() => {
    loadScene(1)
  }, [loadScene])

  // Load scene 2 when its section enters the viewport
  const scene2Loaded = useRef(false)
  useEffect(() => {
    if (!sceneCompleted[1] || !scene2Ref.current || scene2Loaded.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !scene2Loaded.current) {
          scene2Loaded.current = true
          loadScene(2)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(scene2Ref.current)
    return () => observer.disconnect()
  }, [sceneCompleted[1], loadScene])

  const scene1Done = sceneCompleted[1]

  return (
    <div className="h-screen w-screen overflow-y-auto scroll-smooth bg-[#0f1117]">
      {/* Sticky header */}
      <div className="sticky top-0 z-30">
        <Header />
      </div>

      {/* Scene 1 */}
      <section className="h-[calc(100vh-49px)] flex flex-col relative">
        <SceneHeader number={1} title="RAG & Vector Search" active={currentScene === 1} />
        {currentScene === 1 ? (
          <div className="flex flex-1 overflow-hidden">
            <ChatPanel />
            <div className="w-[60%] relative bg-[#0f1117]">
              <VectorSpace />
            </div>
          </div>
        ) : (
          <SceneComplete number={1} title="RAG & Vector Search" />
        )}
        {scene1Done && currentScene === 1 && <ScrollIndicator />}
      </section>

      {/* Explainer 1 + Scene 2 — only after scene 1 complete */}
      {scene1Done && (
        <>
          <SceneExplainer sceneId={1} />

          {/* Scene 2 */}
          <section ref={scene2Ref} className="h-[calc(100vh-49px)] flex flex-col relative">
            <SceneHeader number={2} title="ReAct & Tool Calling" active={currentScene === 2} />
            {currentScene === 2 ? (
              <div className="flex flex-1 overflow-hidden">
                <ChatPanel />
                <div className="w-[60%] relative bg-[#0f1117]">
                  <ReActPanel />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-[#0f1117]">
                <p className="text-[#64748b] text-sm">Scroll here to begin Scene 2</p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

export default App
