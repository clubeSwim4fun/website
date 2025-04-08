import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'

import { generateMeta } from '@/utilities/generateMeta'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { EventHero } from '@/heros/EventHero'
import { EventDetails } from '@/components/EventDetails'
import { getMyCart } from '@/helpers/cartHelper'
import { getMeUser } from '@/utilities/getMeUser'
import { Cart } from '@/payload-types'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'events',
    draft: false,
    limit: 100,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = posts.docs.map(({ slug }) => {
    return { slug }
  })

  return params
}

type Args = {
  params: Promise<{
    locale: string
    slug?: string
  }>
}

export default async function Event({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const url = '/event/' + slug
  const event = await queryEventBySlug({ slug })

  const payload = await getPayload({ config: configPromise })

  let cart: Cart | null | undefined = null

  if (!event) return <PayloadRedirects url={url} />
  const { user } = await getMeUser()

  cart = user ? await getMyCart() : null

  const eventOrders = await payload.find({
    collection: 'orders',
    limit: 1,
    pagination: false,
    where: {
      user: {
        equals: user?.id,
      },
      'events.event': {
        equals: event.id,
      },
    },
  })

  // TODO - Move into context to avoid extra calls
  const groups = await payload.find({
    collection: 'group-categories',
    limit: 100,
    pagination: false,
    select: {
      id: true,
      title: true,
    },
  })

  const { description, slug: eventSlug } = event

  return (
    <main className="pb-24">
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <EventHero event={event} />

      <div className="container pt-8 max-w-6xl mx-auto">
        <section className="flex flex-col-reverse lg:flex-row gap-3">
          <RichText data={description} enableGutter={false} />
          <EventDetails
            user={user}
            event={event}
            slug={eventSlug}
            cart={cart}
            orderedEvent={eventOrders.docs?.[0]}
            groups={groups.docs}
          />
          {/* Refactor to move back the event Tickets here and aside so I can pass the action to get my cart and update cart from here */}
        </section>
      </div>
    </main>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '', locale } = await paramsPromise
  const event = await queryEventBySlug({ slug })

  return generateMeta({ doc: event, locale })
}

const queryEventBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'events',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
