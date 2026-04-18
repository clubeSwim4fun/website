'use client'
import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from '@/i18n/routing'

interface BlogPaginationProps {
  currentPage: number
  totalPages: number
  basePath?: string
}

export const BlogPagination: React.FC<BlogPaginationProps> = ({
  currentPage,
  totalPages,
  basePath = '/posts',
}) => {
  if (totalPages <= 1) return null

  const getPageUrl = (page: number) => {
    if (page === 1) return basePath
    return `${basePath}/page/${page}`
  }

  const renderPageNumbers = () => {
    const pages = []
    const showEllipsis = totalPages > 7

    if (!showEllipsis) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <Link
            key={i}
            href={getPageUrl(i)}
            className={`w-9.5 h-9.5 rounded-[9px] border-1.5 flex items-center justify-center text-xs font-semibold cursor-pointer transition-all font-dm-sans no-underline ${
              i === currentPage
                ? 'bg-gradient-to-br from-[hsl(var(--deep))] to-[hsl(var(--mid))] text-white border-transparent font-syne font-bold'
                : 'border-[hsl(var(--swim-border))] bg-white text-[hsl(var(--ink-mid))] hover:border-[hsl(var(--mid))] hover:text-[hsl(var(--mid))] hover:bg-[hsl(var(--pale))]'
            }`}
          >
            {i}
          </Link>,
        )
      }
    } else {
      // Show ellipsis for many pages
      pages.push(
        <Link
          key={1}
          href={getPageUrl(1)}
          className={`w-9.5 h-9.5 rounded-[9px] border-1.5 flex items-center justify-center text-xs font-semibold cursor-pointer transition-all font-dm-sans no-underline ${
            1 === currentPage
              ? 'bg-gradient-to-br from-[hsl(var(--deep))] to-[hsl(var(--mid))] text-white border-transparent font-syne font-bold'
              : 'border-[hsl(var(--swim-border))] bg-white text-[hsl(var(--ink-mid))] hover:border-[hsl(var(--mid))] hover:text-[hsl(var(--mid))] hover:bg-[hsl(var(--pale))]'
          }`}
        >
          1
        </Link>,
      )

      if (currentPage > 3) {
        pages.push(
          <span key="ellipsis1" className="text-sm text-[hsl(var(--ink-light))] px-1">
            …
          </span>,
        )
      }

      // Show current page and neighbors
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(
            <Link
              key={i}
              href={getPageUrl(i)}
              className={`w-9.5 h-9.5 rounded-[9px] border-1.5 flex items-center justify-center text-xs font-semibold cursor-pointer transition-all font-dm-sans no-underline ${
                i === currentPage
                  ? 'bg-gradient-to-br from-[hsl(var(--deep))] to-[hsl(var(--mid))] text-white border-transparent font-syne font-bold'
                  : 'border-[hsl(var(--swim-border))] bg-white text-[hsl(var(--ink-mid))] hover:border-[hsl(var(--mid))] hover:text-[hsl(var(--mid))] hover:bg-[hsl(var(--pale))]'
              }`}
            >
              {i}
            </Link>,
          )
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push(
          <span key="ellipsis2" className="text-sm text-[hsl(var(--ink-light))] px-1">
            …
          </span>,
        )
      }

      if (totalPages > 1) {
        pages.push(
          <Link
            key={totalPages}
            href={getPageUrl(totalPages)}
            className={`w-9.5 h-9.5 rounded-[9px] border-1.5 flex items-center justify-center text-xs font-semibold cursor-pointer transition-all font-dm-sans no-underline ${
              totalPages === currentPage
                ? 'bg-gradient-to-br from-[hsl(var(--deep))] to-[hsl(var(--mid))] text-white border-transparent font-syne font-bold'
                : 'border-[hsl(var(--swim-border))] bg-white text-[hsl(var(--ink-mid))] hover:border-[hsl(var(--mid))] hover:text-[hsl(var(--mid))] hover:bg-[hsl(var(--pale))]'
            }`}
          >
            {totalPages}
          </Link>,
        )
      }
    }

    return pages
  }

  return (
    <div className="flex gap-1.5 items-center justify-center">
      {/* Previous button */}
      {currentPage > 1 ? (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="w-9.5 h-9.5 rounded-[9px] border-1.5 border-[hsl(var(--swim-border))] bg-white flex items-center justify-center text-[hsl(var(--ink-mid))] cursor-pointer transition-all hover:border-[hsl(var(--mid))] hover:text-[hsl(var(--mid))] hover:bg-[hsl(var(--pale))] no-underline"
        >
          <ChevronLeft className="w-3.5 h-3.5 stroke-current" strokeWidth={2.5} />
        </Link>
      ) : (
        <div className="w-9.5 h-9.5 rounded-[9px] border-1.5 border-[hsl(var(--swim-border))] bg-white flex items-center justify-center text-[hsl(var(--ink-light))] opacity-50">
          <ChevronLeft className="w-3.5 h-3.5 stroke-current" strokeWidth={2.5} />
        </div>
      )}

      {/* Page numbers */}
      {renderPageNumbers()}

      {/* Next button */}
      {currentPage < totalPages ? (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="w-9.5 h-9.5 rounded-[9px] border-1.5 border-[hsl(var(--swim-border))] bg-white flex items-center justify-center text-[hsl(var(--ink-mid))] cursor-pointer transition-all hover:border-[hsl(var(--mid))] hover:text-[hsl(var(--mid))] hover:bg-[hsl(var(--pale))] no-underline"
        >
          <ChevronRight className="w-3.5 h-3.5 stroke-current" strokeWidth={2.5} />
        </Link>
      ) : (
        <div className="w-9.5 h-9.5 rounded-[9px] border-1.5 border-[hsl(var(--swim-border))] bg-white flex items-center justify-center text-[hsl(var(--ink-light))] opacity-50">
          <ChevronRight className="w-3.5 h-3.5 stroke-current" strokeWidth={2.5} />
        </div>
      )}
    </div>
  )
}
