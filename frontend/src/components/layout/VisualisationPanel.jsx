import useSceneStore from '../../stores/sceneStore'
import VectorSpace from '../scenes/VectorSpace'
import ReActPanel from '../scenes/ReActPanel'

export default function VisualisationPanel() {
  const currentScene = useSceneStore((s) => s.currentScene)

  return (
    <div className="w-[60%] relative bg-[#0f1117]">
      {/* Scene label */}
      <div className="absolute top-4 left-4 z-10">
        <span className="text-xs font-mono text-[#64748b] bg-[#1a1d27]/80 px-2 py-1 rounded">
          {currentScene === 1 && 'Scene 1: RAG & Vector Search'}
          {currentScene === 2 && 'Scene 2: ReAct & Tool Calling'}
        </span>
      </div>

      {currentScene === 1 && <VectorSpace />}
      {currentScene === 2 && <ReActPanel />}
    </div>
  )
}
