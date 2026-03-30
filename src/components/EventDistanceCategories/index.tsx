import { Event } from '@/payload-types'
import { ExternalLink } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

type DistanceCategory = NonNullable<Event['distanceCategories']>[number]

export const EventDistanceCategories: React.FC<{
  categories: DistanceCategory[]
}> = async ({ categories }) => {
  const t = await getTranslations('Event')

  if (!categories?.length) return null

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-extrabold mb-4">{t('distances')}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-blueSwim p-4 bg-white dark:bg-slate-900 shadow-sm"
          >
            <h3 className="font-bold text-lg mb-3 text-blueSwim uppercase tracking-wide">
              {cat.name}
            </h3>
            <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
              {cat.totalDistance != null && (
                <li>
                  <span className="font-medium">{t('totalDistance')}:</span>{' '}
                  {cat.totalDistance.toLocaleString('pt-PT')} m
                </li>
              )}
              {cat.swimDistance != null && (
                <li>
                  <span className="font-medium">{t('swimDistance')}:</span>{' '}
                  {cat.swimDistance.toLocaleString('pt-PT')} m
                </li>
              )}
              {cat.runDistance != null && (
                <li>
                  <span className="font-medium">{t('runDistance')}:</span>{' '}
                  {cat.runDistance.toLocaleString('pt-PT')} m
                </li>
              )}
              {cat.transitions && (
                <li>
                  <span className="font-medium">{t('transitions')}:</span> {cat.transitions}
                </li>
              )}
              {cat.longestSwim != null && (
                <li>
                  <span className="font-medium">{t('longestSwim')}:</span>{' '}
                  {cat.longestSwim.toLocaleString('pt-PT')} m
                </li>
              )}
              {cat.longestRun != null && (
                <li>
                  <span className="font-medium">{t('longestRun')}:</span>{' '}
                  {cat.longestRun.toLocaleString('pt-PT')} m
                </li>
              )}
              {cat.elevationGain != null && (
                <li>
                  <span className="font-medium">{t('elevationGain')}:</span> {cat.elevationGain} D+
                </li>
              )}
              {cat.timeLimit && (
                <li>
                  <span className="font-medium">{t('timeLimit')}:</span> {cat.timeLimit}
                </li>
              )}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              {cat.regulationUrl && (
                <a
                  href={cat.regulationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold border border-blueSwim text-blueSwim rounded px-2 py-1 hover:bg-blueSwim hover:text-white transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  {t('regulation')}
                </a>
              )}
              {cat.registrationUrl && (
                <a
                  href={cat.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold bg-blueSwim text-white rounded px-2 py-1 hover:bg-blueSwim/90 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  {t('register')}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
