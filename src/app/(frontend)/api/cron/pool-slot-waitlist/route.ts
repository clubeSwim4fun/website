import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextResponse } from 'next/server'
import { removeWaitlistEntryAndNotifyNext } from '@/helpers/poolHelper'

export const dynamic = 'force-dynamic'

/**
 * Cron: expire timed-out slot waitlist offers and notify the next person.
 * Should run every minute (e.g. via Vercel Cron or external scheduler).
 *
 * Authorization: Bearer <CRON_SECRET>
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config: configPromise })
  const now = new Date()

  // Find all offered entries whose offer has expired
  const expired = await payload.find({
    collection: 'pool-slot-waitlist',
    where: {
      and: [
        { offerStatus: { equals: 'offered' } },
        { offerExpiresAt: { less_than: now.toISOString() } },
      ],
    },
    limit: 200,
    depth: 0,
  })

  let processed = 0

  for (const entry of expired.docs as any[]) {
    try {
      await payload.update({
        collection: 'pool-slot-waitlist',
        id: entry.id,
        data: { offerStatus: 'expired' } as any,
      })
      const cycleId = typeof entry.cycle === 'object' ? entry.cycle.id : entry.cycle
      await removeWaitlistEntryAndNotifyNext(entry.id, cycleId, entry.slotId, entry.position)
      processed++
    } catch (e) {
      payload.logger.error(`[cron/pool-slot-waitlist] Failed for entry ${entry.id}: ${e}`)
    }
  }

  payload.logger.info(`[cron/pool-slot-waitlist] Expired and re-notified ${processed} entries`)
  return NextResponse.json({ processed })
}
