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
  // Show (limit - 1) posts + 1 "view all" card
  const postsToFetch = limit - 1

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

        {/* Grid: (limit - 1) post cards + 1 view-all card */}
        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: `repeat(${limit}, minmax(0, 1fr))` }}
        >
          {posts.map((post) => (
            <Card key={post.id} doc={post} relationTo="posts" showCategories />
          ))}

          {/* View all card */}
          <Link
            href={viewAllHref}
            className="bg-[#fdf8f3] border-2 border-dashed border-[#d4eaf2] rounded-[14px] flex flex-col items-center justify-center gap-3 min-h-[300px] no-underline transition-all duration-200 hover:border-[#3bb8d8] hover:bg-[#f0fafd]"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-9 h-9 stroke-[#8aaabb] fill-none"
              strokeWidth={1.5}
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="text-[13px] text-[#8aaabb]">{t('viewAll')}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
