import { motion } from 'framer-motion'

export default function MessageBubble({ sender, text }) {
  const isAlex = sender === 'alex'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isAlex ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isAlex
            ? 'bg-indigo-500 text-white rounded-br-md'
            : 'bg-[#2a2d3a] text-[#e2e8f0] rounded-bl-md'
        }`}
      >
        <p className="text-[10px] font-semibold mb-1 opacity-60">
          {isAlex ? 'Alex' : 'Apex AI'}
        </p>
        {text.split('\n').map((line, i) => (
          <p key={i} className={i > 0 ? 'mt-2' : ''}>
            {line}
          </p>
        ))}
      </div>
    </motion.div>
  )
}
