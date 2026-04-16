import React from 'react'

export type HeroIconType =
  | 'trophy'
  | 'location'
  | 'euro'
  | 'calendar'
  | 'users'
  | 'star'
  | 'check'
  | 'clock'
  | 'heart'
  | 'shield'
  | 'waves'
  | 'swimming'

interface HeroIconProps {
  type: HeroIconType
  className?: string
}

export const HeroIcon: React.FC<HeroIconProps> = ({ type, className = 'w-4 h-4' }) => {
  const iconMap = {
    trophy: '🏅',
    location: '📍',
    euro: '💶',
    calendar: '📅',
    users: '👥',
    star: '⭐',
    check: '✓',
    clock: '⏰',
    heart: '❤️',
    shield: '🛡️',
    waves: '🌊',
    swimming: '🏊',
  }

  return (
    <span className={className} role="img" aria-hidden="true">
      {iconMap[type]}
    </span>
  )
}
