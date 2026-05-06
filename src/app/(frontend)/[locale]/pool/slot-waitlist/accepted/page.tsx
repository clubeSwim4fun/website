import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'

export default async function SlotWaitlistAcceptedPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'PoolWaitlistResponse' })

  return (
    <section className="container mx-auto max-w-lg py-24 text-center flex flex-col items-center gap-6">
      <div className="text-5xl">🎉</div>
      <h1 className="text-2xl font-bold">{t('acceptedTitle')}</h1>
      <p className="text-muted-foreground">{t('acceptedDescription')}</p>
      <Link
        href="/pool/my-subscription"
        className="inline-flex items-center justify-center rounded-md bg-[hsl(var(--blue-swim))] text-white px-6 py-3 font-semibold hover:opacity-90 transition-opacity"
      >
        {t('viewSubscription')}
      </Link>
    </section>
  )
}
