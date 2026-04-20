import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { getFallbackResults } from '@/lib/mockData'

const client = new Anthropic()

const SYSTEM = `Return ONLY a JSON array of 8 fashion search results for Maison Palette (structured outerwear brand, terracotta palette, matte black hardware). No preamble. Each item: {id, type ('runway'|'sketch'|'material'), label (max 40 chars, specific fashion archive style), sublabel (designer/mill/season, max 35 chars), source ('Brand Archive'|'Studio London'|'Paris Office'|'Material Library'|'Porto Alegre Studio'), thumbnailColor (hex from: #D15521 #C9824C #CFAB89 #2a2a2a #3d3d3d #1e2d40), alignmentHint: {silhouette,palette,hardware,material: 0-100}, territory ('existing'|'adjacent'|'new')}. Mix ~3 runway, 2-3 sketch, 2-3 material.`

function extractJSON(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  return match ? match[1].trim() : text.trim()
}

export async function POST(request: Request) {
  const { query } = await request.json()

  await new Promise((r) => setTimeout(r, 150))

  try {
    const msg = await client.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 400,
      system:     SYSTEM,
      messages:   [{ role: 'user', content: `Query: ${query}` }],
    })

    const text    = msg.content[0].type === 'text' ? msg.content[0].text : ''
    const results = JSON.parse(extractJSON(text))
    return NextResponse.json(Array.isArray(results) ? results : [])
  } catch {
    return NextResponse.json(getFallbackResults(query))
  }
}
