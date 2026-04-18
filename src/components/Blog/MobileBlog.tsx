'use client'
import React, { useState } from 'react'
import { Link } from '@/i18n/routing'
import { Media } from '@/components/Media'
import { formatDateTime } from '@/utilities/formatDateTime'
import { ArrowRight, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import type { Post, Category } from '@/payload-types'

interface MobileBlogProps {
  featuredPost?: Post
  posts: Post[]
  categories: Category[]
  currentPage: number
  totalPages: number
  totalPosts: number
  activeCategory: string | null
  onCategoryChange: (categoryId: string | null) => void
}

export const MobileBlog: React.FC<MobileBlogProps> = ({
  featuredPost,
  posts,
  categories,
  currentPage,
  totalPages,
  totalPosts,
  activeCategory,
  onCategoryChange,
}) => {
  const t = useTranslations('Posts')
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="md:hidden">
      {/* Mobile Hero */}
      <div className="bg-gradient-to-br from-[hsl(var(--deep))] to-[hsl(var(--mid))] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="px-5 py-7 relative z-10">
          <div className="inline-flex items-center gap-1.75 bg-white/12 border border-white/20 rounded-full px-3 py-1.25 text-xs font-semibold text-white/90 uppercase tracking-wider mb-3.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--green))]" />
            {t('community')}
          </div>

          <h1 className="font-syne text-[28px] font-extrabold text-white mb-2.5 tracking-tight leading-tight">
            {t('heroTitle')}
          </h1>

          <p className="text-sm text-white/75 leading-relaxed mb-5">{t('heroDescription')}</p>

          <form
            onSubmit={handleSearch}
            className="bg-white/12 border-1.5 border-white/20 rounded-[11px] p-1 flex items-center gap-2"
          >
            <Search className="w-3.5 h-3.5 stroke-white/60 ml-3.5 flex-shrink-0" strokeWidth={2} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="bg-transparent border-none outline-none text-sm text-white placeholder:text-white/45 flex-1 min-w-0"
            />
            <button
              type="submit"
              className="bg-white text-[hsl(var(--deep))] border-none rounded-[7px] px-3.5 py-2 font-syne font-bold text-xs whitespace-nowrap"
            >
              {t('go')}
            </button>
          </form>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="px-4.5 py-3.5 bg-white border-b border-[hsl(var(--swim-border))] overflow-x-auto">
        <div className="flex gap-1.75 scrollbar-none">
          <button
            onClick={() => onCategoryChange(null)}
            className={`px-3.5 py-1.75 rounded-full border-1.5 text-xs font-medium cursor-pointer whitespace-nowrap flex-shrink-0 font-dm-sans transition-all ${
              activeCategory === null
                ? 'bg-[hsl(var(--pale))] border-[hsl(var(--mid))] text-[hsl(var(--deep))] font-semibold'
                : 'border-[hsl(var(--swim-border))] bg-white text-[hsl(var(--ink-mid))]'
            }`}
          >
            {t('all')}
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`px-3.5 py-1.75 rounded-full border-1.5 text-xs font-medium cursor-pointer whitespace-nowrap flex-shrink-0 font-dm-sans transition-all ${
                activeCategory === category.id
                  ? 'bg-[hsl(var(--pale))] border-[hsl(var(--mid))] text-[hsl(var(--deep))] font-semibold'
                  : 'border-[hsl(var(--swim-border))] bg-white text-[hsl(var(--ink-mid))]'
              }`}
            >
              {category.title}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Post */}
      {featuredPost && (
        <div className="px-4.5 pt-4 pb-1.5">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--mid))] mb-3">
            <div className="w-4 h-0.5 bg-[hsl(var(--mid))] rounded-full" />
            {t('featuredArticle')}
          </div>

          <Link
            href={`/posts/${featuredPost.slug}`}
            className="bg-white border-2 border-[hsl(var(--swim-border))] rounded-[14px] overflow-hidden block mb-1.5 no-underline active:opacity-90"
          >
            <div className="h-[180px] overflow-hidden relative">
              {featuredPost.meta?.image && typeof featuredPost.meta.image !== 'string' ? (
                <Media
                  resource={featuredPost.meta.image}
                  size="100vw"
                  imgClassName="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[hsl(var(--pale))] to-[hsl(var(--foam))]" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,74,110,0.55)] to-transparent opacity-55" />

              <div className="absolute top-3 left-3 bg-[hsl(var(--mid))] text-white rounded-full px-2.75 py-1 font-syne text-[10px] font-bold uppercase tracking-wide">
                {t('featured')}
              </div>
            </div>

            <div className="p-4">
              {featuredPost.publishedAt && (
                <div className="text-xs text-[hsl(var(--ink-light))] font-semibold uppercase tracking-wider mb-1.75">
                  {formatDateTime(featuredPost.publishedAt)}
                </div>
              )}

              <h2 className="font-syne text-lg font-extrabold text-[hsl(var(--deep))] leading-tight mb-2.5">
                {featuredPost.title}
              </h2>

              {featuredPost.meta?.description && (
                <p className="text-xs text-[hsl(var(--ink-mid))] leading-relaxed mb-3 line-clamp-3">
                  {featuredPost.meta.description}
                </p>
              )}

              <div className="inline-flex items-center gap-1.25 text-xs font-semibold text-[hsl(var(--mid))]">
                {t('readArticle')}
                <ArrowRight className="w-3 h-3 stroke-current" strokeWidth={2.5} />
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Posts List */}
      <div className="px-4.5 pb-4">
        <div className="text-xs text-[hsl(var(--ink-light))] py-3 border-b border-[hsl(var(--swim-border))] mb-3.5">
          {t('mobilePostsCount', { count: totalPosts, page: currentPage, totalPages })}
        </div>

        <div className="space-y-3">
          {posts.map((post) => (
            <MobilePostCard key={post.id} post={post} />
          ))}
        </div>
      </div>

      {/* Mobile Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-1.25 justify-center px-4.5 py-2 pb-5">
          <MobilePaginationButton
            page={currentPage - 1}
            disabled={currentPage <= 1}
            isArrow="prev"
          />

          <MobilePaginationButton page={1} active={currentPage === 1} />

          {currentPage > 2 && currentPage < totalPages && (
            <MobilePaginationButton page={currentPage} active />
          )}

          {totalPages > 2 && currentPage < totalPages - 1 && (
            <span className="w-9 h-9 flex items-center justify-center text-xs text-[hsl(var(--ink-light))]">
              …
            </span>
          )}

          {totalPages > 1 && (
            <MobilePaginationButton page={totalPages} active={currentPage === totalPages} />
          )}

          <MobilePaginationButton
            page={currentPage + 1}
            disabled={currentPage >= totalPages}
            isArrow="next"
          />
        </div>
      )}

      {/* Share CTA */}
      <div className="mx-4.5 mb-5 bg-gradient-to-br from-[hsl(var(--deep))] to-[hsl(var(--mid))] rounded-[14px] p-5 text-white text-center">
        <div className="font-syne text-base font-bold mb-1.5">{t('shareYourStory')}</div>
        <p className="text-xs opacity-78 leading-relaxed mb-3.5">{t('shareDescription')}</p>
        <a
          href="mailto:geral@clube-swim4fun.pt"
          className="block bg-white text-[hsl(var(--deep))] rounded-[9px] px-2.75 py-2.75 font-syne text-xs font-bold no-underline"
        >
          {t('sendStory')}
        </a>
      </div>
    </div>
  )
}

interface MobilePostCardProps {
  post: Post
}

const MobilePostCard: React.FC<MobilePostCardProps> = ({ post }) => {
  const t = useTranslations('Posts')
  const { slug, title, meta, publishedAt } = post
  const { description, image: metaImage } = meta || {}

  return (
    <Link
      href={`/posts/${slug}`}
      className="bg-white border-2 border-[hsl(var(--swim-border))] rounded-[12px] overflow-hidden flex transition-colors hover:border-[hsl(var(--light))] no-underline active:opacity-90"
    >
      <div className="w-[100px] h-[100px] flex-shrink-0 overflow-hidden relative">
        {metaImage && typeof metaImage !== 'string' ? (
          <Media resource={metaImage} size="100px" imgClassName="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[hsl(var(--pale))] flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6 stroke-[hsl(var(--ink-light))] fill-none"
              strokeWidth={1.5}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
      </div>

      <div className="px-3.5 py-3 flex flex-col justify-between flex-1 min-w-0">
        {publishedAt && (
          <div className="text-[10px] text-[hsl(var(--ink-light))] font-semibold uppercase tracking-wider mb-1.25">
            {formatDateTime(publishedAt)}
          </div>
        )}

        <h3 className="font-syne text-xs font-bold text-[hsl(var(--deep))] leading-snug mb-1.5 line-clamp-2">
          {title}
        </h3>

        {description && (
          <p className="text-xs text-[hsl(var(--ink-mid))] leading-relaxed line-clamp-2 mb-2">
            {description}
          </p>
        )}

        <div className="text-xs font-semibold text-[hsl(var(--mid))] flex items-center gap-0.75">
          {t('read')}
          <ArrowRight className="w-2.5 h-2.5 stroke-current" strokeWidth={2.5} />
        </div>
      </div>
    </Link>
  )
}

interface MobilePaginationButtonProps {
  page: number
  active?: boolean
  disabled?: boolean
  isArrow?: 'prev' | 'next'
}

const MobilePaginationButton: React.FC<MobilePaginationButtonProps> = ({
  page,
  active,
  disabled,
  isArrow,
}) => {
  const getPageUrl = (pageNum: number) => {
    if (pageNum === 1) return '/posts'
    return `/posts/page/${pageNum}`
  }

  const className = `w-9 h-9 rounded-lg border-1.5 flex items-center justify-center text-xs font-semibold cursor-pointer font-dm-sans no-underline ${
    active
      ? 'bg-gradient-to-br from-[hsl(var(--deep))] to-[hsl(var(--mid))] text-white border-transparent font-syne font-bold'
      : disabled
        ? 'border-[hsl(var(--swim-border))] bg-white text-[hsl(var(--ink-light))] opacity-50 cursor-not-allowed'
        : 'border-[hsl(var(--swim-border))] bg-white text-[hsl(var(--ink-mid))]'
  }`

  if (disabled) {
    return (
      <div className={className}>
        {isArrow === 'prev' ? (
          <svg
            viewBox="0 0 24 24"
            className="w-3.25 h-3.25 stroke-current fill-none"
            strokeWidth={2.5}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        ) : isArrow === 'next' ? (
          <svg
            viewBox="0 0 24 24"
            className="w-3.25 h-3.25 stroke-current fill-none"
            strokeWidth={2.5}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        ) : (
          page
        )}
      </div>
    )
  }

  return (
    <Link href={getPageUrl(page)} className={className}>
      {isArrow === 'prev' ? (
        <svg
          viewBox="0 0 24 24"
          className="w-3.25 h-3.25 stroke-current fill-none"
          strokeWidth={2.5}
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      ) : isArrow === 'next' ? (
        <svg
          viewBox="0 0 24 24"
          className="w-3.25 h-3.25 stroke-current fill-none"
          strokeWidth={2.5}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      ) : (
        page
      )}
    </Link>
  )
}
