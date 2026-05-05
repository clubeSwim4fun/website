import type { Post, ArchiveBlock as ArchiveBlockProps } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload, TypedLocale } from 'payload'
import React from 'react'
import RichText from '@/components/RichText'
import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { Card } from '@/components/Card'

export const ArchiveBlock: React.FC<ArchiveBlockProps & { id?: string }> = async (props) => {
  const {
    id,
    categories,
    introContent,
    limit: limitFromProps,
    populateBy,
    selectedDocs,
    subtitle,
  } = props

  const limit = limitFromProps || 3
  const postsToFetch = limit

  const t = await getTranslations('ArchiveBlock')

  let posts: Post[] = []
  let viewAllHref = '/posts'

  if (populateBy === 'collection') {
    const payload = await getPayload({ config: configPromise })
    const locale = await getLocale()

    const flattenedCategories = categories?.map((category) => {
      if (typeof category === 'object') return category.id
      else return category
    })

    const fetchedPosts = await payload.find({
      collection: 'posts',
      locale: locale as TypedLocale,
      depth: 1,
      limit: postsToFetch,
      sort: '-publishedAt',
      ...(flattenedCategories && flattenedCategories.length > 0
        ? { where: { categories: { in: flattenedCategories } } }
        : {}),
    })

    posts = fetchedPosts.docs

    // Link to filtered posts page if a single category is configured
    if (flattenedCategories && flattenedCategories.length === 1) {
      const cat = categories?.[0]
      if (typeof cat === 'object' && cat.slug) {
        viewAllHref = `/posts?category=${cat.slug}`
      }
    }
  } else {
    if (selectedDocs?.length) {
      posts = selectedDocs
        .slice(0, postsToFetch)
        .map((post) => (typeof post.value === 'object' ? post.value : null))
        .filter(Boolean) as Post[]
    }
  }

  return (
    <div className="my-16" id={`block-${id}`}>
      <div className="container">
        {/* Header */}
        {(subtitle || introContent) && (
          <div className="mb-10">
            {subtitle && (
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-0.5 bg-[#0e7ea8] rounded-full" />
                <span className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#0e7ea8]">
                  {subtitle}
                </span>
              </div>
            )}
            {introContent && (
              <RichText
                className="ml-0 max-w-[48rem] [&_h2]:font-extrabold [&_h2]:text-[#0a4a6e] [&_h2]:text-4xl [&_h2]:leading-tight"
                data={introContent}
                enableGutter={false}
              />
            )}
          </div>
        )}

        {/* Grid: post cards */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5"
          style={
            limit > 3 ? { gridTemplateColumns: `repeat(${limit}, minmax(0, 1fr))` } : undefined
          }
        >
          {posts.map((post) => (
            <Card key={post.id} doc={post} relationTo="posts" showCategories />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 flex justify-center">
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-outfit font-bold text-sm bg-deep text-white no-underline transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(10,74,110,0.35)]"
          >
            {t('viewAll')}
            <svg
              viewBox="0 0 24 24"
              className="w-[15px] h-[15px] fill-none stroke-current"
              strokeWidth={2.5}
            >
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
