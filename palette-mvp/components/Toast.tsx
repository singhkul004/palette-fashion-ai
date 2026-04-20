'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Toast({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDone, 4000)
    return () => clearTimeout(id)
  }, [onDone])

  return (
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0,  opacity: 1 }}
      exit={{   x: 40, opacity: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      style={{
        position:       'fixed',
        top:            16,
        right:          16,
        zIndex:         100,
        width:          280,
        background:     'rgba(28,28,30,0.92)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        border:         '1px solid var(--glass-border)',
        borderRadius:   10,
        padding:        16,
        display:        'flex',
        alignItems:     'center',
        gap:            10,
        boxShadow:      '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{
        width:          20,
        height:         20,
        borderRadius:   '50%',
        background:     'var(--status-clear)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        flexShrink:     0,
      }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M1.5 5L4 7.5L8.5 2.5"
            stroke="white" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </div>
      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize:   13,
        color:      'var(--text-primary)',
        lineHeight: '1.4',
      }}>
        Package dispatched — Taste Graph updated
      </p>
    </motion.div>
  )
}
