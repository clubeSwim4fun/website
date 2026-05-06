import { Media as MediaType } from '@/payload-types'
import React from 'react'
import { ImageMedia } from '../Media/ImageMedia'
import { cn } from '@/utilities/ui'

interface Props {
  className?: string
  media?: MediaType | null | string
}

export const Logo = (props: Props) => {
  const { media, className } = props

  if (media && typeof media === 'object') {
    return (
      <div className={cn('h-10 w-auto flex items-center', className)}>
        <ImageMedia imgClassName="h-10 w-auto object-contain" priority resource={media} />
      </div>
    )
  }

  return (
    <span className={cn('h-10 w-10 flex items-center justify-center text-sm font-bold', className)}>
      S4F
    </span>
  )
}
