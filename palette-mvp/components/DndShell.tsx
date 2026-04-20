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
import { useCanvasStore } from '@/lib/store'
import IntakeCard from './IntakeCard'
import type { IntakeCard as IntakeCardType } from '@/lib/types'

// ─── DndShell ─────────────────────────────────────────────────────────────────
// Wraps the three-panel layout in a DndContext so drags can cross panel
// boundaries (SearchPanel → CanvasZone) and so ArtifactCards can be
// repositioned inside the canvas.

export default function DndShell({ children }: { children: React.ReactNode }) {
  const [draggingCard, setDraggingCard] = useState<IntakeCardType | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current
    // Skip canvas-internal reposition drags — they don't need an overlay
    if (data && (data as Record<string, unknown>).dragType === 'reposition') return
    if (data && typeof data === 'object' && 'type' in data) {
      setDraggingCard(data as IntakeCardType)
    }
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over, delta } = event
    const data = active.data.current

    // ── Canvas-internal artifact reposition ───────────────────────────────
    if (data && (data as Record<string, unknown>).dragType === 'reposition') {
      const artifact = data as { id: string; position: { x: number; y: number } }
      useCanvasStore.getState().moveArtifact(artifact.id, {
        x: Math.max(0, artifact.position.x + delta.x),
        y: Math.max(0, artifact.position.y + delta.y),
      })
      setDraggingCard(null)
      return
    }

    // ── Intake card → canvas drop ─────────────────────────────────────────
    if (over?.id === 'canvas' && data && 'type' in data) {
      const rect            = over.rect
      const activatorEvent  = event.activatorEvent as PointerEvent
      const x = Math.max(0, activatorEvent.clientX - rect.left + delta.x - 90)
      const y = Math.max(0, activatorEvent.clientY - rect.top  + delta.y - 60)
      useCanvasStore.getState().addArtifact(data as IntakeCardType, { x, y })
    }

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
