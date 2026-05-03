'use client'
import React from 'react'
import { useTranslations } from 'next-intl'
import type { Category } from '@/payload-types'

interface FilterBarProps {
  categories: Category[]
  activeCategory: string | null
  onCategoryChange: (categoryId: string | null) => void
  totalPosts: number
  currentPage: number
  totalPages: number
}

export const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
  totalPosts,
  currentPage,
  totalPages,
}) => {
  const t = useTranslations('Posts')

  return (
    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
      {/* Filter chips */}
      <div className="flex gap-1.75 flex-wrap">
        <button
          onClick={() => onCategoryChange(null)}
          className={`px-3.75 py-1.75 rounded-full border-1.5 text-xs font-semibold cursor-pointer transition-all font-outfit ${
            activeCategory === null
              ? 'bg-[hsl(var(--pale))] border-[hsl(var(--mid))] text-[hsl(var(--deep))]'
              : 'border-[hsl(var(--swim-border))] bg-white text-[hsl(var(--ink-mid))] hover:border-[hsl(var(--light))]'
          }`}
        >
          {t('all')}
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`px-3.75 py-1.75 rounded-full border-1.5 text-xs font-semibold cursor-pointer transition-all font-outfit ${
              activeCategory === category.id
                ? 'bg-[hsl(var(--pale))] border-[hsl(var(--mid))] text-[hsl(var(--deep))]'
                : 'border-[hsl(var(--swim-border))] bg-white text-[hsl(var(--ink-mid))] hover:border-[hsl(var(--light))]'
            }`}
          >
            {category.title}
          </button>
        ))}
      </div>

      {/* Posts count */}
      <div className="text-xs text-[hsl(var(--ink-light))]">
        {t('postsCount', {
          count: totalPosts,
          currentPage,
          totalPages: totalPages > 1 ? totalPages : 1,
        })}
      </div>
    </div>
  )
}
