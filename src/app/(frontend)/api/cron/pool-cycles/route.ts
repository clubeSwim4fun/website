import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config: configPromise })
  const now = new Date()

  // Get all cycles with openDate defined, sorted by openDate
  const { docs: allCycles } = await payload.find({
    collection: 'pool-cycles',
    where: { openDate: { exists: true } },
    sort: 'openDate',
    limit: 1000,
  })

  if (allCycles.length === 0) {
    return NextResponse.json({ message: 'No cycles with openDate found', opened: 0, closed: 0 })
  }

  let openedCount = 0
  let closedCount = 0

  // For each cycle, determine if it should be open
  for (let i = 0; i < allCycles.length; i++) {
    const cycle = allCycles[i]
    if (!cycle) continue
    const cycleOpenDate = new Date(cycle.openDate as string)

    // Find the next cycle's openDate
    const nextCycle = allCycles[i + 1]
    const nextOpenDate = nextCycle ? new Date(nextCycle.openDate as string) : null

    // Cycle should be open if: today >= openDate AND today < nextCycle.openDate
    const shouldBeOpen = now >= cycleOpenDate && (!nextOpenDate || now < nextOpenDate)
    const currentStatus = cycle.status

    if (shouldBeOpen && currentStatus !== 'open') {
      await payload.update({
        collection: 'pool-cycles',
        id: cycle.id,
        data: { status: 'open' },
      })
      openedCount++
    } else if (!shouldBeOpen && currentStatus === 'open') {
      await payload.update({
        collection: 'pool-cycles',
        id: cycle.id,
        data: { status: 'closed' },
      })
      closedCount++
    }
  }

  payload.logger.info(
    `[cron/pool-cycles] Opened ${openedCount} cycle(s), closed ${closedCount} cycle(s)`,
  )

  return NextResponse.json({ message: 'Done', opened: openedCount, closed: closedCount })
}
