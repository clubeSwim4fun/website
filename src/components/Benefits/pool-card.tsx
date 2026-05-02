import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { PoolCardImage } from './pool-card-image.client'

type Props = {
  t: Awaited<ReturnType<typeof getTranslations>>
  locale: string
}

export function PoolCard({ t, locale }: Props) {
  return (
    <div className="overflow-hidden rounded-[14px] border-2 border-[var(--benefits-border)] bg-white">
      <div className="grid md:grid-cols-2">
        {/* Image */}
        <div className="relative min-h-[220px] overflow-hidden">
          <PoolCardImage src="/static-images/event-image-1.webp" alt={t('pool.imageAlt')} />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'linear-gradient(to right, transparent, rgba(10,74,110,0.18))' }}
          />
        </div>

        {/* Body */}
        <div className="flex flex-col justify-center p-7">
          <div className="mb-2 font-['Syne'] text-xl font-extrabold text-[var(--benefits-deep)]">
            {t('pool.cardTitle')}
          </div>
          <p className="mb-5 text-sm leading-relaxed text-[var(--benefits-ink-mid)]">
            {t('pool.cardDesc')}
          </p>

          {/* Schedule */}
          <div className="mb-2.5 flex items-center gap-2.5 text-sm text-[var(--benefits-ink-mid)]">
            <svg
              viewBox="0 0 24 24"
              className="h-[15px] w-[15px] shrink-0 stroke-[var(--benefits-mid)]"
              fill="none"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{t('pool.schedule')}</span>
          </div>

          {/* Location */}
          <div className="mb-2.5 flex items-center gap-2.5 text-sm text-[var(--benefits-ink-mid)]">
            <svg
              viewBox="0 0 24 24"
              className="h-[15px] w-[15px] shrink-0 stroke-[var(--benefits-mid)]"
              fill="none"
              strokeWidth={2}
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{t('pool.location')}</span>
          </div>

          {/* Cost */}
          <div className="mb-2.5 flex items-center gap-2.5 text-sm text-[var(--benefits-ink-mid)]">
            <svg
              viewBox="0 0 24 24"
              className="h-[15px] w-[15px] shrink-0 stroke-[var(--benefits-mid)]"
              fill="none"
              strokeWidth={2}
            >
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            <span>{t('pool.cost')}</span>
          </div>

          <Link
            href={`/${locale}/pool`}
            className="mt-2 inline-flex self-start items-center gap-2 rounded-[10px] px-[22px] py-3 font-['Syne'] text-[13px] font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #0a4a6e, #0e7ea8)' }}
          >
            {t('pool.cta')}
            <svg
              viewBox="0 0 24 24"
              className="h-[13px] w-[13px] stroke-white"
              fill="none"
              strokeWidth={2.5}
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
