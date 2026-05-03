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

  // Find all closed cycles with an openDate that has passed
  const { docs: cyclesToOpen } = await payload.find({
    collection: 'pool-cycles',
    where: {
      and: [{ status: { equals: 'closed' } }, { openDate: { less_than_equal: now.toISOString() } }],
    },
    limit: 100,
  })

  if (cyclesToOpen.length === 0) {
    return NextResponse.json({ message: 'No cycles to open', opened: 0, closed: 0 })
  }

  // Close all currently open cycles
  const { docs: openCycles } = await payload.find({
    collection: 'pool-cycles',
    where: { status: { equals: 'open' } },
    limit: 100,
  })

  let closedCount = 0
  for (const cycle of openCycles) {
    await payload.update({
      collection: 'pool-cycles',
      id: cycle.id,
      data: { status: 'closed' },
    })
    closedCount++
  }

  // Open the pending cycles
  let openedCount = 0
  for (const cycle of cyclesToOpen) {
    await payload.update({
      collection: 'pool-cycles',
      id: cycle.id,
      data: { status: 'open' },
    })
    openedCount++
  }

  payload.logger.info(
    `[cron/pool-cycles] Opened ${openedCount} cycle(s), closed ${closedCount} cycle(s)`,
  )

  return NextResponse.json({ message: 'Done', opened: openedCount, closed: closedCount })
}
