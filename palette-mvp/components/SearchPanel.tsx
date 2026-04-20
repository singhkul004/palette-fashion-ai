'use client'

import { useCallback } from 'react'
import { useCanvasStore } from '@/lib/store'
import { getFallbackResults } from '@/lib/mockData'
import IntakeCard from './IntakeCard'
import type { ArtifactType, IntakeCard as IntakeCardType } from '@/lib/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const SUGGESTED_QUERIES = [
  'dystopian jacket',
  'terracotta outerwear',
  'structured knitwear',
  'bonded leather',
] as const

const SECTION_CONFIG: { type: ArtifactType; label: string }[] = [
  { type: 'runway',   label: 'Runway'    },
  { type: 'sketch',   label: 'Designs'   },
  { type: 'material', label: 'Materials' },
]

const TYPE_COLOR: Record<ArtifactType, string> = {
  runway:   'var(--type-runway)',
  sketch:   'var(--type-sketch)',
  material: 'var(--type-material)',
}

// ─── Small inner components ───────────────────────────────────────────────────

/** 4-point star sparkle */
function SparkleIcon({ size = 20, opacity = 0.3 }: { size?: number; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" style={{ opacity }}>
      <path
        d="M10 0 L11.8 7.5 L19.5 10 L11.8 12.5 L10 20 L8.2 12.5 L0.5 10 L8.2 7.5 Z"
        fill="white"
      />
    </svg>
  )
}

/** Refresh / re-query icon next to section header */
function RefreshIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
      <path
        d="M10.5 2 C9 0.8 7 0.5 5 1.3 C2.5 2.3 1 4.8 1.5 7.5"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M1.5 9.5 C3 10.8 5 11.2 7 10.5 C9.5 9.5 11 7 10.5 4"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <polyline
        points="10.5,1.5 10.5,3.5 8.5,3.5"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Suggested query pill */
function SuggestionPill({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display:       'inline-flex',
        alignItems:    'center',
        height:        26,
        padding:       '0 10px',
        borderRadius:  100,
        background:    'rgba(255,255,255,0.06)',
        border:        '1px solid rgba(255,255,255,0.11)',
        fontFamily:    'var(--font-mono)',
        fontSize:      10,
        fontWeight:    500,
        letterSpacing: '0.03em',
        color:         'var(--text-secondary)',
        cursor:        'pointer',
        transition:    'background 0.13s ease, color 0.13s ease',
        whiteSpace:    'nowrap',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.11)'
        e.currentTarget.style.color = 'var(--text-primary)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
        e.currentTarget.style.color = 'var(--text-secondary)'
      }}
    >
      {label}
    </button>
  )
}

/** Section header row */
function SectionHeader({
  label,
  count,
  typeColor,
}: {
  label:     string
  count:     number
  typeColor: string
}) {
  return (
    <div
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        paddingBottom:  6,
        marginBottom:   2,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Type color dot */}
        <div
          style={{
            width:        6,
            height:       6,
            borderRadius: '50%',
            background:   typeColor,
            flexShrink:   0,
          }}
        />
        {/* Label */}
        <span
          style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      9,
            fontWeight:    500,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color:         'var(--text-tertiary)',
          }}
        >
          {label}
        </span>
        {/* Count badge */}
        {count > 0 && (
          <span
            style={{
              fontFamily:    'var(--font-mono)',
              fontSize:      9,
              color:         'rgba(255,255,255,0.18)',
              background:    'rgba(255,255,255,0.06)',
              padding:       '0 5px',
              borderRadius:  4,
              lineHeight:    '16px',
            }}
          >
            {count}
          </span>
        )}
      </div>
      {/* Refresh icon */}
      <RefreshIcon />
    </div>
  )
}

/** Skeleton card placeholder while loading */
function SkeletonCard() {
  return (
    <div
      style={{
        display:       'flex',
        alignItems:    'center',
        gap:           10,
        padding:       '8px 10px',
        background:    'rgba(255,255,255,0.04)',
        border:        '1px solid rgba(255,255,255,0.06)',
        borderRadius:  10,
        borderLeft:    '3px solid rgba(255,255,255,0.06)',
        marginBottom:  6,
      }}
    >
      {/* Thumbnail skeleton */}
      <div
        className="skeleton"
        style={{ width: 44, height: 44, borderRadius: 6, flexShrink: 0 }}
      />
      {/* Text skeleton */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className="skeleton" style={{ height: 10, width: '80%', borderRadius: 3 }} />
        <div className="skeleton" style={{ height: 8,  width: '55%', borderRadius: 3 }} />
        <div className="skeleton" style={{ height: 8,  width: '40%', borderRadius: 3 }} />
      </div>
    </div>
  )
}

/** Skeleton section (header + 2 skeleton cards) */
function SkeletonSection({ label }: { label: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          height:       10,
          width:        60,
          borderRadius: 3,
          marginBottom: 8,
          opacity:      0.4,
        }}
        className="skeleton"
      />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  )
}

// ─── State: empty ─────────────────────────────────────────────────────────────

function EmptyState({ onSearch }: { onSearch: (q: string) => void }) {
  return (
    <div
      style={{
        flex:           1,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '0 20px',
        gap:            12,
        textAlign:      'center',
      }}
    >
      <SparkleIcon size={22} opacity={0.22} />

      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontSize:   13,
          fontWeight: 400,
          color:      'var(--text-secondary)',
          lineHeight: '1.5',
        }}
      >
        Search your brand universe
      </p>

      {/* Suggested query pills */}
      <div
        style={{
          display:        'flex',
          flexWrap:       'wrap',
          gap:            6,
          justifyContent: 'center',
          marginTop:      4,
        }}
      >
        {SUGGESTED_QUERIES.map((q) => (
          <SuggestionPill key={q} label={q} onClick={() => onSearch(q)} />
        ))}
      </div>
    </div>
  )
}

// ─── State: loading ───────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div style={{ padding: '12px 12px 0' }}>
      {SECTION_CONFIG.map(({ label }) => (
        <SkeletonSection key={label} label={label} />
      ))}
    </div>
  )
}

// ─── State: results ───────────────────────────────────────────────────────────

function ResultsState({
  results,
  query,
}: {
  results: IntakeCardType[]
  query:   string
}) {
  const grouped = SECTION_CONFIG.map(({ type, label }) => ({
    type,
    label,
    typeColor: TYPE_COLOR[type],
    cards:     results.filter((r) => r.type === type).slice(0, 3),
  }))

  return (
    <div
      style={{
        flex:     1,
        overflow: 'hidden',  // clips to max 3 per section — no scroll
        padding:  '10px 12px 0',
      }}
    >
      {/* Query attribution */}
      <div
        style={{
          fontFamily:    'var(--font-mono)',
          fontSize:      9,
          letterSpacing: '0.06em',
          color:         'var(--text-tertiary)',
          marginBottom:  10,
          whiteSpace:    'nowrap',
          overflow:      'hidden',
          textOverflow:  'ellipsis',
        }}
      >
        ✦ {results.length} results for &ldquo;{query}&rdquo;
      </div>

      {grouped.map(({ type, label, typeColor, cards }) => {
        if (cards.length === 0) return null
        return (
          <div key={type} style={{ marginBottom: 10 }}>
            <SectionHeader label={label} count={cards.length} typeColor={typeColor} />
            {cards.map((card) => (
              <IntakeCard key={card.id} card={card} />
            ))}
          </div>
        )
      })}
    </div>
  )
}

// ─── SearchPanel ──────────────────────────────────────────────────────────────

export default function SearchPanel() {
  const searchQuery    = useCanvasStore((s) => s.searchQuery)
  const searchResults  = useCanvasStore((s) => s.searchResults)
  const searchLoading  = useCanvasStore((s) => s.searchLoading)
  const setSearch      = useCanvasStore((s) => s.setSearch)
  const setSearchResults = useCanvasStore((s) => s.setSearchResults)
  const setSearchLoading = useCanvasStore((s) => s.setSearchLoading)

  // ── Search action ──────────────────────────────────────────────────────────
  // Falls back to SEARCH_RESULT_BANK if /api/search isn't live yet (Phase 6).

  const performSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) return
      setSearch(query)
      setSearchLoading(true)

      try {
        const res = await fetch('/api/search', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ query }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setSearchResults(Array.isArray(data) ? data : [])
      } catch {
        // Pre-API fallback: serve relevant mock data
        setSearchResults(getFallbackResults(query))
      } finally {
        setSearchLoading(false)
      }
    },
    [setSearch, setSearchResults, setSearchLoading]
  )

  // ── Render ─────────────────────────────────────────────────────────────────

  const showEmpty   = !searchQuery && !searchLoading
  const showLoading =  searchLoading
  const showResults = !searchLoading && searchResults.length > 0

  return (
    <aside
      style={{
        width:       300,
        flexShrink:  0,
        height:      '100%',
        display:     'flex',
        flexDirection: 'column',
        background:  'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(16px) saturate(160%)',
        WebkitBackdropFilter: 'blur(16px) saturate(160%)',
        borderLeft:  '1px solid var(--glass-border)',
        overflow:    'hidden',
        // No border-radius on the left — flush with canvas edge
        borderRadius: 0,
      }}
    >
      {showEmpty   && <EmptyState   onSearch={performSearch} />}
      {showLoading && <LoadingState />}
      {showResults && <ResultsState results={searchResults} query={searchQuery} />}

      {/* No results state (searched but got nothing) */}
      {!showEmpty && !showLoading && !showResults && (
        <div
          style={{
            flex:           1,
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            8,
          }}
        >
          <SparkleIcon opacity={0.15} />
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize:   12,
              color:      'var(--text-tertiary)',
            }}
          >
            No results found
          </p>
          <button
            onClick={() => { setSearch(''); setSearchResults([]) }}
            style={{
              fontFamily:    'var(--font-mono)',
              fontSize:      10,
              color:         'var(--text-tertiary)',
              background:    'none',
              border:        'none',
              cursor:        'pointer',
              textDecoration: 'underline',
            }}
          >
            Clear search
          </button>
        </div>
      )}
    </aside>
  )
}
