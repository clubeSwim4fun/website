'use client'

import { useTranslations } from 'next-intl'

export function calcStrength(password: string): number {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

type Props = { password: string }

export function PasswordStrength({ password }: Props) {
  const t = useTranslations('Registration')
  if (!password) return null
  const score = calcStrength(password)
  const pct = (score / 4) * 100
  const color = score <= 1 ? '#e85d4a' : score <= 3 ? '#f59e0b' : '#2ecc71'
  const label =
    score <= 1
      ? t('strengthWeak')
      : score <= 2
        ? t('strengthFair')
        : score <= 3
          ? t('strengthGood')
          : t('strengthStrong')

  return (
    <div className="mt-1.5 flex flex-col gap-1">
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-xs" style={{ color }}>
        {label}
      </p>
    </div>
  )
}
