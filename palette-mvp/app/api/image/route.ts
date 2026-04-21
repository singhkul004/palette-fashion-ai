import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { BRAND_PROFILE } from '@/lib/mockData'

const client = new Anthropic()

const SYSTEM = `You generate Unsplash search queries for a fashion design app. Return ONLY a single short search phrase (4–10 words). No quotes, no punctuation other than spaces, no explanation.`

function buildPrompt(type: string, label: string): string {
  return `Brand context: ${BRAND_PROFILE.promptContext}

Artifact type: ${type}
Label: ${label}

Rules by type:
- runway: editorial fashion photography, on-model, runway or lookbook. Reflect silhouette details from the label.
- sketch: fashion illustration or flat-lay sketch of the garment. Append "fashion sketch".
- material: close-up textile macro photography. Name the specific material from the label.

Examples:
- "dark structured leather biker jacket editorial fashion photography"
- "terracotta oversized wool coat runway editorial"
- "selvedge denim fabric texture close-up macro"
- "fashion sketch pencil drawing oversized shell jacket"

Generate the query for the artifact above.`
}

function hashId(id: string): number {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) & 0xffff
  return h
}

function orientation(w: number, h: number): string {
  if (w > h * 1.5) return 'landscape'
  if (h > w * 1.5) return 'portrait'
  return 'squarish'
}

export async function POST(request: Request) {
  const { type, label, id, width = 480, height = 320 } = await request.json()

  let aiQuery = `${label} ${type} fashion`
  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 60,
      system: SYSTEM,
      messages: [{ role: 'user', content: buildPrompt(type, label) }],
    })
    const text = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
    if (text) aiQuery = text
  } catch { /* keep raw fallback */ }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  if (accessKey) {
    try {
      const orient = orientation(width, height)
      const res = await fetch(
        `https://api.unsplash.com/photos/random?query=${encodeURIComponent(aiQuery)}&orientation=${orient}&count=1&client_id=${accessKey}`
      )
      if (res.ok) {
        const data = await res.json()
        const photo = Array.isArray(data) ? data[0] : data
        const url = photo?.urls?.small
        if (url) return NextResponse.json({ url })
      }
    } catch { /* fall through */ }
  }

  const terms = aiQuery.replace(/[^a-z0-9 ]/gi, '').split(/\s+/).filter(Boolean).join(',')
  return NextResponse.json({
    url: `https://loremflickr.com/${width}/${height}/${terms}?lock=${hashId(id)}`,
  })
}
