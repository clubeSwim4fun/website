'use client'

import type { PayloadAdminBarProps, PayloadMeUser } from 'payload-admin-bar'

import { cn } from '@/utilities/ui'
import { useSelectedLayoutSegments } from 'next/navigation'
import { PayloadAdminBar } from 'payload-admin-bar'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

import './index.scss'

import { getClientSideURL } from '@/utilities/getURL'
import { Button } from '../ui/button'
import { CircleX, UserRoundCog } from 'lucide-react'

const baseClass = 'admin-bar'

const collectionLabels = {
  pages: {
    plural: 'Pages',
    singular: 'Page',
  },
  posts: {
    plural: 'Posts',
    singular: 'Post',
  },
  projects: {
    plural: 'Projects',
    singular: 'Project',
  },
}

const Title: React.FC = () => <span>Dashboard</span>

export const AdminBar: React.FC<{
  adminBarProps?: PayloadAdminBarProps
}> = (props) => {
  const { adminBarProps } = props || {}
  const segments = useSelectedLayoutSegments()
  const [show, setShow] = useState(false)
  const [showAdminMenu, setShowAdminMenu] = useState(false)
  const collection = (
    collectionLabels[segments?.[1] as keyof typeof collectionLabels] ? segments[1] : 'pages'
  ) as keyof typeof collectionLabels
  const router = useRouter()

  const onAuthChange = React.useCallback((user: PayloadMeUser) => {
    setShowAdminMenu(Boolean(user?.id))
  }, [])

  const handleAdminClick = (open: boolean) => {
    setShow(open)
    setShowAdminMenu(!open)
  }

  const MenuButton = () => {
    return (
      <div
        className={cn('absolute right-0 top-0 z-30', {
          hidden: !showAdminMenu,
          block: showAdminMenu,
        })}
      >
        <Button className={'flex justify-between space-x-3'} onClick={() => handleAdminClick(true)}>
          <span>Admin</span>
          <UserRoundCog height={10} width={10} />
        </Button>
      </div>
    )
  }

  return (
    <>
      <MenuButton />
      <div
        className={cn(baseClass, 'bg-black text-white z-30 right-0', {
          fixed: show,
          hidden: !show,
        })}
      >
        <div className="container flex">
          <PayloadAdminBar
            {...adminBarProps}
            className="py-2 text-white"
            classNames={{
              controls: 'font-medium text-white',
              logo: 'text-white',
              user: 'text-white',
            }}
            cmsURL={getClientSideURL()}
            collection={collection}
            collectionLabels={{
              plural: collectionLabels[collection]?.plural || 'Pages',
              singular: collectionLabels[collection]?.singular || 'Page',
            }}
            logo={<Title />}
            onAuthChange={onAuthChange}
            onPreviewExit={() => {
              fetch('/next/exit-preview').then(() => {
                router.push('/')
                router.refresh()
              })
            }}
            style={{
              backgroundColor: 'transparent',
              padding: 0,
              position: 'relative',
              zIndex: 'unset',
            }}
          />
          <Button
            className={'justify-between space-x-3 inline hover:bg-transparent'}
            onClick={() => handleAdminClick(false)}
            variant={'ghost'}
          >
            <CircleX height={20} width={20} />
          </Button>
        </div>
      </div>
    </>
  )
}
