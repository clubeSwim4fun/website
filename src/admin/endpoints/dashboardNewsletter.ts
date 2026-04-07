import type { Endpoint } from 'payload'
import type { Newsletter } from '@/payload-types'

export const dashboardNewsletter: Endpoint = {
  path: '/dashboard/newsletter',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 403 })
    if ((req.user as any).role !== 'admin')
      return Response.json({ error: 'Forbidden' }, { status: 403 })

    const result = await req.payload.find({
      collection: 'newsletters',
      where: { status: { equals: 'sent' } },
      sort: '-sentAt',
      limit: 20,
      depth: 0,
    })

    const newsletters = (result.docs as Newsletter[]).map((nl) => {
      const recipients = (nl.recipients ?? []) as Array<{
        email?: string | null
        openedAt?: string | null
        openCount?: number | null
        clickedAt?: string | null
        clickCount?: number | null
      }>

      const totalSent = recipients.length
      const totalOpened = recipients.filter((r) => r.openedAt || r.clickedAt).length
      const totalClicks = recipients.filter((r) => r.clickedAt).length
      const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0
      const clickRate = totalSent > 0 ? Math.round((totalClicks / totalSent) * 100) : 0

      return {
        id: nl.id,
        subject: nl.subject,
        sentAt: nl.sentAt,
        totalSent,
        totalOpened,
        totalClicks,
        openRate,
        clickRate,
        recipients: recipients.map((r) => ({
          email: r.email ? r.email.replace(/(.{2}).+(@.+)/, '$1***$2') : '—',
          openedAt: r.openedAt ?? r.clickedAt ?? null,
          clickedAt: r.clickedAt ?? null,
          openCount: r.openCount ?? (r.clickedAt ? 1 : 0),
          clickCount: r.clickCount ?? 0,
        })),
      }
    })

    return Response.json({ newsletters })
  },
}
