import { getMeUser } from '@/utilities/getMeUser'
import {
  getOpenCycle,
  getActiveCount,
  getWaitlistCount,
  getAthleteSubscription,
  computePoolPageState,
} from '@/helpers/poolHelper'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { PoolSubscription } from '@/payload-types'
import { PoolPageClient } from './pool-page.client'

const PoolPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ confirmed?: string }>
}) => {
  const { locale } = await params
  const { confirmed } = await searchParams
  await getTranslations({ locale, namespace: 'PoolSubscription' })

  const { user } = await getMeUser({
    nullUserRedirect: `/${locale}/sign-in?callbackUrl=/${locale}/pool`,
  })

  if (!user) return redirect(`/${locale}/sign-in?callbackUrl=/${locale}/pool`)

  const cycle = await getOpenCycle()

  let activeCount = 0
  let waitlistCount = 0
  let athleteSub: PoolSubscription | null = null

  if (cycle) {
    ;[activeCount, waitlistCount, athleteSub] = await Promise.all([
      getActiveCount(cycle.id),
      getWaitlistCount(cycle.id),
      getAthleteSubscription(cycle.id, user.id),
    ])
  }

  const state = computePoolPageState(cycle, activeCount, waitlistCount, athleteSub)

  // Already active without coming from a fresh payment → go straight to my-subscription
  if (state.variant === 'already-active' && !confirmed) {
    redirect(`/${locale}/pool/my-subscription`)
  }

  const remainingSpots = cycle ? Math.max(0, cycle.maxAthletes - activeCount) : 0
  const remainingWaitlistSpots = state.variant === 'waitlist' ? state.remainingWaitlistSpots : 0
  const waitlistPosition = state.variant === 'already-waitlisted' ? state.position : undefined

  return (
    <section className=" pb-24 container mx-auto max-w-2xl">
      <PoolPageClient
        cycle={cycle}
        activeCount={activeCount}
        remainingSpots={remainingSpots}
        remainingWaitlistSpots={remainingWaitlistSpots}
        user={user}
        athleteSub={athleteSub}
        variant={state.variant}
        waitlistPosition={waitlistPosition}
        confirmed={confirmed === '1'}
      />
    </section>
  )
}

export default PoolPage
