import React from 'react'
import { TemplateEmail } from './template'
import { User } from '@/payload-types'
import { getLocale, getTranslations } from 'next-intl/server'
import { Button } from '@react-email/components'

export async function UserResetPassword({ token }: { token: string }) {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'Email' })

  return (
    <TemplateEmail title={t(`ResetPassword.title`)}>
      <p>{t('ResetPassword.dearUser')}</p>
      <p>{t(`ResetPassword.description`)}</p>
      <Button
        href={`${process.env.NEXT_PUBLIC_SERVER_URL}/${locale}/reset-password?token=${token}`}
      >
        {t(`ResetPassword.button`)}
      </Button>
    </TemplateEmail>
  )
}
