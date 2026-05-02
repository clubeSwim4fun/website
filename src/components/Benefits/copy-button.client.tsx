'use client'

import { useState } from 'react'

type Props = { code: string; ariaLabel: string; copiedLabel: string; variant?: 'light' | 'dark' }

export function CopyButton({ code, ariaLabel, copiedLabel, variant = 'light' }: Props) {
  const [shown, setShown] = useState(false)

  const handleClick = () => {
    navigator.clipboard.writeText(code).catch(() => {})
    setShown(true)
    setTimeout(() => setShown(false), 1800)
  }

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={handleClick}
        className={
          variant === 'dark'
            ? 'rounded-md border border-white/30 bg-white/10 p-1.5 text-white transition-colors hover:bg-white/20'
            : 'rounded-md p-1.5 text-[#0e7ea8] transition-colors hover:bg-[#e0f5fb]'
        }
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      </button>
      {shown && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-[#1a2e3a] text-white rounded whitespace-nowrap pointer-events-none">
          {copiedLabel}
        </span>
      )}
      <span className="sr-only" aria-live="polite">
        {shown ? copiedLabel : ''}
      </span>
    </div>
  )
}
