'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { motion, AnimatePresence } from 'framer-motion'
import { useCanvasStore } from '@/lib/store'
import ArtifactCard   from './ArtifactCard'
import ApproveModal   from './ApproveModal'
import Toast          from './Toast'

// ─── Design info chip ─────────────────────────────────────────────────────────

function InfoChip() {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display:       'inline-flex',
          alignItems:    'center',
          height:        24,
          padding:       '0 10px',
          borderRadius:  100,
          background:    'rgba(255,255,255,0.06)',
          border:        '1px solid rgba(255,255,255,0.11)',
          fontFamily:    'var(--font-mono)',
          fontSize:      10,
          color:         'var(--text-tertiary)',
          cursor:        'pointer',
          whiteSpace:    'nowrap',
          letterSpacing: '0.03em',
        }}
      >
        Paul Frances · London · 14 SKUs
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="popover"
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position:       'absolute',
              top:            'calc(100% + 6px)',
              left:           0,
              background:     'rgba(24,24,26,0.95)',
              backdropFilter: 'blur(20px)',
              border:         '1px solid rgba(255,255,255,0.12)',
              borderRadius:   10,
              padding:        '10px 14px',
              minWidth:       180,
              zIndex:         50,
            }}
          >
            {([
              ['Designer',   'Paul Frances'],
              ['Date',       'Jan 2026'],
              ['Office',     'London'],
              ['Complexity', 'High'],
              ['SKUs',       '14'],
            ] as [string, string][]).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 6 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9,
                  color: 'var(--text-tertiary)', letterSpacing: '0.07em', textTransform: 'uppercase',
                }}>
                  {k}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-primary)' }}>
                  {v}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── CanvasZone ───────────────────────────────────────────────────────────────

export default function CanvasZone() {
  const artifacts          = useCanvasStore((s) => s.artifacts)
  const collectionTitle    = useCanvasStore((s) => s.collectionTitle)
  const setCollectionTitle = useCanvasStore((s) => s.setCollectionTitle)
  const openApproveModal   = useCanvasStore((s) => s.openApproveModal)

  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' })

  const containerRef  = useRef<HTMLElement | null>(null)
  const titleRef      = useRef<HTMLHeadingElement>(null)
  const prevLenRef    = useRef(0)
  const [toastVisible, setToastVisible] = useState(false)

  const setRefs = useCallback(
    (el: HTMLElement | null) => {
      setNodeRef(el)
      containerRef.current = el
    },
    [setNodeRef]
  )

  // Initialise contenteditable once
  useEffect(() => {
    if (titleRef.current) titleRef.current.textContent = collectionTitle
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Ripple on new drop
  useEffect(() => {
    if (artifacts.length > prevLenRef.current && containerRef.current) {
      const newest = artifacts[artifacts.length - 1]
      spawnRipple(containerRef.current, newest.position.x + 90, newest.position.y + 60)
    }
    prevLenRef.current = artifacts.length
  }, [artifacts.length]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main
      ref={setRefs}
      id="canvas"
      className="relative flex-1 h-full overflow-hidden"
      style={{
        background:      '#383838',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize:  '28px 28px',
        outline:       isOver ? '1px solid rgba(255,255,255,0.14)' : 'none',
        outlineOffset: '-1px',
      }}
    >
      {/* ── Collection title + info chip ──────────────────────────────────── */}
      <div
        style={{
          position:      'absolute',
          top:           16,
          left:          24,
          display:       'flex',
          alignItems:    'center',
          gap:           10,
          zIndex:        10,
          pointerEvents: 'auto',
        }}
      >
        <h2
          ref={titleRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={() => {
            const text = titleRef.current?.textContent?.trim()
            if (text) setCollectionTitle(text)
            else if (titleRef.current) titleRef.current.textContent = collectionTitle
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); titleRef.current?.blur() }
          }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize:   18,
            fontWeight: 500,
            color:      'rgba(255,255,255,0.92)',
            outline:    'none',
            cursor:     'text',
            minWidth:   10,
          }}
        />
        <InfoChip />
      </div>

      {/* ── Empty state ───────────────────────────────────────────────────── */}
      {artifacts.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize:   16,
            color:      'var(--text-tertiary)',
          }}>
            Drag artifacts to begin
          </p>
        </div>
      )}

      {/* ── Artifact cards ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {artifacts.map((artifact) => (
          <ArtifactCard key={artifact.id} artifact={artifact} />
        ))}
      </AnimatePresence>

      {/* ── Approve modal ────────────────────────────────────────────────── */}
      <ApproveModal onSent={() => setToastVisible(true)} />

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toastVisible && (
          <Toast key="toast" onDone={() => setToastVisible(false)} />
        )}
      </AnimatePresence>

      {/* ── Finalize Drop button ─────────────────────────────────────────── */}
      <AnimatePresence>
        {artifacts.length >= 3 && (
          <motion.div
            key="finalize"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              position:       'absolute',
              bottom:         28,
              left:           0,
              right:          0,
              display:        'flex',
              justifyContent: 'center',
              zIndex:         20,
              pointerEvents:  'none',
            }}
          >
            <button
              onClick={() => openApproveModal('global')}
              style={{
                pointerEvents:  'auto',
                display:        'flex',
                alignItems:     'center',
                gap:            8,
                height:         38,
                padding:        '0 22px',
                borderRadius:   100,
                background:     'rgba(52,199,89,0.10)',
                border:         '1px solid rgba(52,199,89,0.4)',
                boxShadow:      '0 0 16px rgba(52,199,89,0.12)',
                fontFamily:     'var(--font-display)',
                fontSize:       13,
                fontWeight:     500,
                color:          'rgba(52,199,89,0.95)',
                cursor:         'pointer',
                backdropFilter: 'blur(16px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(52,199,89,0.16)'
                e.currentTarget.style.boxShadow  = '0 0 24px rgba(52,199,89,0.22)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(52,199,89,0.10)'
                e.currentTarget.style.boxShadow  = '0 0 16px rgba(52,199,89,0.12)'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7L5.5 10.5L12 3.5"
                  stroke="rgba(52,199,89,0.95)" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
              Finalize Drop
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

// ─── Ripple helper (Web Animations API) ───────────────────────────────────────

function spawnRipple(container: HTMLElement, x: number, y: number) {
  const el = document.createElement('div')
  Object.assign(el.style, {
    position:      'absolute',
    left:          `${x}px`,
    top:           `${y}px`,
    width:         '4px',
    height:        '4px',
    marginLeft:    '-2px',
    marginTop:     '-2px',
    borderRadius:  '50%',
    border:        '1.5px solid rgba(255,255,255,0.45)',
    pointerEvents: 'none',
    zIndex:        '5',
  })
  container.appendChild(el)
  el.animate(
    [
      { width: '4px',  height: '4px',  marginLeft: '-2px',  marginTop: '-2px',  opacity: 0.6 },
      { width: '60px', height: '60px', marginLeft: '-30px', marginTop: '-30px', opacity: 0   },
    ],
    { duration: 400, easing: 'ease-out', fill: 'forwards' }
  )
  setTimeout(() => el.remove(), 420)
}
