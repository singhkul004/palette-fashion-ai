'use client'

import { useState, useEffect } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { IntakeCard as IntakeCardType, ArtifactType, AlignmentBreakdown } from '@/lib/types'

// ─── Type icons ───────────────────────────────────────────────────────────────

function RunwayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      {/* Jacket/coat top — two shoulders + collar */}
      <path
        d="M9 3 L4 6 L3 14 H6 V9 L9 7 L12 9 V14 H15 L14 6 Z"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.75"
      />
      <path d="M6.5 6 L9 8 L11.5 6" stroke="white" strokeWidth="1" opacity="0.45" />
    </svg>
  )
}

function SketchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M12.5 2.5 L15.5 5.5 L6 15 H3 V12 Z"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.75"
      />
      <path d="M10.5 4.5 L13.5 7.5" stroke="white" strokeWidth="1" opacity="0.45" />
      <path d="M3 12 L6 15" stroke="white" strokeWidth="1" opacity="0.45" />
    </svg>
  )
}

function MaterialIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      {/* Fabric swatch — rounded rect with 3 diagonal stripe lines */}
      <rect
        x="2" y="2" width="14" height="14" rx="2"
        stroke="white" strokeWidth="1.2" opacity="0.75"
      />
      <line x1="5"  y1="2"  x2="2"  y2="5"  stroke="white" strokeWidth="1.2" opacity="0.4" />
      <line x1="10" y1="2"  x2="2"  y2="10" stroke="white" strokeWidth="1.2" opacity="0.4" />
      <line x1="16" y1="2"  x2="2"  y2="16" stroke="white" strokeWidth="1.2" opacity="0.4" />
      <line x1="16" y1="7"  x2="7"  y2="16" stroke="white" strokeWidth="1.2" opacity="0.4" />
      <line x1="16" y1="13" x2="13" y2="16" stroke="white" strokeWidth="1.2" opacity="0.4" />
    </svg>
  )
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

const imgCache = new Map<string, string>()

const TYPE_ICONS: Record<ArtifactType, React.FC> = {
  runway:   RunwayIcon,
  sketch:   SketchIcon,
  material: MaterialIcon,
}

const TYPE_COLOR: Record<ArtifactType, string> = {
  runway:   'var(--type-runway)',
  sketch:   'var(--type-sketch)',
  material: 'var(--type-material)',
}

// ─── Alignment dot ────────────────────────────────────────────────────────────

function AlignmentDot({ score, title }: { score: number; title: string }) {
  const color =
    score > 75 ? 'var(--status-clear)' :
    score > 50 ? 'var(--status-watch)' :
                 'var(--status-risk)'
  return (
    <div
      title={`${title}: ${score}`}
      style={{
        width:        5,
        height:       5,
        borderRadius: '50%',
        background:   color,
        opacity:      0.85,
      }}
    />
  )
}

function AlignmentDots({ hint }: { hint: AlignmentBreakdown }) {
  const dims: { key: keyof AlignmentBreakdown; label: string }[] = [
    { key: 'silhouette', label: 'Silhouette' },
    { key: 'palette',    label: 'Palette'    },
    { key: 'hardware',   label: 'Hardware'   },
    { key: 'material',   label: 'Material'   },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {dims.map(({ key, label }) => (
        <AlignmentDot key={key} score={hint[key]} title={label} />
      ))}
    </div>
  )
}

// ─── Thumbs micro-buttons ─────────────────────────────────────────────────────

function ThumbButton({
  direction,
  onClick,
}: {
  direction: 'up' | 'down'
  onClick: (e: React.MouseEvent) => void
}) {
  const [active, setActive] = useState(false)
  const color = active
    ? direction === 'up' ? 'var(--status-clear)' : 'var(--status-risk)'
    : 'rgba(255,255,255,0.3)'

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        setActive((v) => !v)
        onClick(e)
      }}
      style={{
        padding:    '2px 3px',
        background: 'none',
        border:     'none',
        cursor:     'pointer',
        color,
        transition: 'color 0.12s ease',
        lineHeight: 1,
      }}
      title={direction === 'up' ? 'Good match' : 'Poor match'}
    >
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
        {direction === 'up' ? (
          <>
            <path
              d="M2 11V6H4.5L6 2L8 3V6H10.5L10 11H2Z"
              stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"
            />
            <line x1="4.5" y1="6" x2="4.5" y2="11" stroke="currentColor" strokeWidth="1.2" />
          </>
        ) : (
          <>
            <path
              d="M2 1V6H4.5L6 10L8 9V6H10.5L10 1H2Z"
              stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"
            />
            <line x1="4.5" y1="1" x2="4.5" y2="6" stroke="currentColor" strokeWidth="1.2" />
          </>
        )}
      </svg>
    </button>
  )
}

// ─── Card inner (shared between draggable + overlay) ─────────────────────────

interface CardInnerProps {
  card:        IntakeCardType
  isDragging?: boolean
  isOverlay?:  boolean
  dragRef?:    (el: HTMLElement | null) => void
  dragStyle?:  React.CSSProperties
  listeners?:  Record<string, unknown>
  attributes?: Record<string, unknown>
}

function CardInner({
  card,
  isDragging = false,
  isOverlay  = false,
  dragRef,
  dragStyle  = {},
  listeners  = {},
  attributes = {},
}: CardInnerProps) {
  const [imgError, setImgError] = useState(false)
  const [imgUrl,   setImgUrl]   = useState<string | null>(null)
  const TypeIcon  = TYPE_ICONS[card.type]
  const typeColor = TYPE_COLOR[card.type]
  const isRunway  = card.type === 'runway'
  const keywords  = getImageKeywords(card.type, card.label)
  const lock      = hashId(card.id)

  useEffect(() => {
    const cached = imgCache.get(card.id)
    if (cached) { setImgUrl(cached); return }

    const w = isRunway ? 400 : 48
    const h = isRunway ? 120 : 48
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: card.type, label: card.label, id: card.id, width: w, height: h }),
        })
        if (!res.ok) throw new Error()
        const { url } = await res.json()
        if (url && !cancelled) {
          imgCache.set(card.id, url)
          setImgError(false)
          setImgUrl(url)
        }
      } catch { /* keep loremflickr placeholder */ }
    }, 100)
    return () => { cancelled = true; clearTimeout(timer) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={dragRef}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(listeners as any)}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(attributes as any)}
      suppressHydrationWarning
      className="group"
      style={{
        ...dragStyle,
        position:      'relative',
        display:       'flex',
        flexDirection: 'column',
        background:    'var(--glass-bg)',
        border:        '1px solid var(--glass-border)',
        borderRadius:  10,
        borderLeft:    `3px solid ${typeColor}`,
        marginBottom:  6,
        overflow:      'hidden',
        opacity:       isDragging ? 0.45 : 1,
        transform:     isDragging ? 'scale(0.97)' : isOverlay ? 'scale(1.02)' : undefined,
        cursor:        isDragging ? 'grabbing' : 'grab',
        transition:    isOverlay ? 'none' : 'opacity 0.15s ease, box-shadow 0.15s ease',
        boxShadow:     isOverlay
          ? '0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.15)'
          : undefined,
        userSelect:    'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* ── Runway: full-width image header ─────────────────────────────── */}
      {isRunway && (
        <div style={{ position: 'relative', width: '100%', height: 120, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: `${card.thumbnailColor}40` }} />
          {!imgError && (
            <img
              src={imgUrl ?? `https://loremflickr.com/400/120/${keywords}?lock=${lock + 1}`}
              loading="lazy"
              alt=""
              onError={() => setImgError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          )}
        </div>
      )}

      {/* ── Main row: thumbnail + text ──────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 10px 6px 10px',
        }}
      >
        {/* Thumbnail — 48×48 image (non-runway only) */}
        {!isRunway && (
          <div
            style={{
              position:     'relative',
              width:        48,
              height:       48,
              borderRadius: 6,
              flexShrink:   0,
              background:   `${card.thumbnailColor}40`,
              border:       `1px solid ${card.thumbnailColor}99`,
              overflow:     'hidden',
            }}
          >
            {!imgError ? (
              <img
                src={imgUrl ?? `https://loremflickr.com/48/48/${keywords}?lock=${lock}`}
                loading="lazy"
                alt=""
                onError={() => setImgError(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <TypeIcon />
              </div>
            )}
          </div>
        )}

        {/* Text content */}
        <div style={{ minWidth: 0, flex: 1 }}>
          {/* Label */}
          <p
            style={{
              fontFamily:   'var(--font-display)',
              fontSize:     12,
              fontWeight:   500,
              color:        'var(--text-primary)',
              whiteSpace:   'nowrap',
              overflow:     'hidden',
              textOverflow: 'ellipsis',
              lineHeight:   '1.3',
              marginBottom: 2,
            }}
          >
            {card.label}
          </p>

          {/* Sublabel */}
          <p
            style={{
              fontFamily:   'var(--font-mono)',
              fontSize:     10,
              color:        'var(--text-secondary)',
              whiteSpace:   'nowrap',
              overflow:     'hidden',
              textOverflow: 'ellipsis',
              lineHeight:   '1.3',
              marginBottom: 4,
            }}
          >
            {card.sublabel}
          </p>

          {/* Source badge */}
          <span
            style={{
              display:       'inline-block',
              fontFamily:    'var(--font-mono)',
              fontSize:      9,
              fontWeight:    500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color:         'var(--text-tertiary)',
              background:    'rgba(255,255,255,0.07)',
              border:        '1px solid rgba(255,255,255,0.08)',
              borderRadius:  4,
              padding:       '1px 5px',
            }}
          >
            {card.source}
          </span>
        </div>
      </div>

      {/* ── Bottom row: thumbs + alignment dots ────────────────────────── */}
      <div
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        '0 8px 6px 9px',
        }}
      >
        {/* Thumbs — hidden until hover (CSS group-hover via inline style trick) */}
        <div
          className="opacity-0 group-hover:opacity-100"
          style={{
            display:    'flex',
            alignItems: 'center',
            gap:        0,
            transition: 'opacity 0.15s ease',
          }}
        >
          <ThumbButton direction="up"   onClick={() => {}} />
          <ThumbButton direction="down" onClick={() => {}} />
        </div>

        {/* Alignment dots */}
        <AlignmentDots hint={card.alignmentHint} />
      </div>
    </div>
  )
}

// ─── Draggable wrapper (calls useDraggable hook) ──────────────────────────────

function DraggableIntakeCard({ card }: { card: IntakeCardType }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id:   card.id,
      data: card,
    })

  const dragStyle: React.CSSProperties = transform
    ? { transform: CSS.Translate.toString(transform) }
    : {}

  return (
    <CardInner
      card={card}
      isDragging={isDragging}
      dragRef={setNodeRef}
      dragStyle={dragStyle}
      listeners={listeners as Record<string, unknown>}
      attributes={attributes as unknown as Record<string, unknown>}
    />
  )
}

// ─── Overlay wrapper (no hooks — used inside DragOverlay) ─────────────────────

function OverlayIntakeCard({ card }: { card: IntakeCardType }) {
  return <CardInner card={card} isOverlay />
}

// ─── Public export: chooses mode based on isOverlay prop ─────────────────────

export default function IntakeCard({
  card,
  isOverlay = false,
}: {
  card:       IntakeCardType
  isOverlay?: boolean
}) {
  if (isOverlay) return <OverlayIntakeCard card={card} />
  return <DraggableIntakeCard card={card} />
}
