import React from 'react'
import { Link } from '@/i18n/routing'
import { Media } from '@/components/Media'
import { formatDateTime } from '@/utilities/formatDateTime'
import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { Post } from '@/payload-types'

interface PostGridProps {
  posts: Post[]
}

export const PostGrid: React.FC<PostGridProps> = ({ posts }) => {
  const t = useTranslations('Posts')

  if (!posts.length) {
    return (
      <div className="text-center py-12">
        <p className="text-[hsl(var(--ink-mid))]">{t('noPosts')}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}

interface PostCardProps {
  post: Post
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const t = useTranslations('Posts')
  const { slug, title, meta, publishedAt } = post
  const { description, image: metaImage } = meta || {}

  return (
    <Link
      href={`/posts/${slug}`}
      className="group bg-white border-2 border-[hsl(var(--swim-border))] rounded-[14px] overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(10,74,110,0.18)] hover:border-[hsl(var(--light))] no-underline"
    >
      {/* Image */}
      <div className="h-[180px] overflow-hidden bg-[hsl(var(--pale))] relative flex-shrink-0">
        {metaImage && typeof metaImage !== 'string' ? (
          <Media
            resource={metaImage}
            size="50vw"
            imgClassName="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[hsl(var(--pale))] to-[hsl(var(--foam))] flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-9 h-9 stroke-[hsl(var(--ink-light))] fill-none"
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
        {publishedAt && (
          <div className="text-xs text-[hsl(var(--ink-light))] font-semibold uppercase tracking-wider mb-2">
            {formatDateTime(publishedAt)}
          </div>
        )}

        <h3 className="font-syne text-base font-bold text-[hsl(var(--deep))] leading-snug mb-2.5 flex-1">
          {title}
        </h3>

        {description && (
          <p className="text-xs text-[hsl(var(--ink-mid))] leading-relaxed mb-3.5 line-clamp-3">
            {description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--swim-border))]">
          <div className="flex items-center gap-2">
            <div className="w-6.5 h-6.5 rounded-full bg-gradient-to-br from-[hsl(var(--deep))] to-[hsl(var(--mid))] flex items-center justify-center font-syne text-[10px] font-bold text-white flex-shrink-0">
              S4
            </div>
            <div className="text-xs text-[hsl(var(--ink-light))] font-medium">Clube Swim4fun</div>
          </div>

          <div className="text-xs font-semibold text-[hsl(var(--mid))] flex items-center gap-1">
            {t('readMore')}
            <ArrowRight
              className="w-2.75 h-2.75 stroke-current transition-transform group-hover:translate-x-1"
              strokeWidth={2.5}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}
