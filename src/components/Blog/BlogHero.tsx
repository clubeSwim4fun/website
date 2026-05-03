'use client'
import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Search } from 'lucide-react'
import { useRouter } from '@/i18n/routing'

interface BlogHeroProps {
  onSearch?: (query: string) => void
}

export const BlogHero: React.FC<BlogHeroProps> = ({ onSearch }) => {
  const t = useTranslations('Posts')
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery.trim())
      } else {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      }
    }
  }

  return (
    <div className="bg-gradient-to-br from-[hsl(var(--deep))] to-[hsl(var(--mid))] relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="container relative z-10">
        <div className="flex items-center justify-between gap-10 flex-wrap py-15 md:py-20">
          <div className="flex-1 min-w-0">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-white/12 border border-white/20 rounded-full px-3.5 py-1.5 text-xs font-semibold text-white/90 uppercase tracking-wider mb-4.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--green))]" />
              {t('community')}
            </div>

            {/* Title */}
            <h1 className="font-outfit text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight leading-tight">
              {t('heroTitle')}
            </h1>

            {/* Description */}
            <p className="text-base text-white/75 leading-relaxed max-w-lg">
              {t('heroDescription')}
            </p>
          </div>

          {/* Search */}
          <div className="flex-shrink-0 w-full md:w-80">
            <form
              onSubmit={handleSearch}
              className="bg-white/12 border-1.5 border-white/22 rounded-xl p-1.5 flex items-center gap-2.5"
            >
              <Search className="w-4 h-4 stroke-white/60 ml-4 flex-shrink-0" strokeWidth={2} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="bg-transparent border-none outline-none text-sm text-white placeholder:text-white/50 flex-1 min-w-0"
              />
              <button
                type="submit"
                className="bg-white text-[hsl(var(--deep))] border-none rounded-lg px-4.5 py-2.25 font-outfit font-bold text-xs whitespace-nowrap transition-opacity hover:opacity-90"
              >
                {t('search')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
