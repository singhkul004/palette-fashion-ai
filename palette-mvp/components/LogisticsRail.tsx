'use client'

import { useCanvasStore } from '@/lib/store'

// ─── Ghost state ──────────────────────────────────────────────────────────────

function GhostState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 h-full px-8 text-center">
      {/* Lock icon */}
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      <p
        className="text-sm leading-relaxed"
        style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)' }}
      >
        {message}
      </p>
      <span
        className="status-badge status-badge-dormant"
        style={{ marginTop: 4 }}
      >
        Coming in full release
      </span>
    </div>
  )
}

// ─── LogisticsRail ────────────────────────────────────────────────────────────
// Phase 3 stub — full logistics cards built in Phase 5.

export default function LogisticsRail() {
  const activeTab = useCanvasStore((s) => s.activeTab)

  const content = () => {
    if (activeTab === 'trend') {
      return <GhostState message="Trend analysis coming in full release" />
    }
    if (activeTab === 'skus') {
      return <GhostState message="SKU performance view coming in full release" />
    }
    // Factory tab — full logistics view (placeholder until Phase 5)
    return (
      <div className="flex flex-col h-full">
        <div
          className="px-5 py-4 border-b"
          style={{ borderColor: 'var(--glass-border)' }}
        >
          <p
            className="text-xs uppercase tracking-widest"
            style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}
          >
            Logistics Graph
          </p>
          <p
            className="text-lg font-medium mt-1"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}
          >
            Drop artifacts to activate
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center px-8">
          <p
            className="text-sm text-center leading-relaxed"
            style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)' }}
          >
            Drag a material or sketch from the right panel onto the canvas to begin
          </p>
        </div>
      </div>
    )
  }

  return (
    <aside
      className="glass-rail flex-none h-full overflow-hidden"
      style={{ width: 360 }}
    >
      {content()}
    </aside>
  )
}
