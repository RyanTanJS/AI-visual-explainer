import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'

function StreamingText({ text, speed = 12 }) {
  const [charCount, setCharCount] = useState(0)
  const rafRef = useRef(null)
  const startRef = useRef(null)

  useEffect(() => {
    startRef.current = performance.now()

    const tick = (now) => {
      const elapsed = now - startRef.current
      const chars = Math.min(Math.floor(elapsed / speed), text.length)
      setCharCount(chars)
      if (chars < text.length) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [text, speed])

  const visible = text.slice(0, charCount)
  const lines = visible.split('\n')

  return (
    <>
      {lines.map((line, i) => (
        <p key={i} className={i > 0 ? 'mt-2' : ''}>
          {line}
          {i === lines.length - 1 && charCount < text.length && (
            <span className="inline-block w-[2px] h-[1em] bg-current opacity-70 align-text-bottom animate-pulse ml-px" />
          )}
        </p>
      ))}
    </>
  )
}

export default function MessageBubble({ sender, text }) {
  const isChloe = sender === 'chloe'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isChloe ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isChloe
            ? 'bg-teal-500 text-white rounded-br-md'
            : 'bg-[#2a2d3a] text-[#e2e8f0] rounded-bl-md'
        }`}
      >
        <p className="text-[10px] font-semibold mb-1 opacity-60">
          {isChloe ? 'Chloe' : 'Apex AI'}
        </p>
        {isChloe ? (
          text.split('\n').map((line, i) => (
            <p key={i} className={i > 0 ? 'mt-2' : ''}>
              {line}
            </p>
          ))
        ) : (
          <StreamingText text={text} speed={3} />
        )}
      </div>
    </motion.div>
  )
}
