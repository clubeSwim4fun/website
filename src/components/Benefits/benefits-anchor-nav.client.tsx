'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/utilities/ui'

type Props = {
  labels: { pool: string; nutrition: string; equipment: string; races: string }
  ariaLabel: string
}

const SECTIONS = [
  { id: 'piscina', labelKey: 'pool' as const },
  { id: 'nutricao', labelKey: 'nutrition' as const },
  { id: 'equipamentos', labelKey: 'equipment' as const },
  { id: 'provas', labelKey: 'races' as const },
]

const PoolIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width={14}
    height={14}
    stroke="currentColor"
    fill="none"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path d="M2 12h20M2 17c3.3-3 6.7-3 10-3s6.7 0 10 3M2 7c3.3 3 6.7 3 10 3s6.7 0 10-3" />
  </svg>
)

const NutritionIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width={14}
    height={14}
    stroke="currentColor"
    fill="none"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
  </svg>
)

const EquipmentIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width={14}
    height={14}
    stroke="currentColor"
    fill="none"
    strokeWidth={2}
    aria-hidden="true"
  >
    <ellipse cx="12" cy="12" rx="10" ry="6" />
    <ellipse cx="12" cy="12" rx="4" ry="6" />
    <line x1="2" y1="12" x2="22" y2="12" />
  </svg>
)

const RacesIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width={14}
    height={14}
    stroke="currentColor"
    fill="none"
    strokeWidth={2}
    aria-hidden="true"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const ICONS: Record<string, React.ReactNode> = {
  piscina: <PoolIcon />,
  nutricao: <NutritionIcon />,
  equipamentos: <EquipmentIcon />,
  provas: <RacesIcon />,
}

// Mirrors the header's hide-on-scroll-down / show-on-scroll-up logic
function useHeaderVisible() {
  const [visible, setVisible] = useState(true)
  const [headerH, setHeaderH] = useState(52)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const updateHeaderH = () => setHeaderH(window.innerWidth >= 768 ? 68 : 52)
    updateHeaderH()
    window.addEventListener('resize', updateHeaderH)

    const onScroll = () => {
      const y = window.scrollY
      setVisible(y < 80 || y < lastScrollY.current)
      lastScrollY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', updateHeaderH)
    }
  }, [])

  return { visible, headerH }
}

export default function BenefitsAnchorNav({ labels, ariaLabel }: Props) {
  const [activeId, setActiveId] = useState<string>('piscina')
  const { visible: headerVisible, headerH } = useHeaderVisible()

  useEffect(() => {
    const elements = SECTIONS.map(({ id }) => document.getElementById(id)).filter(
      Boolean,
    ) as HTMLElement[]
    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      { threshold: 0.3 },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const labelMap: Record<string, string> = {
    piscina: labels.pool,
    nutricao: labels.nutrition,
    equipamentos: labels.equipment,
    provas: labels.races,
  }

  return (
    <div
      className="sticky z-[90] border-b border-[#d4eaf2] bg-white transition-[top] duration-300"
      style={{ top: headerVisible ? `calc(${headerH}px + env(safe-area-inset-top))` : 0 }}
    >
      <nav aria-label={ariaLabel}>
        <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex">
            {SECTIONS.map(({ id }) => (
              <a
                key={id}
                href={`#${id}`}
                className={cn(
                  'flex items-center gap-[7px] whitespace-nowrap border-b-[2.5px] px-5 py-4 text-[13px] font-semibold transition-colors duration-150',
                  activeId === id
                    ? 'border-[#0e7ea8] text-[#0e7ea8]'
                    : 'border-transparent text-[#8aaabb]',
                )}
              >
                {ICONS[id]}
                {labelMap[id]}
              </a>
            ))}
          </div>
        </div>
      </nav>
    </div>
  )
}
