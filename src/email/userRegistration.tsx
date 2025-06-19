import React from 'react'
import { TemplateEmail } from './template'
import { User } from '@/payload-types'
import { getLocale, getTranslations } from 'next-intl/server'
import { Button } from '@react-email/components'

type Args = {
  user: User
}
export async function UserRegistration({ user }: Args) {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'Email' })
  const type = user.status === 'pendingUpdate' ? 'FixRegistration' : 'RegistrationPayment'

  return (
    <TemplateEmail title={t(`${type}.title`)}>
      <p>
        {t('dearUser', {
          name: user.name,
          surname: user.surname,
        })}
      </p>
      <p>{t(`${type}.description`)}</p>
      <Button href={`${process.env.NEXT_PUBLIC_SERVER_URL}/${locale}/subscription`}>
        {t(`${type}.button`)}
      </Button>
    </TemplateEmail>
  )
}
