'use client'

import { useEffect, useState, useCallback } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { motion, AnimatePresence } from 'framer-motion'
import { useCanvasStore } from '@/lib/store'
import type { ArtifactNode, ArtifactType } from '@/lib/types'

const imgCache = new Map<string, string>()

// ─── Type color ───────────────────────────────────────────────────────────────

const TYPE_COLOR: Record<ArtifactType, string> = {
  runway:   'var(--type-runway)',
  sketch:   'var(--type-sketch)',
  material: 'var(--type-material)',
}

// ─── Keyword-aware image helpers ──────────────────────────────────────────────

function hashId(id: string): number {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) & 0xffff
  return h
}

function getImageKeywords(type: ArtifactType, label: string): string {
  const l = label.toLowerCase()
  if (type === 'runway') {
    if (l.includes('biker'))                              return 'fashion,runway,biker,jacket'
    if (l.includes('trench'))                             return 'fashion,runway,trench,coat'
    if (l.includes('shell') || l.includes('outerwear'))   return 'fashion,runway,outerwear'
    if (l.includes('knit'))                               return 'fashion,runway,knitwear'
    if (l.includes('leather'))                            return 'fashion,runway,leather,jacket'
    return 'fashion,runway,editorial'
  }
  if (type === 'sketch') {
    if (l.includes('biker'))                              return 'biker,jacket,fashion'
    if (l.includes('trench'))                             return 'trench,coat,fashion'
    if (l.includes('shell'))                              return 'jacket,outerwear,fashion'
    if (l.includes('knit') || l.includes('rib') || l.includes('cable')) return 'knitwear,fashion'
    if (l.includes('leather'))                            return 'leather,jacket,fashion'
    return 'fashion,clothing,design'
  }
  // material
  if (l.includes('denim') || l.includes('selvedge'))      return 'denim,fabric,textile'
  if (l.includes('leather') || l.includes('nappa') || l.includes('lamb')) return 'leather,texture,material'
  if (l.includes('wool') || l.includes('merino') || l.includes('boucl'))  return 'wool,fabric,textile'
  if (l.includes('cashmere'))                             return 'cashmere,fabric,textile'
  if (l.includes('neoprene'))                             return 'fabric,textile,neoprene'
  if (l.includes('knit') || l.includes('panel'))          return 'knit,fabric,textile'
  return 'fabric,textile,material'
}

// ─── Score bar ────────────────────────────────────────────────────────────────

function barColor(v: number) {
  if (v < 40) return 'var(--status-risk)'
  if (v < 70) return 'var(--status-watch)'
  return 'var(--status-clear)'
}

function ScoreRow({ label, score }: { label: string; score: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
      <span style={{
        width: 52, fontSize: 8, fontFamily: 'var(--font-mono)',
        color: 'rgba(255,255,255,0.4)', flexShrink: 0, textTransform: 'capitalize',
      }}>
        {label}
      </span>
      <div style={{
        width: 50, height: 3, background: 'rgba(255,255,255,0.08)',
        borderRadius: 2, overflow: 'hidden', flexShrink: 0,
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.05 }}
          style={{ height: '100%', background: barColor(score), borderRadius: 2 }}
        />
      </div>
      <span style={{
        fontSize: 8, fontFamily: 'var(--font-mono)',
        color: 'rgba(255,255,255,0.5)', width: 24, textAlign: 'right',
      }}>
        {score}%
      </span>
    </div>
  )
}

// ─── ArtifactCard ─────────────────────────────────────────────────────────────

export default function ArtifactCard({ artifact }: { artifact: ArtifactNode }) {
  const [hovered,  setHovered]  = useState(false)
  const [imgError, setImgError] = useState(false)
  const [imgUrl,   setImgUrl]   = useState<string | null>(null)

  const setArtifactScore = useCanvasStore((s) => s.setArtifactScore)
  const removeArtifact   = useCanvasStore((s) => s.removeArtifact)
  const approveArtifact  = useCanvasStore((s) => s.approveArtifact)
  const openApproveModal = useCanvasStore((s) => s.openApproveModal)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id:   `reposition-${artifact.id}`,
    data: { ...artifact, dragType: 'reposition' },
  })

  const divRef = useCallback(
    (el: HTMLDivElement | null) => { setNodeRef(el) },
    [setNodeRef]
  )

  // Score fetch 600ms after mount
  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/score', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ artifact }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!cancelled) {
          setArtifactScore(artifact.id, data.overall, {
            silhouette: data.silhouette,
            palette:    data.palette,
            hardware:   data.hardware,
            material:   data.material,
          })
        }
      } catch {
        if (!cancelled) {
          const h = artifact.alignmentHint
          const overall = Math.round((h.silhouette + h.palette + h.hardware + h.material) / 4)
          setArtifactScore(artifact.id, overall, h)
        }
      }
    }, 600)
    return () => { cancelled = true; clearTimeout(timer) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const cached = imgCache.get(artifact.id)
    if (cached) { setImgUrl(cached); return }

    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: artifact.type, label: artifact.label, id: artifact.id, width: 480, height: 320 }),
        })
        if (!res.ok) throw new Error()
        const { url } = await res.json()
        if (url && !cancelled) {
          imgCache.set(artifact.id, url)
          setImgError(false)
          setImgUrl(url)
        }
      } catch { /* keep loremflickr placeholder */ }
    }, 100)
    return () => { cancelled = true; clearTimeout(timer) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const typeColor  = TYPE_COLOR[artifact.type]
  const rationale  = artifact.alignmentRationale
  const isApproved = artifact.approved === true
  const keywords = getImageKeywords(artifact.type, artifact.label)
  const imgSrc   = imgUrl ?? `https://loremflickr.com/480/320/${keywords}?lock=${hashId(artifact.id)}`

  return (
    <motion.div
      ref={divRef}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(listeners as any)}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(attributes as any)}
      suppressHydrationWarning
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        x:        transform?.x ?? 0,
        y:        transform?.y ?? 0,
        position: 'absolute',
        left:     artifact.position.x,
        top:      artifact.position.y,
        zIndex:   isDragging ? 1000 : 1,
        width:    240,
        background:   '#1c1c1e',
        border:       isApproved
          ? '1px solid var(--status-clear)'
          : '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8,
        overflow:     'hidden',
        cursor:       isDragging ? 'grabbing' : 'grab',
        boxShadow:    isApproved
          ? '0 0 0 1px var(--status-clear), 0 0 16px rgba(52,199,89,0.18), 0 12px 40px rgba(0,0,0,0.5)'
          : '0 12px 40px rgba(0,0,0,0.5)',
        userSelect:       'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* ── Left type indicator strip ─────────────────────────────────────── */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
        background: typeColor, zIndex: 5, pointerEvents: 'none',
      }} />

      {/* ── Image area ───────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', width: '100%', height: 160, overflow: 'hidden' }}>
        {/* Color fallback always sits behind image */}
        <div style={{ position: 'absolute', inset: 0, background: `${artifact.thumbnailColor}66` }} />

        {!imgError && (
          <img
            src={imgSrc}
            loading="lazy"
            alt=""
            onError={() => setImgError(true)}
            style={{
              position:  'absolute',
              inset:     0,
              width:     '100%',
              height:    '100%',
              objectFit: 'cover',
              display:   'block',
              filter:    artifact.type === 'sketch' ? 'grayscale(20%) contrast(1.1)' : 'none',
            }}
          />
        )}

        {/* Hover action bar — slides down from top */}
        <AnimatePresence>
          {hovered && !isDragging && (
            <motion.div
              key="actions"
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              style={{
                position:       'absolute',
                top: 0, left: 0, right: 0,
                display:        'flex',
                gap:            4,
                padding:        '6px 8px 6px 12px',
                background:     'rgba(0,0,0,0.78)',
                backdropFilter: 'blur(8px)',
                zIndex:         10,
              }}
            >
              <button
                title="Approve"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  approveArtifact(artifact.id)
                  openApproveModal(artifact.id)
                }}
                style={{
                  flex: 1, height: 26,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  background: 'rgba(52,199,89,0.15)',
                  border: '1px solid rgba(52,199,89,0.35)',
                  borderRadius: 4, cursor: 'pointer',
                  color: 'rgba(52,199,89,0.9)',
                  fontSize: 11, fontFamily: 'var(--font-display)',
                  transition: 'background 0.12s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(52,199,89,0.25)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(52,199,89,0.15)' }}
              >
                ✓ Approve
              </button>
              <button
                title="Reject"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); removeArtifact(artifact.id) }}
                style={{
                  flex: 1, height: 26,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  background: 'rgba(255,59,48,0.15)',
                  border: '1px solid rgba(255,59,48,0.35)',
                  borderRadius: 4, cursor: 'pointer',
                  color: 'rgba(255,59,48,0.9)',
                  fontSize: 11, fontFamily: 'var(--font-display)',
                  transition: 'background 0.12s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,59,48,0.25)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,59,48,0.15)' }}
              >
                ✗ Reject
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Approved badge — top-right corner */}
        {isApproved && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            width: 20, height: 20, borderRadius: '50%',
            background: 'var(--status-clear)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 6, pointerEvents: 'none',
            boxShadow: '0 2px 8px rgba(52,199,89,0.4)',
          }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5L4 7.5L8 2.5"
                stroke="white" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>

      {/* ── Footer strip ──────────────────────────────────────────────────── */}
      <div style={{ padding: '8px 10px 8px 14px', background: 'rgba(0,0,0,0.6)' }}>
        <p style={{
          fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 500,
          color: 'rgba(255,255,255,0.92)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          marginBottom: 3,
        }}>
          {artifact.label}
        </p>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 9, color: typeColor, opacity: 0.8,
        }}>
          {artifact.source}
        </span>
      </div>

      {/* ── Brand alignment mini-panel — slides in when score arrives ──────── */}
      <AnimatePresence>
        {rationale && (
          <motion.div
            key="alignment"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.6 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '8px 10px 8px 14px',
              background: 'rgba(0,0,0,0.7)',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.07em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6,
              }}>
                Brand Alignment
              </p>
              <ScoreRow label="Silhouette" score={rationale.silhouette} />
              <ScoreRow label="Palette"    score={rationale.palette}    />
              <ScoreRow label="Hardware"   score={rationale.hardware}   />
              <ScoreRow label="Material"   score={rationale.material}   />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
