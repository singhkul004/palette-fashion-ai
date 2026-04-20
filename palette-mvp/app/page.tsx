import TopBar        from '@/components/TopBar'
import LogisticsRail from '@/components/LogisticsRail'
import CanvasZone    from '@/components/CanvasZone'
import SearchPanel   from '@/components/SearchPanel'
import DndShell      from '@/components/DndShell'

// ─── Page ─────────────────────────────────────────────────────────────────────
// Server component — assembles the three-panel shell.
// DndShell (client) wraps the three panels so drags can cross the
// SearchPanel → CanvasZone boundary.

export default function Page() {
  return (
    <div className="h-screen overflow-hidden flex flex-col">
      {/* ── Top bar: 52px, full width ─────────────────────────────────────── */}
      <TopBar />

      {/* ── Three-panel body ──────────────────────────────────────────────── */}
      <DndShell>
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Left rail: 360px — Logistics Graph */}
          <LogisticsRail />

          {/* Center: flex-1 — Taste Graph (infinite canvas) */}
          <CanvasZone />

          {/* Right panel: 300px — Intake / Search */}
          <SearchPanel />
        </div>
      </DndShell>
    </div>
  )
}
