import { GeneralConfig } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getMeUser } from '@/utilities/getMeUser'
import { Metadata } from 'next'
import { getTranslations, getFormatter } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { TypedLocale } from 'payload'
import { CheckCircle2, ArrowRight, User as UserIcon, Download, Lock } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { cn } from '@/utilities/ui'

const UserSubscriptionConfirmationPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ id?: string }>
}) => {
  const { locale } = await params
  const { id } = await searchParams
  const userObject = await getMeUser({ invalidateCache: true })
  const t = await getTranslations()
  const format = await getFormatter({ locale: locale as TypedLocale })

  if (!userObject || !userObject.user) {
    redirect(`sign-in?callbackUrl=/${locale}/subscription/order-generation`)
  }

  const user = userObject.user

  // Find the latest subscription for this payment intent
  const globalConfig = (await getCachedGlobal(
    'generalConfigs',
    1,
    locale as TypedLocale,
  )()) as GeneralConfig

  const today = format.dateTime(new Date(), { day: 'numeric', month: 'long', year: 'numeric' })

  const steps = [
    {
      label: t('Subscription.confirmStep1Title'),
      desc: t('Subscription.confirmStep1Desc'),
      done: true,
    },
    {
      label: t('Subscription.confirmStep2Title'),
      desc: t('Subscription.confirmStep2Desc'),
      done: true,
    },
    {
      label: t('Subscription.confirmStep3Title'),
      desc: t('Subscription.confirmStep3Desc'),
      done: false,
    },
  ]

  return (
    <section className=" pb-24 container max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <p className="text-xs text-muted-foreground mb-5">
        {t('Subscription.breadcrumbAccount')} ›{' '}
        <span className="text-primary">{t('Subscription.breadcrumbConfirmed')}</span>
      </p>

      {/* Hero */}
      <div className="rounded-xl bg-gradient-to-br from-[#0a4a6e] to-[#0e7ea8] p-6 text-white flex flex-col sm:flex-row sm:items-center gap-5 mb-5">
        <div className="w-14 h-14 rounded-full bg-white/15 border-2 border-white/30 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <p className="font-extrabold text-xl leading-tight mb-1">
            {t('Subscription.confirmHeroTitle', { username: user.name })}
          </p>
          <p className="text-sm opacity-80 leading-relaxed">{t('Subscription.confirmHeroSub')}</p>
        </div>
        <div className="flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-3.5 py-1.5 shrink-0 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
          <span className="text-[11px] font-bold">{t('Subscription.confirmActivePill')}</span>
        </div>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-5">
        {steps.map((step, i) => (
          <div
            key={i}
            className={cn(
              'rounded-xl border-2 p-4 flex sm:flex-col gap-3 sm:gap-2',
              step.done ? 'border-[#0e7ea8] bg-[#f0fafd]' : 'border-border bg-white',
            )}
          >
            <div
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0',
                step.done ? 'bg-[#0e7ea8] text-white' : 'bg-[#e0f5fb] text-[#0a4a6e]',
              )}
            >
              {i + 1}
            </div>
            <div>
              <p className="font-bold text-xs text-[#0a4a6e]">{step.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Detail cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {/* Payment details */}
        <div className="rounded-xl border-2 border-border overflow-hidden">
          <div className="flex">
            <div className="w-1.5 bg-green-500 shrink-0" />
            <div className="p-4 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                {t('Subscription.confirmPaymentDetailsTitle')}
              </p>
              <div className="flex flex-col gap-2">
                <DetailRow
                  label={t('Subscription.confirmStatus')}
                  value={
                    <span className="text-green-700 font-bold text-xs">
                      ✓ {t('Subscription.confirmStatusValue')}
                    </span>
                  }
                />
                <DetailRow label={t('Subscription.confirmDate')} value={today} />
                {id && (
                  <DetailRow
                    label={t('Subscription.confirmTransactionId')}
                    value={
                      <span className="font-mono text-[9px] bg-[#f0fafd] border border-border px-1.5 py-0.5 rounded text-muted-foreground">
                        {id.slice(0, 10)}…
                      </span>
                    }
                  />
                )}
                <DetailRow
                  label={t('Subscription.confirmReceipt')}
                  value={
                    <span className="text-[#0e7ea8] text-xs">
                      {t('Subscription.confirmReceiptValue')}
                    </span>
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Membership details */}
        <div className="rounded-xl border-2 border-border overflow-hidden">
          <div className="flex">
            <div className="w-1.5 bg-[#0e7ea8] shrink-0" />
            <div className="p-4 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                {t('Subscription.confirmMembershipDetailsTitle')}
              </p>
              <div className="flex flex-col gap-2">
                <DetailRow
                  label={t('Subscription.confirmMember')}
                  value={`${user.name} ${user.surname ?? ''}`.trim()}
                />
                <DetailRow
                  label={t('Subscription.confirmPlan')}
                  value={t('Subscription.confirmPlanValue')}
                />
                <DetailRow
                  label={t('Subscription.confirmMemberStatus')}
                  value={
                    <span className="text-green-700 font-bold text-xs">
                      ✓ {t('Subscription.confirmMemberStatusValue')}
                    </span>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex gap-2.5 rounded-xl bg-[#e0f5fb] border border-[#3bb8d8] p-3.5 text-sm text-[#0a4a6e] mb-5 leading-relaxed">
        <span className="text-base shrink-0">ℹ️</span>
        <span>{t('Subscription.confirmInfoBanner')}</span>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-2.5 flex-wrap">
        <Link
          href="/pool"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-br from-[#0a4a6e] to-[#0e7ea8] text-white rounded-xl px-6 py-3 font-bold text-sm"
        >
          {t('Subscription.confirmCTAPool')}
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </Link>
        <Link
          href="/my-profile"
          className="inline-flex items-center justify-center gap-2 border border-border rounded-xl px-5 py-2.5 text-sm text-[#0e7ea8] font-medium"
        >
          <UserIcon className="w-3.5 h-3.5" />
          {t('Subscription.confirmCTAProfile')}
        </Link>
      </div>

      {/* Security hint */}
      <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-4">
        <Lock className="w-2.5 h-2.5" />
        {t('Subscription.securityHint')}
      </p>
    </section>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-border last:border-0 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  )
}

export default UserSubscriptionConfirmationPage

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })
  const globalConfig = (await getCachedGlobal(
    'generalConfigs',
    1,
    locale as TypedLocale,
  )()) as GeneralConfig

  const subscription = globalConfig?.settings?.fixedPages?.subscription
  const clubTitle = globalConfig?.clubName || t('Club')
  const subscriptionTitle = subscription?.title || t('Subscription')

  return { title: `${clubTitle} - ${subscriptionTitle}` }
}
