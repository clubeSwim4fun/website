'use client'

import React, { Fragment } from 'react'
import type { Header as HeaderType, User } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { ChevronDown, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import LogoutButton from '../Logout'
import { Cart } from '@/components/Cart'

export const HeaderNav: React.FC<{
  data: HeaderType
  user?: User
  registerSlug?: string | null
}> = ({ data, user, registerSlug }) => {
  const t = useTranslations('Nav')
  const navItems = data?.navItems || []

  const filteredNavItems = user
    ? navItems.filter(({ link }) => {
        if (!registerSlug) return true
        const refSlug =
          link.type === 'reference' &&
          link.reference &&
          typeof link.reference.value === 'object' &&
          'slug' in link.reference.value
            ? link.reference.value.slug
            : null
        const customUrl = link.type === 'custom' ? link.url : null
        return (
          refSlug !== registerSlug && customUrl !== `/${registerSlug}` && customUrl !== registerSlug
        )
      })
    : navItems

  return (
    <nav className="hidden md:flex items-center gap-1" aria-label="Desktop navigation">
      {filteredNavItems.map(({ link }, i) => (
        <Fragment key={i}>
          {link.hasChildren && link.childrenPages!.length > 0 ? (
            <div className="group relative flex flex-col items-center">
              <CMSLink
                {...link}
                appearance="link"
                className="flex items-center gap-1 text-sm font-medium text-ink-mid px-3.5 py-2 rounded-lg hover:bg-foam hover:text-mid transition-colors duration-150 no-underline"
              >
                <ChevronDown
                  size={14}
                  className="group-hover:rotate-180 transition-transform duration-300 ml-1"
                />
              </CMSLink>
              <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 absolute top-full mt-1 bg-white border border-swim-border rounded-xl shadow-lg min-w-[180px] py-1.5 transition-all duration-200 z-50">
                {link.childrenPages?.map((child, j) => (
                  <CMSLink
                    key={j}
                    type="reference"
                    {...child}
                    appearance="link"
                    className="block px-4 py-2 text-sm text-ink-mid hover:bg-foam hover:text-mid transition-colors no-underline"
                  />
                ))}
              </div>
            </div>
          ) : (
            <CMSLink
              key={i}
              {...link}
              appearance="link"
              className="text-sm font-medium text-ink-mid px-3.5 py-2 rounded-lg hover:bg-foam hover:text-mid transition-colors duration-150 no-underline"
            />
          )}
        </Fragment>
      ))}

      {user ? (
        <Link
          href="/my-profile"
          className="text-sm font-medium text-ink-mid px-3.5 py-2 rounded-lg hover:bg-foam hover:text-mid transition-colors duration-150 no-underline"
        >
          {t('myAccount')}
        </Link>
      ) : (
        <Link
          href="/sign-in"
          className="text-sm font-medium text-ink-mid px-3.5 py-2 rounded-lg hover:bg-foam hover:text-mid transition-colors duration-150 no-underline"
        >
          {t('login')}
        </Link>
      )}

      {user && <LogoutButton />}

      <Link
        href="/search"
        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-foam text-ink-mid hover:text-mid transition-colors duration-150"
        aria-label={t('search')}
      >
        <Search size={16} />
      </Link>

      {user && <Cart />}

      {!user && registerSlug && (
        <Link
          href={`/${registerSlug}`}
          className="ml-2 bg-gradient-to-br from-deep to-mid text-white px-5 py-2 rounded-full font-syne font-bold text-[13px] tracking-wide hover:opacity-90 transition-opacity no-underline"
        >
          {t('register')}
        </Link>
      )}
    </nav>
  )
}
