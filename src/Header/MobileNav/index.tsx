'use client'

import React, { Fragment, useEffect, useState } from 'react'
import type { Group, Header as HeaderType, Page, Post, User } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { ChevronDown, Home, Calendar, User as UserIcon, X, Menu } from 'lucide-react'
import { usePathname } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Cart } from '@/components/Cart'

type LinkType = {
  type?: ('reference' | 'custom' | 'subscription') | null
  newTab?: boolean | null
  reference?:
    | ({ relationTo: 'pages'; value: string | Page } | null)
    | ({ relationTo: 'posts'; value: string | Post } | null)
  subscriptionGroup?: (string | null) | Group
  url?: string | null
  label: string
  hasChildren?: boolean | null
  childrenPages?:
    | {
        reference: { relationTo: 'pages'; value: string | Page }
        label: string
        id?: string | null
      }[]
    | null
  appearance?: ('default' | 'outline') | null
}

const getLinkHref = (link: LinkType) => {
  const { reference, type, url } = link
  return type === 'reference' && typeof reference?.value === 'object' && reference.value.slug
    ? `${reference?.relationTo !== 'pages' ? `/${reference?.relationTo}` : ''}/${reference.value.slug}`
    : url
}

const MobileHeaderNav: React.FC<{
  data: HeaderType
  user?: User
  registerSlug?: string | null
}> = ({ data, user, registerSlug }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [subNavOpen, setSubNavOpen] = useState<string[]>([])
  const navItems = data?.navItems || []
  const pathname = usePathname()
  const t = useTranslations('Nav')

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

  const close = () => {
    setIsOpen(false)
    document.body.classList.remove('no-scroll')
  }

  const toggleMenu = () => {
    const next = !isOpen
    setIsOpen(next)
    document.body.classList.toggle('no-scroll', next)
  }

  useEffect(() => {
    close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const toggleSub = (id: string) => {
    setSubNavOpen((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  return (
    <>
      {/* ── Top-right cart button (mobile only) ── */}
      {user && <div className="flex md:hidden items-center">{<Cart />}</div>}

      {/* ── Slide-down drawer ── */}
      <div
        className={`md:hidden fixed inset-x-0 top-[68px] bg-white border-b border-swim-border shadow-lg z-40 transition-all duration-300 overflow-hidden ${
          isOpen ? 'max-h-[calc(100vh-52px)] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav
          aria-label="Mobile navigation"
          className="flex flex-col overflow-y-auto max-h-[calc(100vh-52px)] pb-6"
        >
          {filteredNavItems.map(({ link }, i) => {
            const id = `${link.label}-${i}`
            const isSubOpen = subNavOpen.includes(id)
            const href = getLinkHref(link)
            const isActive = href === pathname

            return (
              <Fragment key={i}>
                {link.hasChildren && link.childrenPages!.length > 0 ? (
                  <div>
                    <div
                      className={`flex items-center justify-between px-5 py-3.5 border-b border-swim-border cursor-pointer ${
                        isActive ? 'bg-pale text-deep' : 'text-ink-mid'
                      }`}
                      onClick={() => toggleSub(id)}
                    >
                      <span className="text-sm font-medium">{link.label}</span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-300 ${isSubOpen ? 'rotate-180' : ''}`}
                      />
                    </div>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        isSubOpen ? 'max-h-96' : 'max-h-0'
                      }`}
                    >
                      {link.childrenPages?.map((child, j) => (
                        <CMSLink
                          key={j}
                          type="reference"
                          {...child}
                          appearance="link"
                          onClick={close}
                          className="block px-8 py-3 text-sm text-ink-mid border-b border-swim-border hover:bg-foam no-underline"
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <CMSLink
                    key={i}
                    {...link}
                    appearance="link"
                    onClick={close}
                    className={`px-5 py-3.5 text-sm font-medium border-b border-swim-border no-underline ${
                      isActive ? 'bg-pale text-deep' : 'text-ink-mid hover:bg-foam'
                    }`}
                  />
                )}
              </Fragment>
            )
          })}

          {user ? (
            <Link
              href="/my-profile"
              onClick={close}
              className={`px-5 py-3.5 text-sm font-medium border-b border-swim-border no-underline ${
                pathname === '/my-profile' ? 'bg-pale text-deep' : 'text-ink-mid hover:bg-foam'
              }`}
            >
              {t('myAccount')}
            </Link>
          ) : (
            <Link
              href="/sign-in"
              onClick={close}
              className={`px-5 py-3.5 text-sm font-medium border-b border-swim-border no-underline ${
                pathname === '/sign-in' ? 'bg-pale text-deep' : 'text-ink-mid hover:bg-foam'
              }`}
            >
              {t('login')}
            </Link>
          )}

          {!user && registerSlug && (
            <div className="px-5 pt-4">
              <Link
                href={`/${registerSlug}`}
                onClick={close}
                className="flex items-center justify-center bg-gradient-to-br from-deep to-mid text-white rounded-xl py-3.5 font-outfit font-bold text-sm tracking-wide no-underline"
              >
                {t('register')}
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* ── Bottom nav bar (mobile) ── */}
      <nav
        aria-label="Bottom navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-swim-border grid grid-cols-4 pb-safe"
      >
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 py-2 no-underline ${
            pathname === '/' ? 'text-mid' : 'text-ink-light'
          }`}
        >
          <Home size={20} strokeWidth={pathname === '/' ? 2.2 : 1.8} />
          <span className={`text-[9px] ${pathname === '/' ? 'font-semibold' : ''}`}>
            {t('home')}
          </span>
        </Link>

        <Link
          href="/event"
          className={`flex flex-col items-center gap-0.5 py-2 no-underline ${
            pathname?.startsWith('/event') ? 'text-mid' : 'text-ink-light'
          }`}
        >
          <Calendar size={20} strokeWidth={pathname?.startsWith('/event') ? 2.2 : 1.8} />
          <span className={`text-[9px] ${pathname?.startsWith('/event') ? 'font-semibold' : ''}`}>
            {t('calendar')}
          </span>
        </Link>

        <Link
          href={user ? '/my-profile' : '/sign-in'}
          className={`flex flex-col items-center gap-0.5 py-2 no-underline ${
            pathname === '/my-profile' || pathname === '/sign-in' ? 'text-mid' : 'text-ink-light'
          }`}
        >
          <UserIcon
            size={20}
            strokeWidth={pathname === '/my-profile' || pathname === '/sign-in' ? 2.2 : 1.8}
          />
          <span
            className={`text-[9px] ${
              pathname === '/my-profile' || pathname === '/sign-in' ? 'font-semibold' : ''
            }`}
          >
            {t('account')}
          </span>
        </Link>

        <button
          onClick={toggleMenu}
          className={`flex flex-col items-center gap-0.5 py-2 w-full ${isOpen ? 'text-mid' : 'text-ink-light'}`}
          aria-label={isOpen ? t('closeMenu') : t('openMenu')}
        >
          {isOpen ? <X size={20} strokeWidth={2.2} /> : <Menu size={20} strokeWidth={1.8} />}
          <span className={`text-[9px] ${isOpen ? 'font-semibold' : ''}`}>{t('menu')}</span>
        </button>
      </nav>
    </>
  )
}

export default MobileHeaderNav
