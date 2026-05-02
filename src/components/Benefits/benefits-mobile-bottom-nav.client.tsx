'use client'

import { Link } from '@/i18n/routing'

type Props = {
  labels: { home: string; calendar: string; benefits: string; account: string }
  ariaLabel: string
  locale: string
}

const activeColor = '#0e7ea8'
const defaultColor = '#8aaabb'

export function BenefitsMobileBottomNav({ labels, ariaLabel, locale }: Props) {
  const items = [
    {
      key: 'home',
      label: labels.home,
      href: '/' as const,
      active: false,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M3 12L12 3l9 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5 10v9a1 1 0 001 1h4v-4h4v4h4a1 1 0 001-1v-9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      key: 'calendar',
      label: labels.calendar,
      href: `/${locale}/event` as const,
      active: false,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
          <path
            d="M16 2v4M8 2v4M3 10h18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      key: 'benefits',
      label: labels.benefits,
      href: `/${locale}/benefits` as const,
      active: true,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      key: 'account',
      label: labels.account,
      href: `/${locale}/my-profile` as const,
      active: false,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
          <path
            d="M4 20c0-4 3.58-7 8-7s8 3 8 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  ]

  return (
    <nav
      aria-label={ariaLabel}
      className="sticky bottom-0 z-[100] border-t border-[#d4eaf2] bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="flex items-stretch">
        {items.map((item) => (
          <li key={item.key} className="flex-1">
            <Link
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium leading-tight"
              style={{ color: item.active ? activeColor : defaultColor }}
              aria-current={item.active ? 'page' : undefined}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
