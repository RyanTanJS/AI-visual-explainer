import useSceneStore from '../../stores/sceneStore'
import MessageBubble from './MessageBubble'

export default function ChatPanel() {
  const { trace, steps, isPlaying, play, reset, phase, queryEmbedStep, advanceQueryEmbed } = useSceneStore()

  const query = trace?.query || ''
  const answerStep = steps.find((s) => s.type === 'answer')
  const isQueryEmbed = phase === 'query-embed'

  return (
    <div className="w-[40%] flex flex-col border-r border-[#2a2d3a] bg-[#1a1d27]">
      {/* Chat header */}
      <div className="px-4 py-3 border-b border-[#2a2d3a]">
        <p className="text-sm font-medium text-white">Alex's Conversation</p>
        <p className="text-xs text-[#64748b]">Apex Bank AI Assistant</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {query && <MessageBubble sender="alex" text={query} />}
        {answerStep && <MessageBubble sender="ai" text={answerStep.content} />}
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-[#2a2d3a] flex gap-2">
        {isQueryEmbed ? (
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
        ) : (
          <button
            onClick={play}
            disabled={isPlaying || phase === 'ingest'}
            className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40
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
