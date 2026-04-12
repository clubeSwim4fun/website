/**
 * Shared icon map — single source of truth for rendering icons by key.
 * Matches ICON_OPTIONS in src/fields/iconOptions.ts.
 */
import {
  Shield,
  Activity,
  Star,
  Users,
  Heart,
  Trophy,
  Clock,
  Calendar,
  MapPin,
  Flag,
  ArrowRight,
  Cloud,
} from 'lucide-react'
import React from 'react'

export const ICON_MAP: Record<string, React.ReactNode> = {
  shield: <Shield size={17} strokeWidth={2} />,
  activity: <Activity size={17} strokeWidth={2} />,
  star: <Star size={17} strokeWidth={2} />,
  users: <Users size={17} strokeWidth={2} />,
  heart: <Heart size={17} strokeWidth={2} />,
  trophy: <Trophy size={17} strokeWidth={2} />,
  clock: <Clock size={17} strokeWidth={2} />,
  calendar: <Calendar size={17} strokeWidth={2} />,
  mapPin: <MapPin size={17} strokeWidth={2} />,
  flag: <Flag size={17} strokeWidth={2} />,
  arrow: <ArrowRight size={17} strokeWidth={2} />,
  cloud: <Cloud size={17} strokeWidth={2} />,
}
