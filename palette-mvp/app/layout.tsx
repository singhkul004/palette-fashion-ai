import type { Metadata, Viewport } from 'next'
import { DM_Sans, DM_Mono } from 'next/font/google'
import './globals.css'

// ─── Font registration ────────────────────────────────────────────────────────

const dmSans = DM_Sans({
  subsets:  ['latin'],
  weight:   ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
  display:  'swap',
})

const dmMono = DM_Mono({
  subsets:  ['latin'],
  weight:   ['400', '500'],
  variable: '--font-dm-mono',
  display:  'swap',
})

// ─── Metadata ────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title:       'Palette — Creative OS',
  description: 'AI-powered operating system for fashion Creative Directors.',
}

// ─── Viewport (forces dark color scheme) ─────────────────────────────────────

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor:  '#1c1c1e',
}

// ─── Root layout ─────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${dmSans.variable} ${dmMono.variable}`}
    >
      <body className="h-screen overflow-hidden flex flex-col antialiased">
        {children}
      </body>
    </html>
  )
}
