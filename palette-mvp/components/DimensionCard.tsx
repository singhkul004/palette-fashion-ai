'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { DimensionCardData, DimensionKey, DimensionStatus } from '@/lib/types'

// ─── Status helpers ───────────────────────────────────────────────────────────

function sColor(status: DimensionStatus) {
  switch (status) {
    case 'clear': return 'var(--status-clear)'
    case 'watch': return 'var(--status-watch)'
    case 'risk':  return 'var(--status-risk)'
    default:      return 'rgba(255,255,255,0.25)'
  }
}

function sBg(status: DimensionStatus) {
  switch (status) {
    case 'clear': return 'rgba(52,199,89,0.14)'
    case 'watch': return 'rgba(255,149,0,0.14)'
    case 'risk':  return 'rgba(255,59,48,0.14)'
    default:      return 'rgba(255,255,255,0.06)'
  }
}

function sLabel(status: DimensionStatus) {
  switch (status) {
    case 'clear': return 'Clear'
    case 'watch': return 'Watch'
    case 'risk':  return 'At Risk'
    default:      return '—'
  }
}

// ─── Historical analogs mock data ─────────────────────────────────────────────

const ANALOGS: Record<DimensionKey, { date: string; name: string; outcome: string }[]> = {
  moqAlignment: [
    { date: 'FW23', name: 'Selvedge Denim Biker',  outcome: 'Gap closed via SS reorder' },
    { date: 'SS24', name: 'Terracotta Shell',        outcome: '+8% unit uplift approved'  },
    { date: 'AW22', name: 'Bonded Neoprene Jacket', outcome: 'Factory switch required'   },
  ],
  leadTime: [
    { date: 'FW23', name: 'Biker Jacket',    outcome: 'Overrun by 9 days'      },
    { date: 'SS24', name: 'Cinched Trench',  outcome: '3-day delay, recovered' },
    { date: 'AW25', name: 'Oversized Shell', outcome: 'On time, 2-day buffer'  },
  ],
  materialAvailability: [
    { date: 'FW24', name: 'Terracotta Coat', outcome: 'Mills confirmed in 24h'         },
    { date: 'SS24', name: 'Denim Biker',     outcome: 'Selvedge secured at cost'       },
    { date: 'AW23', name: 'Wool Bouclé',     outcome: 'Biella stock depleted, rerouted'},
  ],
  sampleIterationRisk: [
    { date: 'FW23', name: 'Structured Biker', outcome: '4 rounds, 6-wk delay' },
    { date: 'SS24', name: 'Cinched Trench',   outcome: '2 rounds, approved'   },
    { date: 'AW24', name: 'Shell Jacket',     outcome: '3 rounds, on target'  },
  ],
  machineComplexity: [
    { date: 'FW22', name: 'Denim Shell',    outcome: 'Machine transfer smooth' },
    { date: 'SS23', name: 'Wool Jacket',    outcome: 'Setup in 2 days'         },
    { date: 'AW24', name: 'Neoprene Coat',  outcome: 'New fixture required'    },
  ],
  factoryCapacity: [
    { date: 'FW23', name: 'Biker + Shell',  outcome: 'Guangdong absorbed both' },
    { date: 'SS24', name: 'Trench run',     outcome: '3-day slip from target'  },
    { date: 'AW22', name: 'Leather jacket', outcome: 'Secondary factory used'  },
  ],
  sustainabilityScore: [
    { date: 'FW24', name: 'Terracotta Coat',  outcome: 'ESG threshold passed'       },
    { date: 'SS24', name: 'Selvedge Denim',   outcome: '+2% water vs avg, approved' },
    { date: 'AW23', name: 'Bouclé Wool',      outcome: 'Biella certified organic'   },
  ],
}

// ─── DimensionCard ────────────────────────────────────────────────────────────

interface Props {
  cardData: DimensionCardData
  isActive: boolean
}

export default function DimensionCard({ cardData, isActive }: Props) {
  const [expanded, setExpanded] = useState(false)
  const color  = sColor(cardData.status)
  const bg     = sBg(cardData.status)
  const label  = sLabel(cardData.status)
  const analogs = ANALOGS[cardData.key]

  return (
    <motion.div
      animate={{ opacity: isActive ? 1 : 0.35 }}
      transition={{ duration: 0.4 }}
      style={{ marginBottom: 8 }}
    >
      {/* ── Card shell ────────────────────────────────────────────────────── */}
      <div
        onClick={isActive ? () => setExpanded((v) => !v) : undefined}
        style={{
          background:   'var(--glass-bg)',
          border:       '1px solid var(--glass-border)',
          borderBottom: expanded && isActive ? 'none' : '1px solid var(--glass-border)',
          borderRadius: expanded && isActive ? '8px 8px 0 0' : 8,
          padding:      '10px 12px',
          cursor:       isActive ? 'pointer' : 'default',
          userSelect:   'none',
        }}
      >
        {/* Header: label + status badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{
            fontSize:   13,
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            color:      'var(--text-primary)',
          }}>
            {cardData.label}
          </span>
          <span style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      10,
            fontWeight:    500,
            letterSpacing: '0.04em',
            color:         isActive ? color : 'rgba(255,255,255,0.25)',
            background:    isActive ? bg    : 'rgba(255,255,255,0.05)',
            border:        `1px solid ${isActive ? color + '40' : 'rgba(255,255,255,0.07)'}`,
            borderRadius:  100,
            padding:       '2px 7px',
          }}>
            {isActive ? label : '—'}
          </span>
        </div>

        {/* Score bar + explanation: animate in when active */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              key="body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{ overflow: 'hidden' }}
            >
              {/* Score bar */}
              <div style={{
                height: 3, background: 'rgba(255,255,255,0.08)',
                borderRadius: 2, marginBottom: 7, overflow: 'hidden',
              }}>
                <motion.div
                  key={`bar-${cardData.key}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${cardData.score}%` }}
                  transition={{ duration: 0.85, ease: 'easeOut', delay: 0.2 }}
                  style={{ height: '100%', background: color, borderRadius: 2 }}
                />
              </div>

              {/* Explanation */}
              <p style={{
                fontFamily:  'var(--font-mono)',
                fontSize:    11,
                color:       'var(--text-secondary)',
                lineHeight:  '1.55',
              }}>
                {cardData.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Historical analogs (expand on click) ─────────────────────────── */}
      <AnimatePresence>
        {isActive && expanded && (
          <motion.div
            key="analogs"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              background:   'rgba(255,255,255,0.03)',
              border:       '1px solid var(--glass-border)',
              borderRadius: '0 0 8px 8px',
              padding:      '8px 12px 10px',
            }}>
              {/* Column headers */}
              <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr', gap: 8, marginBottom: 6 }}>
                {['Date', 'Analog', 'Outcome'].map((h) => (
                  <span key={h} style={{
                    fontFamily: 'var(--font-mono)', fontSize: 9,
                    color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}>
                    {h}
                  </span>
                ))}
              </div>
              {analogs.map((row, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr', gap: 8, marginBottom: 5 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.38)' }}>
                    {row.date}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {row.name}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-tertiary)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {row.outcome}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
