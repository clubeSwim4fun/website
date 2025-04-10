import { getServerSideSitemap } from 'next-sitemap'
import { getPayload, TypedLocale } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getLocale } from 'next-intl/server'

const getPostsSitemap = unstable_cache(
  async (locale: string) => {
    const payload = await getPayload({ config })

    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    const results = await payload.find({
      collection: 'posts',
      overrideAccess: false,
      draft: false,
      depth: 0,
      locale: locale as TypedLocale,
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

    const sitemap = results.docs
      ? results.docs
          .filter((post) => Boolean(post?.slug))
          .map((post) => ({
            loc: `${SITE_URL}/posts/${post?.slug}`,
            lastmod: post.updatedAt || dateFallback,
          }))
      : []

    return sitemap
  },
  ['posts-sitemap'],
  {
    tags: ['posts-sitemap'],
  },
)

export async function GET() {
  const locale = await getLocale()
  const sitemap = await getPostsSitemap(locale)

  return getServerSideSitemap(sitemap)
}
