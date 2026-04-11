import type { Event, Media } from '@/payload-types'
import { getServerSideURL } from './getURL'

export function generateEventJsonLd(event: Event, locale: string): Record<string, unknown> {
  const baseUrl = getServerSideURL()
  const url = `${baseUrl}/${locale}/event/${event.slug}`

  const image =
    event.image && typeof event.image === 'object'
      ? `${baseUrl}${(event.image as Media).url}`
      : undefined

  const address = event.address
    ? {
        '@type': 'PostalAddress',
        streetAddress: [event.address.street, event.address.number].filter(Boolean).join(', '),
        addressRegion: event.address.state ?? undefined,
        postalCode: event.address.zipcode ?? undefined,
        addressCountry: event.address.country ?? undefined,
      }
    : undefined

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: event.title,
    startDate: event.start,
    endDate: event.end,
    url,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    organizer: {
      '@type': 'SportsOrganization',
      name: 'Swim4Fun',
      url: baseUrl,
    },
  }

  if (image) jsonLd.image = image
  if (address) jsonLd.location = { '@type': 'Place', address }

  return jsonLd
}
