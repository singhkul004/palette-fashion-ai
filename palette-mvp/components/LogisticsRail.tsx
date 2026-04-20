'use client'

import { motion } from 'framer-motion'
import { useCanvasStore } from '@/lib/store'
import type { DimensionKey } from '@/lib/types'
import DimensionCard    from './DimensionCard'
import FeasibilityScore from './FeasibilityScore'

// ─── Card render order ────────────────────────────────────────────────────────

const DIM_ORDER: DimensionKey[] = [
  'moqAlignment',
  'leadTime',
  'materialAvailability',
  'sampleIterationRisk',
  'machineComplexity',
  'factoryCapacity',
  'sustainabilityScore',
]

// ─── Non-factory ghost state ──────────────────────────────────────────────────

function GhostState({ message }: { message: string }) {
  return (
    <div style={{
      flex:           1,
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      gap:            12,
      padding:        '0 32px',
      textAlign:      'center',
    }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--text-tertiary)', lineHeight: '1.5' }}>
        {message}
      </p>
      <span style={{
        fontFamily:    'var(--font-mono)',
        fontSize:      9,
        fontWeight:    500,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color:         'var(--text-tertiary)',
        background:    'rgba(255,255,255,0.06)',
        border:        '1px solid rgba(255,255,255,0.09)',
        borderRadius:  100,
        padding:       '4px 10px',
        marginTop:     4,
      }}>
        Coming in full release
      </span>
    </div>
  )
}

// ─── Locked ghost feature row ─────────────────────────────────────────────────

function GhostItem({ label }: { label: string }) {
  return (
    <div
      title="Available in full release"
      style={{
        display:      'flex',
        alignItems:   'center',
        gap:          8,
        padding:      '9px 12px',
        background:   'rgba(255,255,255,0.03)',
        border:       '1px solid rgba(255,255,255,0.06)',
        borderRadius: 8,
        marginBottom: 8,
        cursor:       'not-allowed',
        opacity:      0.4,
      }}
    >
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none"
        stroke="rgba(255,255,255,0.5)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="10" height="7" rx="1.5" />
        <path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" />
      </svg>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>
        {label}
      </span>
    </div>
  )
}

// ─── LogisticsRail ────────────────────────────────────────────────────────────

export default function LogisticsRail() {
  const activeTab  = useCanvasStore((s) => s.activeTab)
  const logistics  = useCanvasStore((s) => s.logistics)

  return (
    <aside
      style={{
        width:         360,
        flexShrink:    0,
        height:        '100%',
        display:       'flex',
        flexDirection: 'column',
        background:    'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(12px) saturate(140%)',
        WebkitBackdropFilter: 'blur(12px) saturate(140%)',
        borderRight:   '1px solid var(--glass-border)',
        overflow:      'hidden',
      }}
    >
      {activeTab !== 'factory' ? (
        <GhostState
          message={
            activeTab === 'trend'
              ? 'Trend analysis coming in full release'
              : 'SKU performance view coming in full release'
          }
        />
      ) : (
        <>
          {/* ── Header ──────────────────────────────────────────────────── */}
          <div style={{
            display:       'flex',
            alignItems:    'center',
            gap:           8,
            padding:       '14px 16px 12px',
            borderBottom:  '1px solid var(--glass-border)',
            flexShrink:    0,
          }}>
            {/* Pulsing live dot */}
            <motion.div
              animate={{ opacity: [1, 0.35, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width:        6,
                height:       6,
                borderRadius: '50%',
                background:   'var(--status-clear)',
                flexShrink:   0,
              }}
            />
            <span style={{
              fontFamily:    'var(--font-mono)',
              fontSize:      9,
              fontWeight:    500,
              letterSpacing: '0.07em',
              color:         'var(--status-clear)',
              textTransform: 'uppercase',
            }}>
              Live
            </span>
            <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10 }}>·</span>
            <span style={{
              fontFamily:    'var(--font-mono)',
              fontSize:      10,
              fontWeight:    500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color:         'var(--text-tertiary)',
            }}>
              Logistics Graph
            </span>
          </div>

          {/* ── Scrollable body ─────────────────────────────────────────── */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 0' }}>
            {/* 7 dimension cards */}
            {DIM_ORDER.map((key) => (
              <DimensionCard
                key={key}
                cardData={logistics.cards[key]}
                isActive={logistics.cards[key].isActive}
              />
            ))}

            {/* Locked ghost features */}
            <div style={{ marginTop: 4 }}>
              <GhostItem label="Tech Pack Generation" />
              <GhostItem label="Succession Mode"      />
            </div>

            {/* Overall score + team dispatch */}
            <FeasibilityScore />
          </div>
        </>
      )}
    </aside>
  )
}
