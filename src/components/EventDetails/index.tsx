'use client'

import { Event } from '@/payload-types'
import { useEffect, useState } from 'react'

export const EventDetails: React.FC<{
  event: Event
}> = (props) => {
  const [topClass, setTopClass] = useState('top-4')
  const { event } = props

  useEffect(() => {
    let lastScrollY = window.scrollY

    const handleScroll = () => {
      if (window.scrollY < lastScrollY) {
        // Scrolling up
        setTopClass('top-24')
      } else {
        // Scrolling down or idle
        setTopClass('top-4')
      }
      lastScrollY = window.scrollY
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <aside className={`sticky ${topClass} border-2 rounded-md border-gray-600 p-4 h-max`}>
      {' '}
      some content here
    </aside>
  )
}
