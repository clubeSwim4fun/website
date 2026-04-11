'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Calendar, Flag, User, Star } from 'lucide-react'
import { cn } from '@/utilities/ui'

export const ICONS = {
  arrow: <ArrowRight size={15} strokeWidth={2.5} />,
  calendar: <Calendar size={15} strokeWidth={2} />,
  flag: <Flag size={15} strokeWidth={2} />,
  user: <User size={15} strokeWidth={2} />,
  star: <Star size={15} strokeWidth={2} />,
  none: null,
} as const

export type CtaLinkData = {
  type?: 'reference' | 'custom' | null
  newTab?: boolean | null
  reference?: { relationTo: string; value: unknown } | null
  url?: string | null
  label: string
  appearance?: 'primary' | 'primaryDark' | 'secondary' | null
  icon?: keyof typeof ICONS | null
  iconRight?: boolean | null
}

export function resolveCtaHref(link: CtaLinkData): string {
  if (link.type === 'reference' && link.reference && typeof link.reference.value === 'object') {
    const slug = (link.reference.value as { slug?: string }).slug ?? ''
    return link.reference.relationTo === 'pages'
      ? `/${slug}`
      : `/${link.reference.relationTo}/${slug}`
  }
  return link.url ?? '#'
}

type Props = {
  link: CtaLinkData
  /** Context controls default colour scheme. 'dark' = on dark bg (hero), 'light' = on light bg (content) */
  context?: 'dark' | 'light'
  className?: string
}

export const CtaButton: React.FC<Props> = ({ link, context = 'dark', className }) => {
  const href = resolveCtaHref(link)
  const iconKey = (link.icon ?? 'none') as keyof typeof ICONS
  const icon = iconKey !== 'none' ? ICONS[iconKey] : null
  const appearance = link.appearance ?? 'primary'

  const styles = cn(
    'inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-syne font-bold text-sm transition-all duration-200 no-underline',
    appearance === 'primary' &&
      context === 'dark' &&
      'bg-white text-deep hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.2)]',
    appearance === 'primary' &&
      context === 'light' &&
      'bg-deep text-white hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(10,74,110,0.35)]',
    appearance === 'primaryDark' &&
      'bg-deep text-white hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(10,74,110,0.35)]',
    appearance === 'secondary' &&
      context === 'dark' &&
      'border border-white/35 text-white hover:bg-white/10 hover:border-white/60',
    appearance === 'secondary' &&
      context === 'light' &&
      'border border-swim-border text-ink-mid hover:bg-foam hover:border-mid',
    className,
  )

  return (
    <Link
      href={href}
      target={link.newTab ? '_blank' : undefined}
      rel={link.newTab ? 'noopener noreferrer' : undefined}
      className={styles}
    >
      {icon && !link.iconRight && <span className="flex-shrink-0">{icon}</span>}
      {link.label}
      {icon && link.iconRight && <span className="flex-shrink-0">{icon}</span>}
    </Link>
  )
}
