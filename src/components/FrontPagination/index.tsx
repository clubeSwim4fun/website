'use client'

import {
  Pagination as PaginationComponent,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { cn } from '@/utilities/ui'
import { useTranslations } from 'next-intl'
import React from 'react'

export const FrontPagination: React.FC<{
  className?: string
  page: number
  totalPages: number
  onPreviousClick: (newPage: number) => void
  onPageClick: (newPage: number) => void
  onNextClick: (newPage: number) => void
}> = (props) => {
  const { className, page, totalPages, onPreviousClick, onPageClick, onNextClick } = props
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1
  const t = useTranslations()

  const hasExtraPrevPages = page - 1 > 1
  const hasExtraNextPages = page + 1 < totalPages

  return (
    <div className={cn('my-12', className)}>
      <PaginationComponent>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              label={t('Common.previous')}
              disabled={!hasPrevPage}
              onClick={() => onPreviousClick(page - 1)}
            />
          </PaginationItem>

          {hasExtraPrevPages && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {hasPrevPage && (
            <PaginationItem>
              <PaginationLink
                onClick={() => {
                  onPageClick(page - 1)
                }}
              >
                {page - 1}
              </PaginationLink>
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationLink
              isActive
              onClick={() => {
                onPageClick(page)
              }}
            >
              {page}
            </PaginationLink>
          </PaginationItem>

          {hasNextPage && (
            <PaginationItem>
              <PaginationLink
                onClick={() => {
                  onPageClick(page + 1)
                }}
              >
                {page + 1}
              </PaginationLink>
            </PaginationItem>
          )}

          {hasExtraNextPages && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext
              disabled={!hasNextPage}
              label={t('Common.next')}
              onClick={() => {
                onNextClick(page + 1)
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </PaginationComponent>
    </div>
  )
}
