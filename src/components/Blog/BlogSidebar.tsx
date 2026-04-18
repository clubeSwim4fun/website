import React from 'react'
import { Link } from '@/i18n/routing'
import { Media } from '@/components/Media'
import { formatDateTime } from '@/utilities/formatDateTime'
import { useTranslations } from 'next-intl'
import type { Post, Category } from '@/payload-types'

interface BlogSidebarProps {
  recentPosts: Post[]
  categories: Category[]
}

export const BlogSidebar: React.FC<BlogSidebarProps> = ({ recentPosts, categories }) => {
  const t = useTranslations('Posts')

  return (
    <div className="sticky top-[108px] flex flex-col gap-4">
      {/* About section */}
      <div className="bg-gradient-to-br from-[hsl(var(--deep))] to-[hsl(var(--mid))] rounded-[14px] p-5.5 text-white text-center">
        <div className="w-14 h-14 rounded-full bg-white/18 border-2 border-white/30 flex items-center justify-center mx-auto mb-3.5 font-syne text-lg font-extrabold text-white">
          S4
        </div>
        <div className="font-syne text-[15px] font-bold mb-1">Clube Swim4fun</div>
        <div className="text-xs opacity-65 mb-3 uppercase tracking-wider">
          {t('openWaterSwimming')}
        </div>
        <p className="text-xs opacity-78 leading-relaxed mb-4">{t('sidebarDescription')}</p>
        <Link
          href="/about"
          className="block bg-white text-[hsl(var(--deep))] rounded-lg px-2.5 py-2.5 font-syne text-xs font-bold no-underline transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
        >
          {t('learnAboutClub')}
        </Link>
      </div>

      {/* Recent posts */}
      <div className="bg-white border-2 border-[hsl(var(--swim-border))] rounded-[14px] overflow-hidden">
        <div className="px-4.5 py-3.5 border-b-1.5 border-[hsl(var(--swim-border))]">
          <h3 className="font-syne text-xs font-bold text-[hsl(var(--deep))] uppercase tracking-wider">
            {t('recentArticles')}
          </h3>
        </div>
        <div className="p-4">
          {recentPosts.map((post, index) => (
            <RecentPostItem key={post.id} post={post} isLast={index === recentPosts.length - 1} />
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white border-2 border-[hsl(var(--swim-border))] rounded-[14px] overflow-hidden">
        <div className="px-4.5 py-3.5 border-b-1.5 border-[hsl(var(--swim-border))]">
          <h3 className="font-syne text-xs font-bold text-[hsl(var(--deep))] uppercase tracking-wider">
            {t('topics')}
          </h3>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-1.75">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/posts?category=${category.id}`}
                className="px-2.75 py-1.25 rounded-full bg-[hsl(var(--foam))] border-1.5 border-[hsl(var(--swim-border))] text-xs font-semibold text-[hsl(var(--ink-mid))] cursor-pointer transition-all hover:border-[hsl(var(--mid))] hover:text-[hsl(var(--mid))] hover:bg-[hsl(var(--pale))] no-underline"
              >
                {category.title}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Share CTA */}
      <div className="bg-gradient-to-br from-[hsl(var(--deep))] to-[hsl(var(--mid))] rounded-[14px] p-5.5">
        <div className="font-syne text-[15px] font-bold text-white mb-2">{t('shareYourStory')}</div>
        <p className="text-xs text-white/75 leading-relaxed mb-3.5">{t('shareDescription')}</p>
        <a
          href="mailto:geral@clube-swim4fun.pt"
          className="block bg-white text-[hsl(var(--deep))] rounded-lg px-2.5 py-2.5 font-syne text-xs font-bold text-center no-underline"
        >
          {t('sendStory')}
        </a>
      </div>
    </div>
  )
}

interface RecentPostItemProps {
  post: Post
  isLast: boolean
}

const RecentPostItem: React.FC<RecentPostItemProps> = ({ post, isLast }) => {
  const { slug, title, meta, publishedAt } = post
  const { image: metaImage } = meta || {}

  return (
    <Link
      href={`/posts/${slug}`}
      className={`flex gap-3 py-2.5 transition-colors hover:bg-[hsl(var(--foam))] hover:-mx-4.5 hover:px-4.5 no-underline ${
        !isLast ? 'border-b border-[hsl(var(--swim-border))]' : ''
      }`}
    >
      <div className="w-14 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-[hsl(var(--pale))]">
        {metaImage && typeof metaImage !== 'string' ? (
          <Media resource={metaImage} size="14rem" imgClassName="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[hsl(var(--pale))]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-semibold text-[hsl(var(--deep))] leading-snug mb-0.75 line-clamp-2">
          {title}
        </h4>
        {publishedAt && (
          <div className="text-[10px] text-[hsl(var(--ink-light))] font-semibold uppercase tracking-wider">
            {formatDateTime(publishedAt)}
          </div>
        )}
      </div>
    </Link>
  )
}
