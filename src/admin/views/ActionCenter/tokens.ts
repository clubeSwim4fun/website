// Design tokens extracted from action-center.html :root
export const T = {
  // backgrounds
  bgBase: '#0c0e11',
  bgSurface: '#111418',
  bgRaised: '#181c22',
  bgHover: '#1e232b',
  bgActive: '#232930',

  // borders
  borderSubtle: 'rgba(255,255,255,0.06)',
  borderDefault: 'rgba(255,255,255,0.10)',
  borderStrong: 'rgba(255,255,255,0.18)',

  // brand
  teal: '#0bb4aa',
  tealDim: 'rgba(11,180,170,0.15)',
  tealGlow: 'rgba(11,180,170,0.08)',
  tealBorder: 'rgba(11,180,170,0.3)',

  // status
  amber: '#f59e0b',
  amberDim: 'rgba(245,158,11,0.14)',
  amberBorder: 'rgba(245,158,11,0.2)',
  red: '#ef4444',
  redDim: 'rgba(239,68,68,0.14)',
  redBorder: 'rgba(239,68,68,0.3)',
  green: '#22c55e',
  greenDim: 'rgba(34,197,94,0.14)',
  blue: '#3b82f6',
  blueDim: 'rgba(59,130,246,0.14)',
  blueBorder: 'rgba(59,130,246,0.2)',

  // text
  textPrimary: '#e8eaed',
  textSecondary: '#9aa3af',
  textMuted: '#5a6473',
  textDisabled: '#3a4150',

  // radius
  rSm: '5px',
  rMd: '8px',
  rLg: '12px',
} as const

export type UrgencyLevel = 'red' | 'amber' | 'none' | 'default'
