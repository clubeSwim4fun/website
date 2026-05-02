'use client'
import { useState } from 'react'

type Props = { src: string; alt: string }

export function PoolCardImage({ src, alt }: Props) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div
        className="h-full min-h-[200px] w-full rounded-[10px]"
        style={{ background: 'linear-gradient(135deg, #0a4a6e 0%, #0e7ea8 100%)' }}
        aria-hidden="true"
      />
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className="h-full w-full rounded-[10px] object-cover"
    />
  )
}
