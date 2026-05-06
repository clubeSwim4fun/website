import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { removeWaitlistEntryAndNotifyNext } from '@/helpers/poolHelper'
import { formatSlotDay, formatSlotTime } from '@/helpers/slotFormatHelper'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const token = searchParams.get('token')
  const action = searchParams.get('action') as 'accept' | 'reject' | null

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? ''

  if (!token || (action !== 'accept' && action !== 'reject')) {
    return NextResponse.redirect(`${baseUrl}/pool/slot-waitlist/invalid`)
  }

  const payload = await getPayload({ config })

  // Find the waitlist entry by token
  const result = await payload.find({
    collection: 'pool-slot-waitlist',
    where: { offerToken: { equals: token } },
    depth: 1,
    limit: 1,
  })

  const entry = result.docs[0] as any
  if (!entry) {
    return NextResponse.redirect(`${baseUrl}/pool/slot-waitlist/invalid`)
  }

  // Check if already handled
  if (entry.offerStatus === 'accepted') {
    return NextResponse.redirect(`${baseUrl}/pool/slot-waitlist/already-accepted`)
  }
  if (entry.offerStatus === 'rejected' || entry.offerStatus === 'expired') {
    return NextResponse.redirect(`${baseUrl}/pool/slot-waitlist/expired`)
  }

  // Check expiry
  const isExpired = entry.offerExpiresAt && new Date(entry.offerExpiresAt) < new Date()
  if (isExpired) {
    await payload.update({
      collection: 'pool-slot-waitlist',
      id: entry.id,
      data: { offerStatus: 'expired' } as any,
    })
    await removeWaitlistEntryAndNotifyNext(
      entry.id,
      entry.cycle?.id ?? entry.cycle,
      entry.slotId,
      entry.position,
    )
    return NextResponse.redirect(`${baseUrl}/pool/slot-waitlist/expired`)
  }

  const cycleId = typeof entry.cycle === 'object' ? entry.cycle.id : entry.cycle
  const slotId: string = entry.slotId

  if (action === 'reject') {
    await payload.update({
      collection: 'pool-slot-waitlist',
      id: entry.id,
      data: { offerStatus: 'rejected' } as any,
    })
    await removeWaitlistEntryAndNotifyNext(entry.id, cycleId, slotId, entry.position)
    return NextResponse.redirect(`${baseUrl}/pool/slot-waitlist/rejected`)
  }

  // action === 'accept' — create the registration
  // Find the cycle to get slot details
  const cycle = (await payload.findByID({ collection: 'pool-cycles', id: cycleId })) as any
  const allSlots: Array<{
    slotId: string
    dateTime: string
    duration: number
    maxAttendance: number
  }> = []
  for (const week of cycle?.weeks ?? []) {
    for (const slot of week.slots ?? []) {
      allSlots.push(slot)
    }
  }
  const slotDef = allSlots.find((s) => s.slotId === slotId)
  if (!slotDef) {
    return NextResponse.redirect(`${baseUrl}/pool/slot-waitlist/invalid`)
  }

  // Check capacity one more time
  const regCount = await payload.find({
    collection: 'pool-slot-registrations',
    where: { and: [{ cycle: { equals: cycleId } }, { slotId: { equals: slotId } }] },
    limit: 0,
  })
  if (regCount.totalDocs >= slotDef.maxAttendance) {
    // Slot filled up while this person was deciding — move them to next
    await payload.update({
      collection: 'pool-slot-waitlist',
      id: entry.id,
      data: { offerStatus: 'expired' } as any,
    })
    await removeWaitlistEntryAndNotifyNext(entry.id, cycleId, slotId, entry.position)
    return NextResponse.redirect(`${baseUrl}/pool/slot-waitlist/expired`)
  }

  const athleteId = typeof entry.athlete === 'object' ? entry.athlete.id : entry.athlete

  // Create the registration
  await payload.create({
    collection: 'pool-slot-registrations',
    data: {
      athlete: athleteId,
      cycle: cycleId,
      slotId,
      slotDay: formatSlotDay(slotDef.dateTime),
      slotTime: formatSlotTime(slotDef.dateTime, slotDef.duration),
    } as any,
  })

  // Mark entry as accepted and remove from waitlist, shift others
  await payload.update({
    collection: 'pool-slot-waitlist',
    id: entry.id,
    data: { offerStatus: 'accepted' } as any,
  })

  // Remove from waitlist and shift positions (don't notify next — slot is now taken)
  await payload.delete({ collection: 'pool-slot-waitlist', id: entry.id })

  const later = await payload.find({
    collection: 'pool-slot-waitlist',
    where: {
      and: [
        { cycle: { equals: cycleId } },
        { slotId: { equals: slotId } },
        { position: { greater_than: entry.position } },
      ],
    },
    limit: 1000,
  })
  for (const e of later.docs as any[]) {
    await payload.update({
      collection: 'pool-slot-waitlist',
      id: e.id,
      data: { position: (e.position as number) - 1 } as any,
    })
  }

  return NextResponse.redirect(`${baseUrl}/pool/slot-waitlist/accepted`)
}
