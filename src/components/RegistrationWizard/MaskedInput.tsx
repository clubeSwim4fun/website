'use client'

import { Input } from '@/components/ui/input'
import { cn } from '@/utilities/ui'

/**
 * Mask chars: '9' = digit, 'A' = uppercase letter, '*' = any alphanumeric.
 * Everything else is treated as a literal separator (auto-inserted).
 */
export function applyMask(raw: string, mask: string): string {
  // Strip everything that isn't alphanumeric from raw input
  const chars = raw.replace(/[^0-9a-zA-Z]/g, '').split('')
  let result = ''
  let ci = 0

  for (let mi = 0; mi < mask.length && ci < chars.length; mi++) {
    const m = mask[mi]!
    const c = chars[ci]!

    if (m === '9') {
      if (/\d/.test(c)) {
        result += c
        ci++
      } else ci++ // skip invalid char
    } else if (m === 'A') {
      if (/[a-zA-Z]/.test(c)) {
        result += c.toUpperCase()
        ci++
      } else ci++
    } else if (m === '*') {
      result += c.toUpperCase()
      ci++
    } else {
      // literal separator
      result += m
      if (c === m) ci++ // consume if user typed it
    }
  }

  return result
}

type Props = Omit<React.ComponentProps<typeof Input>, 'onChange' | 'value'> & {
  mask: string
  value: string
  /** Called with (maskedValue) — store the masked value in state */
  onValueChange: (masked: string) => void
}

export function MaskedInput({ mask, value, onValueChange, className, ...props }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyMask(e.target.value, mask)
    onValueChange(masked)
  }

  return <Input {...props} value={value} onChange={handleChange} className={cn(className)} />
}
