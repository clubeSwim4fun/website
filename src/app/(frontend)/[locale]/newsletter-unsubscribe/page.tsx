import { Link } from '@/i18n/routing'
import { getTranslations } from 'next-intl/server'
import { TypedLocale } from 'payload'
import { CheckCircle, XCircle, Mail } from 'lucide-react'

type Args = {
  params: Promise<{ locale: TypedLocale }>
  searchParams: Promise<{ status?: string }>
}

export default async function NewsletterUnsubscribePage({ params, searchParams }: Args) {
  const { locale } = await params
  const { status } = await searchParams
  const t = await getTranslations({ locale, namespace: 'NewsletterUnsubscribe' })

  const isSuccess = status === 'success'

  return (
    <main className="pt-[104px] pb-24 bg-[#fdf8f3] min-h-screen">
      <section className="container max-w-screen-sm mx-auto px-4 mt-10">
        <div className="bg-white border-2 border-[#d4eaf2] rounded-xl overflow-hidden">
          <div
            className={`h-1.5 w-full ${isSuccess ? 'bg-gradient-to-r from-[#0a4a6e] to-[#0e7ea8]' : 'bg-[#e85d4a]'}`}
          />

          <div className="px-8 py-10 flex flex-col items-center text-center gap-5">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isSuccess ? 'bg-[#e0f5fb]' : 'bg-red-50'
              }`}
            >
              {isSuccess ? (
                <CheckCircle className="w-8 h-8 text-[#0e7ea8]" strokeWidth={1.5} />
              ) : (
                <XCircle className="w-8 h-8 text-[#e85d4a]" strokeWidth={1.5} />
              )}
            </div>

            <div>
              <h1 className="text-xl font-extrabold text-[#0a4a6e] mb-2">
                {isSuccess ? t('successTitle') : t('invalidTitle')}
              </h1>
              <p className="text-sm text-[#3d5a70] leading-relaxed max-w-xs mx-auto">
                {isSuccess ? t('successMessage') : t('invalidMessage')}
              </p>
            </div>

            <div className="w-full border-t border-[#d4eaf2]" />

            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <Link
                href="/my-profile"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-br from-[#0a4a6e] to-[#0e7ea8] text-white font-bold text-sm rounded-xl px-5 py-3 hover:opacity-90 transition-opacity"
              >
                {t('managePreferences')}
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 border-2 border-[#d4eaf2] text-[#0e7ea8] font-medium text-sm rounded-xl px-5 py-3 hover:bg-[#f0fafd] transition-colors"
              >
                {t('backHome')}
              </Link>
            </div>

            {isSuccess && (
              <div className="flex gap-2 items-start bg-[#e0f5fb] border border-[#3bb8d8] rounded-xl p-3.5 text-xs text-[#0a4a6e] leading-relaxed w-full text-left">
                <Mail className="w-4 h-4 text-[#0e7ea8] flex-shrink-0 mt-0.5" />
                <span>{t('infoNote')}</span>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
