import React from 'react'
import { Link } from '@/i18n/routing'
import { Media } from '@/components/Media'
import { formatDateTime } from '@/utilities/formatDateTime'
import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { Post } from '@/payload-types'

interface FeaturedPostProps {
  post: Post
}

export const FeaturedPost: React.FC<FeaturedPostProps> = ({ post }) => {
  const t = useTranslations('Posts')
  const { slug, title, meta, publishedAt } = post
  const { description, image: metaImage } = meta || {}

  return (
    <div className="mb-10">
      {/* Featured label */}
      <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[hsl(var(--mid))] mb-4">
        <div className="w-6 h-0.5 bg-[hsl(var(--mid))] rounded-full" />
        {t('featuredArticle')}
      </div>

      {/* Featured card */}
      <Link
        href={`/posts/${slug}`}
        className="group bg-white border-2 border-[hsl(var(--swim-border))] rounded-[20px] overflow-hidden block transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(10,74,110,0.18)] hover:border-[hsl(var(--light))] no-underline"
      >
        {/* Image */}
        <div className="h-[300px] overflow-hidden relative">
          {metaImage && typeof metaImage !== 'string' ? (
            <Media
              resource={metaImage}
              size="100vw"
              imgClassName="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[hsl(var(--pale))] to-[hsl(var(--foam))] flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-12 h-12 stroke-[hsl(var(--ink-light))] fill-none"
                strokeWidth={1.5}
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,74,110,0.55)] to-transparent opacity-55" />

          {/* Featured tag */}
          <div className="absolute top-4.5 left-4.5 bg-[hsl(var(--mid))] text-white rounded-full px-3.25 py-1.25 font-outfit text-xs font-bold uppercase tracking-wide">
            {t('featured')}
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          {publishedAt && (
            <div className="text-xs text-[hsl(var(--ink-light))] font-semibold uppercase tracking-wider mb-2.5">
              {formatDateTime(publishedAt)}
            </div>
          )}

          <h2 className="font-outfit text-2xl font-extrabold text-[hsl(var(--deep))] leading-tight mb-3">
            {title}
          </h2>

          {description && (
            <p className="text-[15px] text-[hsl(var(--ink-mid))] leading-relaxed mb-4.5 line-clamp-3">
              {description}
            </p>
          )}

          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[hsl(var(--mid))]">
            {t('readFullArticle')}
            <ArrowRight
              className="w-3.25 h-3.25 stroke-current transition-transform group-hover:translate-x-1"
              strokeWidth={2.5}
            />
          </div>
        </div>
      </Link>
    </div>
  )
}
