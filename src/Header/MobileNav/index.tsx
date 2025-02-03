'use client'

import React, { Fragment, useState } from 'react'
import type { Header as HeaderType, Page, Post, User } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { CMSLink } from '@/components/Link'
import { ChevronDown } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

type LinkType = {
  type?: ('reference' | 'custom') | null
  newTab?: boolean | null
  reference?:
    | ({
        relationTo: 'pages'
        value: string | Page
      } | null)
    | ({
        relationTo: 'posts'
        value: string | Post
      } | null)
  url?: string | null
  label: string
  hasChildren?: boolean | null
  childrenPages?:
    | {
        reference: {
          relationTo: 'pages'
          value: string | Page
        }
        label: string
        id?: string | null
      }[]
    | null
}

const getLinkHref = (link: LinkType) => {
  const { reference, type, url } = link
  const href =
    type === 'reference' && typeof reference?.value === 'object' && reference.value.slug
      ? `${reference?.relationTo !== 'pages' ? `/${reference?.relationTo}` : ''}/${
          reference.value.slug
        }`
      : url

  return href
}

const MobileHeaderNav: React.FC<{ data: HeaderType; user: User }> = ({ data, user }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [subNavOpen, setSubNavOpen] = useState<string[]>([])
  const navItems = data?.navItems || []
  let pathname = usePathname()

  if (pathname === '/') pathname = '/home'

  const handleMenuClick = () => {
    setIsOpen(!isOpen)
    document.body.classList.toggle('no-scroll')
  }

  const handleMenuItemClick = (e: React.MouseEvent<SVGGElement, MouseEvent>, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    setSubNavOpen((prev) => {
      if (prev.includes(id)) return prev.filter((menuLabel) => menuLabel !== id)
      else return [...prev, id]
    })
  }

  const MenuItem = ({ link, id }: { link: LinkType; id: string }) => {
    return (
      <div className={`group flex flex-col ${subNavOpen.some((s) => s === id) && 'sub-open'}`}>
        <CMSLink
          {...link}
          appearance="link"
          onClick={() => setIsOpen(false)}
          className={`pl-2 flex text-black dark:text-white justify-between items-center py-4 border-b border-gray-300 rounded-none ${getLinkHref(link) === pathname && 'bg-blueSwim text-white'}`}
        >
          <ChevronDown
            onClick={(e) => handleMenuItemClick(e, id)}
            height={20}
            width={20}
            className={`group-[.sub-open]:rotate-180 text-black dark:text-white ${getLinkHref(link) === pathname && 'text-white'} mr-2`}
          />
        </CMSLink>
        <div className="max-h-0 group-[.sub-open]:max-h-full overflow-hidden flex flex-col transition-[max-h] duration-500 bg-white dark:bg-blue-950 justify-center min-w-full">
          {link.childrenPages?.map((child, i) => (
            <CMSLink
              key={i}
              type="reference"
              {...child}
              appearance="link"
              onClick={() => setIsOpen(false)}
              className={`text-black dark:text-white rounded-none pl-6 pr-6 py-4 border-b border-gray-300  ${getLinkHref({ type: 'reference', ...child }) === pathname && 'bg-blueSwim text-white'}`}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex md:hidden group relative">
      <Button
        className={`w-6 h-6 relative group bg-transparent hover:bg-transparent ${isOpen && 'open'} absolute -top-9 right-2`}
        onClick={handleMenuClick}
        title="Menu"
      >
        <span className="absolute w-[80%] mx-auto border-t-2 top-2 group-[.open]:-translate-y-20 border-blueSwim"></span>
        <span className="absolute w-[80%] mx-auto border-t-2 top-4 group-[.open]:rotate-45 transition-all duration-300 border-blueSwim"></span>
        <span className="absolute w-[80%] mx-auto border-t-2 top-4 group-[.open]:-rotate-45 transition-all duration-500 border-blueSwim"></span>
        <span className="absolute w-[80%] mx-auto border-t-2 top-6 group-[.open]:-translate-y-20 border-blueSwim"></span>
      </Button>
      <nav
        aria-label="Mobile navigation"
        className={`${isOpen ? 'max-h-[100vh]' : 'max-h-0'} overflow-hidden h-[90vh] w-full transition-all duration-300 flex flex-col ${isOpen && 'pt-6'}`}
      >
        {navItems.map(({ link }, i) => {
          return (
            <Fragment key={i}>
              {link.hasChildren && link.childrenPages!.length > 0 ? (
                <MenuItem link={link} id={`${link.label}-${i}`} />
              ) : (
                <CMSLink
                  key={i}
                  {...link}
                  appearance="link"
                  onClick={() => setIsOpen(false)}
                  className={`pl-2 text-black dark:text-white py-4 border-b border-gray-300 rounded-none ${getLinkHref(link) === pathname && 'bg-blueSwim text-white'}`}
                />
              )}
            </Fragment>
          )
        })}
        {/* TODO - Improve this section to have a box and allow to login or create an account */}
        <Button asChild variant={'link'} size={'clear'}>
          {/* TODO - Add label  */}
          <Link
            href={'/sign-in'}
            onClick={() => setIsOpen(false)}
            className={`pl-2 text-black dark:text-white py-4 border-b border-gray-300 rounded-none ${'/sign-in' === pathname && 'bg-blueSwim text-white'}`}
          >
            Login
          </Link>
        </Button>
      </nav>
    </div>
  )
}

export default MobileHeaderNav
