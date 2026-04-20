import Anthropic from '@anthropic-ai/sdk'
import { BRAND_PROFILE, TEAM_MEMBERS } from '@/lib/mockData'
import type { ArtifactNode } from '@/lib/types'

const client = new Anthropic()

const SYSTEM = `You write concise fashion production briefs for Maison Palette. Return ONLY 2-3 plain sentences tailored to the recipient's role. No headers, no bullet points, no preamble.`

export async function POST(request: Request) {
  const { artifacts }: { artifacts: ArtifactNode[] } = await request.json()

  const artifactSummary = artifacts
    .map((a) => `${a.label} (${a.type}, score ${a.alignmentScore ?? '?'})`)
    .join(', ')

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        await new Promise((r) => setTimeout(r, 150))

        for (const member of TEAM_MEMBERS) {
          const msg = await client.messages.create({
            model:      'claude-sonnet-4-20250514',
            max_tokens: 400,
            system:     SYSTEM,
            messages:   [{
              role:    'user',
              content: `${BRAND_PROFILE.promptContext}\n\nCanvas: ${artifactSummary}\n\nRecipient: ${member.name}, ${member.role}. Write their brief.`,
            }],
          })

          const text = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
          const event = JSON.stringify({ field: member.briefKey, content: text })
          controller.enqueue(encoder.encode(`data: ${event}\n\n`))
        }
      } catch {
        // On any failure emit empty briefs so the client can close gracefully
        for (const member of TEAM_MEMBERS) {
          const event = JSON.stringify({ field: member.briefKey, content: '' })
          controller.enqueue(encoder.encode(`data: ${event}\n\n`))
        }
      }

      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection:      'keep-alive',
    },
  })
}
