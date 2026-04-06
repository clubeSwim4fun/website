'use client'

import { cn } from '@/utilities/ui'

export const FrontPagination: React.FC<{
  page: number
  totalPages: number
  totalDocs: number
  perPage: number
  onPageClick: (page: number) => void
  className?: string
}> = ({ page, totalPages, totalDocs, perPage, onPageClick, className }) => {
  if (totalPages <= 1) return null

  const start = (page - 1) * perPage + 1
  const end = Math.min(page * perPage, totalDocs)

  // Build page number list with ellipsis
  const pages: (number | 'ellipsis')[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (totalPages <= 5 || i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== 'ellipsis') {
      pages.push('ellipsis')
    }
  }

  return (
    <div className={cn('flex items-center justify-between flex-wrap gap-2 mt-2', className)}>
      {/* Info */}
      <span className="text-[12px]" style={{ color: '#8aaabb' }}>
        {start}–{end} / {totalDocs}
      </span>

      {/* Buttons */}
      <div className="flex gap-1">
        <PageBtn onClick={() => onPageClick(page - 1)} disabled={page === 1} label="‹" />
        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <span
              key={`e-${i}`}
              className="flex items-center justify-center text-[12px] px-1"
              style={{ color: '#8aaabb', lineHeight: '30px' }}
            >
              …
            </span>
          ) : (
            <PageBtn key={p} onClick={() => onPageClick(p)} active={p === page} label={String(p)} />
          ),
        )}
        <PageBtn onClick={() => onPageClick(page + 1)} disabled={page === totalPages} label="›" />
      </div>
    </div>
  )
}

const PageBtn: React.FC<{
  label: string
  onClick: () => void
  active?: boolean
  disabled?: boolean
}> = ({ label, onClick, active, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center text-[12px] font-medium transition-all disabled:opacity-35 disabled:cursor-not-allowed"
    style={
      active
        ? {
            background: 'linear-gradient(135deg, #0a4a6e, #0e7ea8)',
            color: '#fff',
            border: '1.5px solid transparent',
          }
        : {
            background: '#fff',
            color: '#3d5a70',
            border: '1.5px solid #d4eaf2',
          }
    }
    onMouseEnter={(e) => {
      if (!active && !disabled) {
        ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#3bb8d8'
        ;(e.currentTarget as HTMLButtonElement).style.color = '#0e7ea8'
      }
    }}
    onMouseLeave={(e) => {
      if (!active && !disabled) {
        ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#d4eaf2'
        ;(e.currentTarget as HTMLButtonElement).style.color = '#3d5a70'
      }
    }}
  >
    {label}
  </button>
)
