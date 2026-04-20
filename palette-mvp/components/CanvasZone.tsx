'use client'

// ─── CanvasZone ───────────────────────────────────────────────────────────────
// Phase 3 stub — full drag-and-drop canvas built in Phase 4.
// Renders the dot-grid infinite canvas and a centered drop hint.

export default function CanvasZone() {
  return (
    <main
      id="canvas-drop-zone"
      className="relative flex-1 h-full overflow-hidden dot-grid"
      style={{ background: 'var(--canvas-bg)' }}
    >
      {/* Drop hint — hidden once artifacts exist (Phase 4) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none select-none">
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="6" y="12" width="36" height="28" rx="3" />
          <path d="M16 12V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
          <line x1="24" y1="22" x2="24" y2="34" />
          <line x1="18" y1="28" x2="30" y2="28" />
        </svg>
        <div className="text-center">
          <p
            className="text-sm font-medium"
            style={{ color: 'rgba(255,255,255,0.18)', fontFamily: 'var(--font-display)' }}
          >
            Jacket Dystopia — Winter &#39;26
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: 'rgba(255,255,255,0.10)', fontFamily: 'var(--font-mono)' }}
          >
            Search and drag artifacts from the right panel
          </p>
        </div>
      </div>
    </main>
  )
}
