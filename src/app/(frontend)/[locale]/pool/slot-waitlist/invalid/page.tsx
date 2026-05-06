import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'

export default async function SlotWaitlistInvalidPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'PoolWaitlistResponse' })

  return (
    <section className="container mx-auto max-w-lg py-24 text-center flex flex-col items-center gap-6">
      <div className="text-5xl">❌</div>
      <h1 className="text-2xl font-bold">{t('invalidTitle')}</h1>
      <p className="text-muted-foreground">{t('invalidDescription')}</p>
      <Link href="/pool" className="text-[hsl(var(--blue-swim))] underline underline-offset-4">
        {t('backToPool')}
      </Link>
    </section>
  )
}
