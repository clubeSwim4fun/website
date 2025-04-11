import { useTranslations } from 'next-intl'
import * as React from 'react'

export const Error: React.FC<{ error?: string }> = ({ error }) => {
  const t = useTranslations()

  return <div className="mt-2 text-red-500 text-sm col-span-6">{error || t('Common.required')}</div>
}
