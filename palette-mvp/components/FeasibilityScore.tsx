'use client'

import { useEffect, useRef, useState } from 'react'
import { useCanvasStore } from '@/lib/store'
import { TEAM_MEMBERS } from '@/lib/mockData'

// ─── Animated counter hook ────────────────────────────────────────────────────

function useCounter(target: number | null, duration = 800) {
  const [value, setValue] = useState(0)
  const prevRef = useRef(0)

  useEffect(() => {
    const to = target ?? 0
    const from = prevRef.current
    prevRef.current = to
    if (from === to) return

    let rafId: number
    const startTime = performance.now()

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(from + (to - from) * eased))
      if (progress < 1) rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [target, duration])

  return value
}

// ─── Status helpers ───────────────────────────────────────────────────────────

function scoreStatus(score: number | null) {
  if (score === null) return { label: 'Awaiting Canvas', color: 'rgba(255,255,255,0.2)' }
  if (score > 75)    return { label: 'Clear',            color: 'var(--status-clear)'   }
  if (score > 50)    return { label: 'Watch',            color: 'var(--status-watch)'   }
  return               { label: 'At Risk',           color: 'var(--status-risk)'    }
}

// ─── FeasibilityScore ─────────────────────────────────────────────────────────

export default function FeasibilityScore() {
  const overallFeasibility = useCanvasStore((s) => s.logistics.overallFeasibility)
  const openApproveModal   = useCanvasStore((s) => s.openApproveModal)

  const displayScore        = useCounter(overallFeasibility)
  const { label, color }    = scoreStatus(overallFeasibility)
  const hasScore            = overallFeasibility !== null

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Divider */}
      <div style={{ borderTop: '1px solid var(--glass-border)', margin: '4px 0 14px' }} />

      {/* Label */}
      <p style={{
        fontFamily:    'var(--font-mono)',
        fontSize:      10,
        fontWeight:    500,
        letterSpacing: '0.10em',
        textTransform: 'uppercase',
        color:         'var(--text-tertiary)',
        marginBottom:  8,
      }}>
        Overall Feasibility
      </p>

      {/* Score number + status label */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 18 }}>
        <span style={{
          fontFamily:    'var(--font-mono)',
          fontSize:      52,
          fontWeight:    700,
          lineHeight:    1,
          letterSpacing: '-0.02em',
          color:         hasScore ? color : 'rgba(255,255,255,0.15)',
          transition:    'color 0.4s ease',
        }}>
          {hasScore ? displayScore : '—'}
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      12,
            fontWeight:    500,
            letterSpacing: '0.04em',
            color,
            transition:    'color 0.4s ease',
          }}>
            {label}
          </span>
          {hasScore && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-tertiary)' }}>
              / 100
            </span>
          )}
        </div>
      </div>

      {/* Dispatch section */}
      <p style={{
        fontFamily:    'var(--font-mono)',
        fontSize:      9,
        fontWeight:    500,
        letterSpacing: '0.09em',
        textTransform: 'uppercase',
        color:         'var(--text-tertiary)',
        marginBottom:  8,
      }}>
        Dispatch Reports To
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {TEAM_MEMBERS.map((member) => (
          <button
            key={member.briefKey}
            onClick={() => openApproveModal('global')}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          8,
              padding:      '7px 10px',
              background:   'rgba(255,255,255,0.05)',
              border:       '1px solid rgba(255,255,255,0.09)',
              borderRadius: 8,
              cursor:       'pointer',
              textAlign:    'left',
              width:        '100%',
              transition:   'background 0.13s ease, border-color 0.13s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background    = 'rgba(255,255,255,0.09)'
              e.currentTarget.style.borderColor   = 'rgba(255,255,255,0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background    = 'rgba(255,255,255,0.05)'
              e.currentTarget.style.borderColor   = 'rgba(255,255,255,0.09)'
            }}
          >
            {/* Avatar */}
            <div style={{
              width:          28,
              height:         28,
              borderRadius:   '50%',
              background:     member.avatarColor,
              flexShrink:     0,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
            }}>
              <span style={{
                fontFamily:    'var(--font-mono)',
                fontSize:      10,
                fontWeight:    600,
                color:         'rgba(255,255,255,0.9)',
                letterSpacing: '0.04em',
              }}>
                {member.initials}
              </span>
            </div>

            {/* Name + role */}
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{
                fontFamily:   'var(--font-display)',
                fontSize:     12,
                fontWeight:   500,
                color:        'var(--text-primary)',
                whiteSpace:   'nowrap',
                overflow:     'hidden',
                textOverflow: 'ellipsis',
                lineHeight:   '1.3',
              }}>
                {member.name}
              </p>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize:   10,
                color:      'var(--text-tertiary)',
                lineHeight: '1.3',
              }}>
                {member.role}
              </p>
            </div>

            {/* Chevron */}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, opacity: 0.35 }}>
              <path d="M4.5 2.5L8.5 6L4.5 9.5"
                stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}
