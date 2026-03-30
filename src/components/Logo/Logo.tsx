import { Media as MediaType } from '@/payload-types'
import React from 'react'
import { ImageMedia } from '../Media/ImageMedia'

interface Props {
  className?: string
  media?: MediaType | null | string
}

export const Logo = (props: Props) => {
  const { media } = props

  if (media && typeof media === 'object') {
    return (
      <div className="h-10 w-auto flex items-center">
        <ImageMedia imgClassName="h-10 w-auto object-contain" priority resource={media} />
      </div>
    )
  }

  // No logo uploaded — render a small text placeholder so the Link
  // doesn't expand to fill available space and block page interactions
  return <span className="h-10 w-10 flex items-center justify-center text-sm font-bold">S4F</span>
}
