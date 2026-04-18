'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import React, { Fragment } from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { formatDateTime } from '@/utilities/formatDateTime'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title' | 'publishedAt'>

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const t = useTranslations('ArchiveBlock')
  const { className, doc, relationTo, showCategories, title: titleFromProps } = props

  const { slug, categories, meta, title, publishedAt } = doc || {}
  const { description, image: metaImage } = meta || {}

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ')
  const href = `/${relationTo}/${slug}`

  return (
    <article
      className={cn(
        'group bg-[#fdf8f3] border-2 border-[#d4eaf2] rounded-[14px] overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(10,74,110,0.20)] hover:border-[#3bb8d8] cursor-pointer',
        className,
      )}
      ref={card.ref}
    >
      {/* Image */}
      <div className="h-[200px] bg-gradient-to-br from-[#e0f5fb] to-[#f0fafd] overflow-hidden relative">
        {metaImage && typeof metaImage !== 'string' ? (
          <Media
            fill
            resource={metaImage}
            size="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            imgClassName="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-10 h-10 stroke-[#8aaabb] fill-none"
              strokeWidth={1.5}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        {showCategories && hasCategories && (
          <div className="text-[11px] font-semibold uppercase tracking-[0.7px] text-[#0e7ea8] mb-2">
            {categories?.map((category, index) => {
              if (typeof category === 'object') {
                const isLast = index === categories.length - 1
                return (
                  <Fragment key={index}>
                    {category.title || 'Untitled'}
                    {!isLast && <Fragment>, &nbsp;</Fragment>}
                  </Fragment>
                )
              }
              return null
            })}
          </div>
        )}

        {publishedAt && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.7px] text-[#8aaabb] mb-2">
            {formatDateTime(publishedAt)}
          </p>
        )}

        {titleToUse && (
          <h3 className="font-bold text-[16px] text-[#0a4a6e] leading-snug mb-2">
            <Link className="no-underline hover:underline" href={href} ref={link.ref}>
              {titleToUse}
            </Link>
          </h3>
        )}

        {sanitizedDescription && (
          <p className="text-[13px] text-[#3d5a70] leading-relaxed line-clamp-3 flex-1">
            {sanitizedDescription}
          </p>
        )}

        <div className="flex items-center gap-1 text-[12px] font-semibold text-[#0e7ea8] mt-3">
          {t('readMore')}
          <svg viewBox="0 0 24 24" className="w-3 h-3 stroke-current fill-none" strokeWidth={2.5}>
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </div>
      </div>
    </article>
  )
}
