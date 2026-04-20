'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import IntakeCard from './IntakeCard'
import type { IntakeCard as IntakeCardType } from '@/lib/types'

// ─── DndShell ─────────────────────────────────────────────────────────────────
// Wraps the three-panel layout in a DndContext so drags can cross panel
// boundaries (from SearchPanel into CanvasZone).
//
// Phase 4: sets up drag tracking + DragOverlay.
// Phase 5: onDragEnd will receive the canvas drop position and call
//           store.addArtifact() when over.id === 'canvas-drop-zone'.

export default function DndShell({ children }: { children: React.ReactNode }) {
  const [draggingCard, setDraggingCard] = useState<IntakeCardType | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require 8px movement before activating drag — prevents accidental
      // drags when clicking thumbs/source badges on IntakeCard.
      activationConstraint: { distance: 8 },
    })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current
    // Only track IntakeCard drags (data has 'type' from our IntakeCard)
    if (data && typeof data === 'object' && 'type' in data) {
      setDraggingCard(data as IntakeCardType)
    }
  }, [])

  const handleDragEnd = useCallback((_event: DragEndEvent) => {
    // ── Phase 5 hook ──────────────────────────────────────────────────────
    // When CanvasZone becomes a useDroppable with id='canvas-drop-zone',
    // Phase 5 will add drop logic here:
    //
    //   if (event.over?.id === 'canvas-drop-zone' && draggingCard) {
    //     const canvas = document.getElementById('canvas-drop-zone')
    //     const rect = canvas!.getBoundingClientRect()
    //     const ptr  = event.activatorEvent as PointerEvent
    //     const x    = ptr.clientX - rect.left + event.delta.x - 80
    //     const y    = ptr.clientY - rect.top  + event.delta.y - 50
    //     store.addArtifact(draggingCard, { x: Math.max(0, x), y: Math.max(0, y) })
    //   }
    //
    setDraggingCard(null)
  }, [])

  const handleDragCancel = useCallback(() => {
    setDraggingCard(null)
  }, [])

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}

      {/* DragOverlay renders into a portal at document.body, always on top.
          dropAnimation={null} prevents the ghost snapping back to its origin
          — the item simply disappears when the drag ends.                  */}
      <DragOverlay dropAnimation={null}>
        {draggingCard ? (
          <div style={{ width: 268, pointerEvents: 'none' }}>
            <IntakeCard card={draggingCard} isOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
