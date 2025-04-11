import { getServerSideSitemap } from 'next-sitemap'
import { getPayload, TypedLocale } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

const getPagesSitemap = unstable_cache(
  async (locale: string) => {
    const payload = await getPayload({ config })

    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    const results = await payload.find({
      collection: 'pages',
      overrideAccess: false,
      draft: false,
      locale: locale as TypedLocale,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: {
        _status: {
          equals: 'published',
        },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    const dateFallback = new Date().toISOString()

    const defaultSitemap = [
      {
        loc: `${SITE_URL}/${locale}/search`,
        lastmod: dateFallback,
      },
      {
        loc: `${SITE_URL}/${locale}/posts`,
        lastmod: dateFallback,
      },
    ]

    const sitemap = results.docs
      ? results.docs
          .filter((page) => Boolean(page?.slug))
          .map((page) => {
            return {
              loc:
                page?.slug === 'home'
                  ? `${SITE_URL}/${locale}`
                  : `${SITE_URL}/${locale}/${page?.slug}`,
              lastmod: page.updatedAt || dateFallback,
            }
          })
      : []

    return [...defaultSitemap, ...sitemap]
  },
  ['pages-sitemap'],
  {
    tags: ['pages-sitemap'],
  },
)

export async function GET(request: Request) {
  const url = new URL(request.url)
  const pathUrl = url.pathname

  const locale = pathUrl.split('/')[1] || 'pt'

  const sitemap = await getPagesSitemap(locale)

  return getServerSideSitemap(sitemap)
}
