'use client'

import React, { Fragment } from 'react'

import type { Header as HeaderType, User } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { ChevronDown, SearchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import LogoutButton from '../Logout'
import { Cart } from '@/components/Cart'

export const HeaderNav: React.FC<{ data: HeaderType; user?: User }> = ({ data, user }) => {
  const navItems = data?.navItems || []

  return (
    <nav className="gap-3 items-center hidden md:flex" aria-label="Desktop navigation">
      {navItems.map(({ link }, i) => {
        return (
          <Fragment key={i}>
            {link.hasChildren && link.childrenPages!.length > 0 ? (
              <div className="group flex flex-col items-center relative">
                <CMSLink
                  key={i}
                  {...link}
                  appearance="link"
                  className="flex text-black dark:text-white"
                >
                  <ChevronDown
                    height={20}
                    width={20}
                    className="group-hover:rotate-180 transition duration-500 delay-50 ml-2 text-black dark:text-white"
                  />
                </CMSLink>
                <div className="max-h-0 group-hover:max-h-40 overflow-hidden flex flex-col transition-all duration-500 absolute top-8 bg-white dark:bg-blue-950 justify-center min-w-full border-t-2 border-white group-hover:border-blueSwim">
                  {link.childrenPages?.map((child, i) => (
                    <CMSLink
                      key={i}
                      type="reference"
                      {...child}
                      appearance="link"
                      className="text-black dark:text-white hover:bg-blueSwim hover:text-white rounded-none pl-2 pr-6 py-2"
                    />
                  ))}
                </div>
              </div>
            ) : (
              <CMSLink key={i} {...link} appearance="link" className="text-black dark:text-white" />
            )}
          </Fragment>
        )
      })}
      {!user && (
        <Button asChild variant={'link'} size={'clear'}>
          {/* TODO - Add label  */}
          <Link
            href={'/sign-in'}
            className="text-black dark:text-white group flex flex-col items-center"
          >
            Login
          </Link>
        </Button>
      )}
      {user && <LogoutButton />}
      <Link href="/search">
        <span className="sr-only">Search</span>
        <SearchIcon className="w-5 text-primary stroke-black dark:stroke-white" />
      </Link>
      <Cart />
    </nav>
  )
}
