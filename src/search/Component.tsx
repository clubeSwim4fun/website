'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useState, useEffect } from 'react'
import { useDebounce } from '@/utilities/useDebounce'
import { useRouter, usePathname } from '@/i18n/routing'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

export const Search: React.FC = () => {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''
  const [value, setValue] = useState(initialQuery)
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations()

  const debouncedValue = useDebounce(value)

  useEffect(() => {
    // Only navigate when on the search page and value has actually changed
    if (pathname !== '/search') return
    router.push(`/search${debouncedValue ? `?q=${encodeURIComponent(debouncedValue)}` : ''}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue])

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <Label htmlFor="search" className="sr-only">
          {t('Search.label')}
        </Label>
        <Input
          id="search"
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
          }}
          placeholder={t('Search.searchPlaceholder')}
        />
        <button type="submit" className="sr-only">
          {t('Common.submit')}
        </button>
      </form>
    </div>
  )
}
