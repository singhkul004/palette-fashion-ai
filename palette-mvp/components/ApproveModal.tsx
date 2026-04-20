'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCanvasStore } from '@/lib/store'
import { TEAM_MEMBERS } from '@/lib/mockData'
import type { TeamMember } from '@/lib/types'

// ─── Brief card ───────────────────────────────────────────────────────────────

function BriefCard({
  member, text, loading,
}: {
  member:  TeamMember
  text:    string
  loading: boolean
}) {
  const [editing,   setEditing]   = useState(false)
  const [editValue, setEditValue] = useState(text)
  const [sent,      setSent]      = useState(false)

  useEffect(() => {
    if (!editing) setEditValue(text)
  }, [text, editing])

  return (
    <div style={{
      flex:          1,
      background:    'var(--glass-bg)',
      border:        '1px solid var(--glass-border)',
      borderRadius:  10,
      padding:       12,
      display:       'flex',
      flexDirection: 'column',
      gap:           8,
      minWidth:      0,
    }}>
      {/* Avatar + name + role */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
        <div>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize:   12,
            fontWeight: 500,
            color:      'var(--text-primary)',
            lineHeight: '1.3',
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
      </div>

      {/* Brief body: skeleton | textarea | text */}
      {loading ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div className="skeleton" style={{ height: 7, width: '100%', borderRadius: 3 }} />
          <div className="skeleton" style={{ height: 7, width: '80%',  borderRadius: 3 }} />
          <div className="skeleton" style={{ height: 7, width: '55%',  borderRadius: 3 }} />
        </div>
      ) : editing ? (
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          style={{
            flex:       1,
            background: 'rgba(255,255,255,0.05)',
            border:     '1px solid rgba(255,255,255,0.12)',
            borderRadius: 6,
            padding:    '6px 8px',
            fontFamily: 'var(--font-mono)',
            fontSize:   11,
            color:      'var(--text-secondary)',
            lineHeight: '1.55',
            resize:     'none',
            minHeight:  60,
            outline:    'none',
          }}
        />
      ) : (
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize:   11,
          color:      'var(--text-secondary)',
          lineHeight: '1.55',
          flex:       1,
        }}>
          {text || '—'}
        </p>
      )}

      {/* Edit / Send row */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        {[
          { label: editing ? 'Done' : 'Edit', action: () => setEditing((v) => !v) },
          {
            label: sent ? '✓ Sent' : 'Send',
            action: () => { setSent(true); setTimeout(() => setSent(false), 2000) },
          },
        ].map(({ label, action }) => (
          <button
            key={label}
            disabled={loading}
            onClick={action}
            style={{
              flex:         1,
              height:       26,
              background:   label === '✓ Sent' ? 'rgba(52,199,89,0.12)' : 'rgba(255,255,255,0.06)',
              border:       `1px solid ${label === '✓ Sent' ? 'rgba(52,199,89,0.4)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 6,
              fontFamily:   'var(--font-mono)',
              fontSize:     10,
              color:        label === '✓ Sent' ? 'var(--status-clear)' : 'var(--text-secondary)',
              cursor:       loading ? 'not-allowed' : 'pointer',
              opacity:      loading ? 0.4 : 1,
              transition:   'all 0.18s ease',
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Ghost card ───────────────────────────────────────────────────────────────

function GhostCard({ label }: { label: string }) {
  return (
    <div style={{
      flex:          1,
      background:    'var(--glass-bg)',
      border:        '1px solid var(--glass-border)',
      borderRadius:  10,
      padding:       12,
      cursor:        'not-allowed',
      display:       'flex',
      flexDirection: 'column',
      gap:           8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none"
          stroke="rgba(255,255,255,0.45)" strokeWidth="1.3"
          strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="6" width="10" height="7" rx="1.5" />
          <path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" />
        </svg>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize:   12,
          fontWeight: 500,
          color:      'rgba(255,255,255,0.55)',
        }}>
          {label}
        </span>
      </div>
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
        padding:       '3px 8px',
        alignSelf:     'flex-start',
      }}>
        Full release
      </span>
    </div>
  )
}

// ─── ApproveModal ─────────────────────────────────────────────────────────────

export default function ApproveModal({ onSent }: { onSent: () => void }) {
  const open              = useCanvasStore((s) => s.approveModalOpen)
  const artifacts         = useCanvasStore((s) => s.artifacts)
  const briefPackage      = useCanvasStore((s) => s.briefPackage)
  const briefStreaming    = useCanvasStore((s) => s.briefStreaming)
  const closeApproveModal = useCanvasStore((s) => s.closeApproveModal)
  const updateBriefField  = useCanvasStore((s) => s.updateBriefField)
  const setBriefStreaming  = useCanvasStore((s) => s.setBriefStreaming)
  const clearBrief        = useCanvasStore((s) => s.clearBrief)

  const [sending, setSending] = useState(false)
  const fetchedRef = useRef(false)

  // Fetch briefs on open, reset on close
  useEffect(() => {
    if (!open) {
      fetchedRef.current = false
      clearBrief()
      return
    }
    if (fetchedRef.current) return
    fetchedRef.current = true
    setBriefStreaming(true)

    fetch('/api/brief', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ artifacts }),
    })
      .then(async (res) => {
        if (!res.body) { setBriefStreaming(false); return }
        const reader  = res.body.getReader()
        const decoder = new TextDecoder()
        let buf = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buf += decoder.decode(value, { stream: true })
          const lines = buf.split('\n')
          buf = lines.pop() ?? ''
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const payload = line.slice(6).trim()
            if (payload === '[DONE]') { setBriefStreaming(false); return }
            try {
              const { field, content } = JSON.parse(payload) as { field: keyof typeof briefPackage & string; content: string }
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              updateBriefField(field as any, content)
            } catch { /* ignore malformed events */ }
          }
        }
        setBriefStreaming(false)
      })
      .catch(() => setBriefStreaming(false))
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSendAll = useCallback(async () => {
    setSending(true)
    await new Promise((r) => setTimeout(r, 1000))
    setSending(false)
    closeApproveModal()
    onSent()
  }, [closeApproveModal, onSent])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="approve-modal"
          initial={{ y: '100%' }}
          animate={{ y: '0%'   }}
          exit={{    y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          style={{
            position:    'absolute',
            bottom:      0,
            left:        0,
            right:       0,
            height:      '58vh',
            zIndex:      50,
            background:  'rgba(20,20,22,0.96)',
            backdropFilter:       'blur(24px) saturate(160%)',
            WebkitBackdropFilter: 'blur(24px) saturate(160%)',
            borderRadius: '16px 16px 0 0',
            borderTop:    '1px solid var(--glass-border)',
            borderLeft:   '1px solid var(--glass-border)',
            borderRight:  '1px solid var(--glass-border)',
            display:      'flex',
            flexDirection: 'column',
            padding:      '0 20px 20px',
            overflow:     'hidden',
          }}
        >
          {/* ── Header ─────────────────────────────────────────────────────── */}
          <div style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            padding:        '16px 0 12px',
            flexShrink:     0,
          }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize:   16,
              fontWeight: 500,
              color:      'var(--text-primary)',
            }}>
              Package for Production
            </span>
            <button
              onClick={closeApproveModal}
              style={{
                width:        28,
                height:       28,
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'center',
                background:   'none',
                border:       'none',
                cursor:       'pointer',
                color:        'var(--text-tertiary)',
                fontSize:     16,
                borderRadius: 6,
                transition:   'background 0.12s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
            >
              ✕
            </button>
          </div>

          {/* ── Artifact thumbnail row ───────────────────────────────────────── */}
          <div style={{
            display:      'flex',
            gap:          8,
            marginBottom: 12,
            flexShrink:   0,
            flexWrap:     'wrap',
          }}>
            {artifacts.map((a) => (
              <div key={a.id} style={{
                display:       'flex',
                flexDirection: 'column',
                alignItems:    'center',
                gap:           4,
              }}>
                <div style={{
                  width:        40,
                  height:       40,
                  borderRadius: 6,
                  background:   `${a.thumbnailColor}88`,
                  border:       `1px solid ${a.thumbnailColor}55`,
                }} />
                <span style={{
                  fontFamily:   'var(--font-mono)',
                  fontSize:     9,
                  color:        'var(--text-tertiary)',
                  maxWidth:     52,
                  textAlign:    'center',
                  overflow:     'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace:   'nowrap',
                }}>
                  {a.label}
                </span>
              </div>
            ))}
          </div>

          {/* ── Divider ─────────────────────────────────────────────────────── */}
          <div style={{
            borderTop:    '1px solid var(--glass-border)',
            marginBottom: 12,
            flexShrink:   0,
          }} />

          {/* ── Cards area (scrollable) ──────────────────────────────────────── */}
          <div style={{
            flex:          1,
            overflowY:     'auto',
            display:       'flex',
            flexDirection: 'column',
            gap:           8,
            minHeight:     0,
          }}>
            {/* Active brief cards */}
            <div style={{ display: 'flex', gap: 8 }}>
              {TEAM_MEMBERS.map((member) => (
                <BriefCard
                  key={member.briefKey}
                  member={member}
                  text={briefPackage?.[member.briefKey] ?? ''}
                  loading={briefStreaming}
                />
              ))}
            </div>

            {/* Ghost cards at 40% opacity */}
            <div style={{ display: 'flex', gap: 8, opacity: 0.4 }}>
              <GhostCard label="Marketing Handoff" />
              <GhostCard label="Tech Pack" />
              {/* spacer to balance flex layout */}
              <div style={{ flex: 1 }} />
            </div>
          </div>

          {/* ── Send All button ──────────────────────────────────────────────── */}
          <button
            onClick={handleSendAll}
            disabled={sending || briefStreaming}
            style={{
              marginTop:      16,
              width:          '100%',
              height:         42,
              borderRadius:   10,
              background:     'rgba(52,199,89,0.10)',
              border:         '1px solid rgba(52,199,89,0.4)',
              boxShadow:      '0 0 16px rgba(52,199,89,0.10)',
              fontFamily:     'var(--font-display)',
              fontSize:       14,
              fontWeight:     500,
              color:          sending ? 'rgba(52,199,89,0.55)' : 'rgba(52,199,89,0.95)',
              cursor:         (sending || briefStreaming) ? 'not-allowed' : 'pointer',
              opacity:        briefStreaming ? 0.45 : 1,
              transition:     'opacity 0.2s ease, color 0.2s ease',
              flexShrink:     0,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            8,
            }}
          >
            {sending ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.65, ease: 'linear' }}
                  style={{
                    display:      'inline-block',
                    width:        14,
                    height:       14,
                    borderRadius: '50%',
                    border:       '1.5px solid rgba(52,199,89,0.25)',
                    borderTopColor: 'rgba(52,199,89,0.8)',
                  }}
                />
                Sending…
              </>
            ) : 'Send All Packages'}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
