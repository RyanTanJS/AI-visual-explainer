export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-[#2a2d3a] bg-[#1a1d27] shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-white tracking-tight">Ask Apex</h1>
        <span className="text-xs text-[#94a3b8] bg-[#2a2d3a] px-2 py-0.5 rounded">
          Under the Hood
        </span>
      </div>
    </header>
  )
}
