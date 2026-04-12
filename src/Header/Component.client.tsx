'use client'
import Link from 'next/link'
import { usePathname } from '@/i18n/routing'
import React, { useEffect, useRef, useState } from 'react'

import type { Header, User } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'
import MobileHeaderNav from './MobileNav'

interface HeaderClientProps {
  data: Header
  user?: User
  registerSlug?: string | null
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data, user, registerSlug }) => {
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (y < 80) {
        setVisible(true)
      } else {
        setVisible(y < lastScrollY.current)
      }
      lastScrollY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Always show on route change
  useEffect(() => {
    setVisible(true)
  }, [pathname])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-swim-border transition-transform duration-300 ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="max-w-[86rem] mx-auto px-6 md:px-12 h-[52px] md:h-[68px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <Logo media={data.logo} />
        </Link>
        <HeaderNav data={data} user={user} registerSlug={registerSlug} />
        <MobileHeaderNav data={data} user={user} registerSlug={registerSlug} />
      </div>
    </header>
  )
}
