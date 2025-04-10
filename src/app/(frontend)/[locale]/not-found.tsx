import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { getTranslations } from 'next-intl/server'

export default async function NotFound({ params }: { params?: { locale?: string } }) {
  const locale = params?.locale || 'pt'
  const t = await getTranslations({ locale, namespace: 'NotFound' })

  return (
    <div className="container py-28">
      <div className="prose max-w-none">
        <h1 style={{ marginBottom: 0 }}>{t('title')}</h1>
        <p className="mb-4">{t('description')}</p>
      </div>
      <Button asChild variant="default">
        <Link href="/">{t('goHome')}</Link>
      </Button>
    </div>
  )
}
