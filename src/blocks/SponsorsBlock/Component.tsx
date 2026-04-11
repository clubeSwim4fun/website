'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { SponsorsBlock as SponsorsBlockProps } from '@/payload-types'
import type { Media } from '@/payload-types'

const SLOT_INTERVAL = 2800
const TRANSITION_MS = 500
const VISIBLE_SLOTS = 4

type SlotState = {
  sponsorIndex: number
  opacity: number
}

export const SponsorsBlockComponent: React.FC<SponsorsBlockProps> = ({ title, sponsors }) => {
  const items = sponsors ?? []
  const count = items.length
  const visibleCount = Math.min(VISIBLE_SLOTS, count)

  const [slots, setSlots] = useState<SlotState[]>(() =>
    Array.from({ length: visibleCount }, (_, i) => ({ sponsorIndex: i, opacity: 1 })),
  )

  // All mutable cycle state lives in a single ref — no stale closure issues
  const cycleRef = useRef({ nextSlot: 0, nextSponsor: visibleCount % count })

  useEffect(() => {
    if (count < 2) return

    const id = setInterval(() => {
      const { nextSlot, nextSponsor } = cycleRef.current

      // Fade out
      setSlots((prev) => prev.map((s, i) => (i === nextSlot ? { ...s, opacity: 0 } : s)))

      setTimeout(() => {
        // Swap content while invisible
        setSlots((prev) =>
          prev.map((s, i) => (i === nextSlot ? { sponsorIndex: nextSponsor, opacity: 0 } : s)),
        )

        // Force repaint then fade in
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setSlots((prev) => prev.map((s, i) => (i === nextSlot ? { ...s, opacity: 1 } : s)))
          })
        })

        // Advance both pointers immediately after scheduling the swap
        cycleRef.current = {
          nextSlot: (nextSlot + 1) % visibleCount,
          nextSponsor: (nextSponsor + 1) % count,
        }
      }, TRANSITION_MS)
    }, SLOT_INTERVAL)

    return () => clearInterval(id)
  }, [count, visibleCount])

  if (!count) return null

  return (
    <section className="w-full py-10 border-t border-border">
      <div className="container">
        {title && (
          <p className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-widest">
            {title}
          </p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {slots.map((slot, slotIndex) => {
            const sponsor = items[slot.sponsorIndex]
            if (!sponsor) return null

            const logo = sponsor.logo as Media | null
            const logoUrl = logo && typeof logo === 'object' && logo.url ? logo.url : null

            const logoContent = logoUrl ? (
              <Image
                src={logoUrl}
                alt={sponsor.name ?? 'Sponsor logo'}
                width={160}
                height={64}
                className="object-contain max-h-14 w-auto grayscale hover:grayscale-0 transition-all duration-300"
              />
            ) : (
              <span className="text-sm text-muted-foreground">{sponsor.name}</span>
            )

            const cardClass =
              'flex items-center justify-center rounded-lg border border-border bg-card p-5 h-24 hover:border-primary/40 transition-colors'

            const style: React.CSSProperties = {
              opacity: slot.opacity,
              transition: `opacity ${TRANSITION_MS}ms ease-in-out`,
            }

            return sponsor.url ? (
              <a
                key={slotIndex}
                href={sponsor.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cardClass}
                aria-label={sponsor.name ?? 'Sponsor'}
                style={style}
              >
                {logoContent}
              </a>
            ) : (
              <div key={slotIndex} className={cardClass} style={style}>
                {logoContent}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
