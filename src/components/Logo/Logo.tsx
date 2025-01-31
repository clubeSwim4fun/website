import { Media as MediaType } from '@/payload-types'
import React from 'react'
import { ImageMedia } from '../Media/ImageMedia'

interface Props {
  className?: string
  media?: MediaType | null | string
}

export const Logo = (props: Props) => {
  const { media } = props

  return (
    media &&
    typeof media === 'object' && (
      <div className="h-10 w-10 flex">
        <ImageMedia imgClassName="-z-10 object-cover" priority resource={media} />
      </div>
    )
  )
}
