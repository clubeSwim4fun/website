'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header, User } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'
import MobileHeaderNav from './MobileNav'

interface HeaderClientProps {
  data: Header
  user: User
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data, user }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const [showMenu, setShowMenu] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const pathname = usePathname()

  const handleScroll = () => {
    if (window.scrollY < 100) {
      return
    }
    setShowMenu(window.scrollY < lastScrollY)

    setLastScrollY(window.scrollY)
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollY])

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  return (
    <header
      className={`${showMenu ? 'transform translate-y-0' : 'transform -translate-y-full'}
         fixed duration-500 z-20 w-full bg-white dark:bg-blue-950
        `}
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="container py-8 flex flex-col md:flex-row justify-between relative">
        <Link href="/" className="w-fit">
          <Logo media={data.logo} />
        </Link>
        <MobileHeaderNav data={data} user={user} />
        <HeaderNav data={data} user={user} />
      </div>
    </header>
  )
}
