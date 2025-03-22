import React from 'react'

import type { Event, Media as MediaType } from '@/payload-types'

import image1 from 'public/static-images/event-image-1.webp'
import image2 from 'public/static-images/event-image-3.webp'
import riverImage from 'public/static-images/event-image-2.webp'
import Image from 'next/image'

export const EventHero: React.FC<{
  event: Event
}> = ({ event }) => {
  const { id, title, isRiver } = event

  const image = Number(id) % 2 === 0 ? image2 : image1

  return (
    <div className="relative -mt-[10.4rem] flex items-end">
      <div className="container z-10 relative lg:grid lg:grid-cols-[1fr_72rem_1fr] text-white pb-8">
        <div className="col-start-1 col-span-1 md:col-start-2 md:col-span-2">
          <div className="">
            <h1 className="mb-6 text-3xl md:text-5xl lg:text-6xl">{title}</h1>
          </div>
        </div>
      </div>
      <div className="min-h-[80vh] select-none">
        <Image
          className="-z-10 object-cover"
          src={isRiver ? riverImage : image}
          fill={true}
          alt=""
        />

        <div className="absolute pointer-events-none left-0 bottom-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent" />
      </div>
    </div>
  )
}
