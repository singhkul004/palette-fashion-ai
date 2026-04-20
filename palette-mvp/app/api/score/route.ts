import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { BRAND_PROFILE } from '@/lib/mockData'
import type { ArtifactNode } from '@/lib/types'

const client = new Anthropic()

const SYSTEM = `You are scoring a fashion artifact for brand alignment with Maison Palette. Return ONLY a JSON object with exactly these integer keys: overall (0-100), silhouette (0-100), palette (0-100), hardware (0-100), material (0-100). No preamble, no markdown.`

function extractJSON(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  return match ? match[1].trim() : text.trim()
}

export async function POST(request: Request) {
  const { artifact }: { artifact: ArtifactNode } = await request.json()

  await new Promise((r) => setTimeout(r, 150))

  try {
    const msg = await client.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 400,
      system:     SYSTEM,
      messages:   [{
        role:    'user',
        content: `${BRAND_PROFILE.promptContext}\n\nArtifact: ${artifact.label} (${artifact.type})\nSource: ${artifact.source}\nHint scores: ${JSON.stringify(artifact.alignmentHint)}`,
      }],
    })

    const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
    const data = JSON.parse(extractJSON(text))
    return NextResponse.json(data)
  } catch {
    const h = artifact.alignmentHint
    return NextResponse.json({
      overall:   Math.round((h.silhouette + h.palette + h.hardware + h.material) / 4),
      silhouette: h.silhouette,
      palette:    h.palette,
      hardware:   h.hardware,
      material:   h.material,
    })
  }
}
