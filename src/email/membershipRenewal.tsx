import React from 'react'
import { TemplateEmail } from './template'
import { User } from '@/payload-types'
import { getLocale, getTranslations } from 'next-intl/server'
import { Button } from '@react-email/components'

type Args = {
  user: User
}

export async function MembershipRenewalEmail({ user }: Args) {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'Email' })

  return (
    <TemplateEmail title={t('MembershipRenewal.title')}>
      <p>
        {t('dearUser', {
          name: user.name,
          surname: user.surname,
        })}
      </p>
      <p>{t('MembershipRenewal.description')}</p>
      <Button href={`${process.env.NEXT_PUBLIC_SERVER_URL}/${locale}/subscription`}>
        {t('MembershipRenewal.button')}
      </Button>
    </TemplateEmail>
  )
}
