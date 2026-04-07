import { getPayload } from 'payload'
import config from '@payload-config'
import type { Newsletter } from '@/payload-types'
import { isRateLimited } from '@/utilities/trackingRateLimit'

const ALLOWED_ORIGINS = (process.env.NEWSLETTER_ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

const MAX_CLICK_COUNT = 50

function isAllowedUrl(raw: string): boolean {
  try {
    const url = new URL(raw)
    if (!['http:', 'https:'].includes(url.protocol)) return false
    if (ALLOWED_ORIGINS.length === 0) return true
    return ALLOWED_ORIGINS.some((origin) => url.origin === origin || url.hostname === origin)
  } catch {
    return false
  }
}

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  const rawUrl = searchParams.get('url')

  // Validate URL first — always required
  if (!rawUrl || !isAllowedUrl(rawUrl)) {
    return new Response(null, { status: 400 })
  }

  // Invalid token format — still redirect (don't leak info), just skip tracking
  const tokenValid = token && token.length === 32 && /^[0-9a-f]+$/.test(token)

  if (tokenValid && !isRateLimited(token)) {
    try {
      const payload = await getPayload({ config })

      const result = await payload.find({
        collection: 'newsletters',
        where: { 'recipients.trackingToken': { equals: token } },
        limit: 1,
        depth: 0,
      })

      const newsletter = result.docs[0] as Newsletter | undefined
      if (newsletter) {
        const recipients = (newsletter.recipients ?? []) as Array<{
          id?: string
          trackingToken?: string | null
          clickedAt?: string | null
          clickCount?: number | null
        }>

        const idx = recipients.findIndex((r) => r.trackingToken === token)
        if (idx !== -1 && (recipients[idx]!.clickCount ?? 0) < MAX_CLICK_COUNT) {
          const updatedRecipients = recipients.map((r, i) => {
            if (i !== idx) return r
            return {
              ...r,
              clickedAt: r.clickedAt ?? new Date().toISOString(),
              clickCount: (r.clickCount ?? 0) + 1,
            }
          })
          await payload.update({
            collection: 'newsletters',
            id: newsletter.id,
            data: { recipients: updatedRecipients as any },
          })
        }
      }
    } catch {
      // fire-and-forget
    }
  }

  return Response.redirect(rawUrl, 302)
}
