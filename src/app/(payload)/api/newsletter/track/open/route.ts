import { getPayload } from 'payload'
import config from '@payload-config'
import type { Newsletter } from '@/payload-types'
import { isRateLimited } from '@/utilities/trackingRateLimit'

// 1x1 transparent GIF
const PIXEL = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')

const PIXEL_RESPONSE = new Response(PIXEL, {
  status: 200,
  headers: {
    'Content-Type': 'image/gif',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  },
})

// Cap to avoid inflating counts from aggressive proxy pre-fetching (e.g. Gmail)
const MAX_OPEN_COUNT = 20

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  // Always return the pixel — never leak errors
  if (!token || token.length !== 32 || !/^[0-9a-f]+$/.test(token)) {
    return PIXEL_RESPONSE
  }

  if (isRateLimited(token)) return PIXEL_RESPONSE

  try {
    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'newsletters',
      where: { 'recipients.trackingToken': { equals: token } },
      limit: 1,
      depth: 0,
    })

    const newsletter = result.docs[0] as Newsletter | undefined
    if (!newsletter) return PIXEL_RESPONSE

    const recipients = (newsletter.recipients ?? []) as Array<{
      id?: string
      trackingToken?: string | null
      openedAt?: string | null
      openCount?: number | null
    }>

    const idx = recipients.findIndex((r) => r.trackingToken === token)
    if (idx === -1) return PIXEL_RESPONSE

    const rec = recipients[idx]!
    if ((rec.openCount ?? 0) >= MAX_OPEN_COUNT) return PIXEL_RESPONSE

    const updatedRecipients = recipients.map((r, i) => {
      if (i !== idx) return r
      return {
        ...r,
        openedAt: r.openedAt ?? new Date().toISOString(),
        openCount: (r.openCount ?? 0) + 1,
      }
    })

    await payload.update({
      collection: 'newsletters',
      id: newsletter.id,
      data: { recipients: updatedRecipients as any },
    })
  } catch {
    // fire-and-forget — never break the pixel response
  }

  return PIXEL_RESPONSE
}
