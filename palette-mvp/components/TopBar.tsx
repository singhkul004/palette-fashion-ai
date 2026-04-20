'use client'

import { useState, useRef, useCallback } from 'react'
import { useCanvasStore } from '@/lib/store'

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'trend' | 'skus' | 'factory'

const TABS: { id: Tab; label: string }[] = [
  { id: 'trend',   label: 'Trend'   },
  { id: 'skus',    label: 'SKUs'    },
  { id: 'factory', label: 'Factory' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Geometric "P" monogram — stroked, with a horizontal cut through the bowl */
function PMonogram() {
  return (
    <svg
      width="22"
      height="28"
      viewBox="0 0 22 28"
      fill="none"
      aria-label="Palette"
    >
      {/* Vertical stem */}
      <rect x="0" y="0" width="4.5" height="28" rx="0.5" fill="white" />

      {/* Bowl shell — outer path minus inner path via evenodd creates a ring */}
      <path
        fillRule="evenodd"
        fill="white"
        d={[
          // Outer bowl: top-left → top-right curve → bottom-right curve → bottom-left
          'M4.5 0 H14 C18.5 0 21.5 3 21.5 7 C21.5 11 18.5 14 14 14 H4.5 Z',
          // Inner cutout (evenodd rule creates hollow)
          'M4.5 3 H13.5 C16.5 3 18 5 18 7 C18 9 16.5 11 13.5 11 H4.5 Z',
        ].join(' ')}
      />

      {/* Horizontal cut — architectural notch bisecting the bowl shell */}
      {/* Uses canvas bg to "cut" through the solid ring of the bowl */}
      <rect x="4.5" y="6" width="17" height="2.5" fill="#1c1c1e" />
    </svg>
  )
}

/** 4-point star sparkle — pulses while loading */
function SparkleIcon({ loading }: { loading: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      style={{
        opacity:   loading ? undefined : 0.5,
        animation: loading ? 'count-pulse 1s ease-in-out infinite' : undefined,
      }}
    >
      <path
        d="M7 0 L8.2 5.2 L13.5 7 L8.2 8.8 L7 14 L5.8 8.8 L0.5 7 L5.8 5.2 Z"
        fill="rgba(255,255,255,0.75)"
      />
    </svg>
  )
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

export default function TopBar() {
  const activeTab      = useCanvasStore((s) => s.activeTab)
  const setActiveTab   = useCanvasStore((s) => s.setActiveTab)
  const setSearch      = useCanvasStore((s) => s.setSearch)
  const setSearchResults = useCanvasStore((s) => s.setSearchResults)
  const setSearchLoading = useCanvasStore((s) => s.setSearchLoading)
  const searchLoading  = useCanvasStore((s) => s.searchLoading)

  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // ── Search handler ────────────────────────────────────────────────────────

  const handleSearch = useCallback(
    async (query: string) => {
      const trimmed = query.trim()
      if (!trimmed) return

      setSearch(trimmed)
      setSearchLoading(true)

      try {
        const res = await fetch('/api/search', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ query: trimmed }),
        })

        if (!res.ok) throw new Error('Search failed')
        const results = await res.json()
        setSearchResults(Array.isArray(results) ? results : [])
      } catch {
        // Fallback: clear results gracefully — SearchPanel shows empty state
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    },
    [setSearch, setSearchResults, setSearchLoading]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch(inputValue)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <header
      className="flex-none flex items-center gap-3 px-4"
      style={{
        height:     52,
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid var(--glass-border)',
      }}
    >
      {/* ── Left: P monogram ───────────────────────────────────────────────── */}
      <div className="flex-none flex items-center" style={{ marginRight: 4 }}>
        <PMonogram />
      </div>

      {/* ── Center-left: Tab pills ─────────────────────────────────────────── */}
      <div className="flex-none flex items-center gap-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                height:       30,
                padding:      '0 12px',
                borderRadius: 100,
                fontSize:     12,
                fontWeight:   500,
                fontFamily:   'var(--font-display)',
                cursor:       'pointer',
                transition:   'background 0.15s ease, color 0.15s ease',
                border:       isActive
                  ? '1px solid rgba(255,255,255,0.3)'
                  : '1px solid rgba(255,255,255,0.1)',
                background:   isActive
                  ? 'rgba(255,255,255,0.92)'
                  : 'rgba(255,255,255,0.06)',
                color:        isActive
                  ? '#1c1c1e'
                  : 'rgba(255,255,255,0.55)',
                backdropFilter: isActive ? 'none' : 'blur(8px)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.10)'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.75)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.55)'
                }
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Center: AI search input ────────────────────────────────────────── */}
      <div className="relative flex-1 min-w-0">
        {/* Sparkle icon — left gutter */}
        <div
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <SparkleIcon loading={searchLoading} />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search your brand universe..."
          style={{
            width:          '100%',
            height:         34,
            borderRadius:   100,
            background:     'rgba(255,255,255,0.07)',
            border:         '1px solid rgba(255,255,255,0.10)',
            paddingLeft:    36,
            paddingRight:   88,
            fontSize:       13,
            fontFamily:     'var(--font-display)',
            color:          'var(--text-primary)',
            outline:        'none',
            caretColor:     'rgba(255,255,255,0.7)',
            transition:     'box-shadow 0.15s ease, border-color 0.15s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.3)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'
          }}
        />

        {/* "17 sources" badge — right gutter */}
        <div
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <span
            style={{
              fontFamily:   'var(--font-mono)',
              fontSize:     10,
              fontWeight:   500,
              letterSpacing: '0.06em',
              color:        'rgba(255,255,255,0.28)',
            }}
          >
            17 sources
          </span>
        </div>
      </div>

      {/* ── Right: CD avatar ──────────────────────────────────────────────── */}
      <div
        className="flex-none flex items-center justify-center"
        style={{
          width:        32,
          height:       32,
          borderRadius: '50%',
          background:   'linear-gradient(135deg, #7C5CBF 0%, #4A90D9 100%)',
          border:       '1.5px solid rgba(255,255,255,0.2)',
          flexShrink:   0,
        }}
        title="Creative Director"
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize:   10,
            fontWeight: 500,
            color:      'rgba(255,255,255,0.9)',
            letterSpacing: '0.04em',
          }}
        >
          CD
        </span>
      </div>
    </header>
  )
}
