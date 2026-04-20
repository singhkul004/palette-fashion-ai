/**
 * Tailwind CSS configuration — Palette design system
 *
 * This file is read by Tailwind v4 via the `@config "../tailwind.config.ts"`
 * directive in app/globals.css. The CSS `@theme {}` block in globals.css
 * takes precedence for any conflicting values; this file handles JS-based
 * extension (fontFamily arrays, nested color objects, etc.).
 *
 * Reference: https://tailwindcss.com/docs/configuration
 */

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],

  theme: {
    extend: {
      // ── Colors ───────────────────────────────────────────────────────────
      colors: {
        // Canvas background
        paletteCanvas: '#1c1c1e',

        // Glass white tints — used as bg-glassWhite-7, bg-glassWhite-11, etc.
        glassWhite: {
          4:      'rgba(255, 255, 255, 0.04)',
          7:      'rgba(255, 255, 255, 0.07)',
          11:     'rgba(255, 255, 255, 0.11)',
          15:     'rgba(255, 255, 255, 0.15)',
          border: 'rgba(255, 255, 255, 0.12)',
          edge:   'rgba(255, 255, 255, 0.08)',
        },

        // Artifact type accents
        runway:   '#D15521',
        sketch:   '#4A90D9',
        material: '#7CB87C',

        // Logistics status
        statusClear:   '#34C759',
        statusWatch:   '#FF9500',
        statusRisk:    '#FF3B30',
        statusDormant: 'rgba(255, 255, 255, 0.18)',

        // Brand palette
        brand: {
          terracotta: '#D15521',
          amber:      '#C9824C',
          sand:       '#CFAB89',
          void:       '#1a1a1a',
        },
      },

      // ── Typography ───────────────────────────────────────────────────────
      fontFamily: {
        display: ['var(--font-dm-sans)', 'DM Sans', 'sans-serif'],
        mono:    ['var(--font-dm-mono)', 'DM Mono', 'monospace'],
      },

      // ── Backdrop blur ────────────────────────────────────────────────────
      backdropBlur: {
        glass: '20px',
        rail:  '12px',
        panel: '16px',
      },

      // ── Border colors ────────────────────────────────────────────────────
      borderColor: {
        glassEdge:   'rgba(255, 255, 255, 0.12)',
        railEdge:    'rgba(255, 255, 255, 0.08)',
        statusClear: '#34C759',
        statusWatch: '#FF9500',
        statusRisk:  '#FF3B30',
      },

      // ── Border radius ────────────────────────────────────────────────────
      borderRadius: {
        glass:    '12px',
        glassSm:  '8px',
        glassXs:  '6px',
        pill:     '100px',
      },

      // ── Box shadow ───────────────────────────────────────────────────────
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
        card:  '0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
        modal: '0 24px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)',
      },

      // ── Animation ────────────────────────────────────────────────────────
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(4px) scale(0.98)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)'      },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)'    },
        },
        skeletonShimmer: {
          '0%':   { backgroundPosition:  '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        'fade-in':  'fadeIn 0.2s ease-out both',
        'slide-up': 'slideUp 0.25s ease-out both',
        'shimmer':  'skeletonShimmer 1.6s ease-in-out infinite',
      },
    },
  },
}

export default config
