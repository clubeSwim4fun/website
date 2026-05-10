import { UserDetails } from '@/components/User/user-details'
import { UserFutureEvents } from '@/components/User/user-future-events'
import { UserSubscriptions } from '@/components/User/user-subscriptions'
import { UserProfileHeader } from '@/components/User/user-profile-header'
import { GeneralConfig, User } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getMeUser } from '@/utilities/getMeUser'
import { getCountryCode } from '@/helpers/userHelper'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { redirect } from 'next/navigation'
import { TypedLocale } from 'payload'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getUserFutureEvents } from '@/helpers/userHelper'
import { getUserSubscriptions } from '@/helpers/subscriptionHelper'
import { getPayload as getPayloadInstance } from 'payload'

const UserPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params
  const userObject = await getMeUser({ invalidateCache: true })

  const globalConfig = (await getCachedGlobal(
    'generalConfigs',
    1,
    locale as TypedLocale,
  )()) as GeneralConfig

  if (!userObject || !userObject.user) notFound()

  const payload = await getPayload({ config })
  const user = (await payload.findByID({
    collection: 'users',
    id: userObject.user.id,
    depth: 1,
  })) as User

  if (!user) notFound()

  if (user.status !== 'active') {
    redirect(`/${locale}/subscription`)
  }

  const [eventsData, subsResult, countryCode] = await Promise.all([
    getUserFutureEvents({ userId: user.id, dateFilter: 'all' }),
    getUserSubscriptions({ userId: user.id }),
    getCountryCode(user.nationality as string),
  ])

  const season = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
  const temporaryIdsResult = await payload.find({
    collection: 'temporary-group-ids',
    where: {
      and: [{ user: { equals: user.id } }, { season: { equals: season } }],
    },
    depth: 2,
    limit: 50,
  })

  const resolveTitle = (t: any, loc: string): string => {
    if (!t) return ''
    if (typeof t === 'string') return t
    if (typeof t === 'object') return t[loc] ?? t.pt ?? t.en ?? ''
    return ''
  }

  const temporaryIds = await Promise.all(
    temporaryIdsResult.docs.map(async (doc: any) => {
      // Polymorphic: { relationTo, value } — or legacy plain populated object
      let groupDoc: any = null

      if (doc.group && typeof doc.group === 'object') {
        if ('value' in doc.group) {
          // polymorphic shape
          groupDoc = typeof doc.group.value === 'object' ? doc.group.value : null
          // value is an unpopulated ID string — fetch manually
          if (!groupDoc && typeof doc.group.value === 'string') {
            const col = doc.group.relationTo === 'group-categories' ? 'group-categories' : 'groups'
            groupDoc = await payload
              .findByID({ collection: col, id: doc.group.value, depth: 0 })
              .catch(() => null)
          }
        } else if (doc.group.id) {
          // legacy plain populated object
          groupDoc = doc.group
        }
      } else if (typeof doc.group === 'string') {
        // legacy plain ID — try groups first, then group-categories
        groupDoc = await payload
          .findByID({ collection: 'groups', id: doc.group, depth: 0 })
          .catch(() => null)
        if (!groupDoc) {
          groupDoc = await payload
            .findByID({ collection: 'group-categories', id: doc.group, depth: 0 })
            .catch(() => null)
        }
      }

      return {
        id: doc.id,
        number: doc.number as string,
        season: doc.season as string,
        group: groupDoc ? { id: groupDoc.id, title: resolveTitle(groupDoc.title, locale) } : null,
      }
    }),
  )

  const poolSubCount = subsResult.rows.filter((r) => r.kind === 'pool').length

  return (
    <section className=" pb-24 min-h-screen" style={{ background: '#fdf8f3' }}>
      <div className="container mx-auto max-w-4xl px-4 flex flex-col gap-6">
        <UserProfileHeader
          user={user}
          globalConfig={globalConfig}
          eventCount={eventsData.events.length}
          subscriptionCount={subsResult.totalDocs}
          poolSubCount={poolSubCount}
        />

        <UserDetails user={user} countryCode={countryCode || 'PT'} temporaryIds={temporaryIds} />

        <UserFutureEvents userId={user.id} />
        <UserSubscriptions userId={user.id} />
      </div>
    </section>
  )
}

export default UserPage

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })
  const globalConfig = (await getCachedGlobal(
    'generalConfigs',
    1,
    locale as TypedLocale,
  )()) as GeneralConfig

  const myProfile = globalConfig?.settings?.fixedPages?.myProfile
  const clubTitle = globalConfig?.clubName || t('Club')
  const myProfileTitle = myProfile?.title || t('MyProfile')

  return {
    title: `${clubTitle} - ${myProfileTitle}`,
  }
}
