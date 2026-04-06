'use client'

import { User } from '@/payload-types'
import { useState } from 'react'
import flags from 'react-phone-number-input/flags'
import { useFormatter, useTranslations } from 'next-intl'
import { UserUpdateForm } from './user-update-form'

const FlagComponent = ({ country, countryName }: { country: string; countryName: string }) => {
  const Flag = flags[country as keyof typeof flags]
  return (
    <span className="inline-flex h-4 w-6 overflow-hidden rounded-sm [&_svg]:size-full">
      {Flag && <Flag title={countryName} />}
    </span>
  )
}

const InfoField: React.FC<{ label: string; value?: React.ReactNode; fullWidth?: boolean }> = ({
  label,
  value,
  fullWidth,
}) => (
  <div className={fullWidth ? 'col-span-2 sm:col-span-3' : ''}>
    <div
      className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[.7px] mb-1"
      style={{ color: '#8aaabb' }}
    >
      {label}
    </div>
    <div className="text-[14px] font-medium" style={{ color: '#0f1f2e' }}>
      {value ?? '—'}
    </div>
  </div>
)

type Tab = 'personal' | 'address'

type Props = {
  user: User
  countryCode: string
}

export const UserDetails: React.FC<Props> = ({ user, countryCode }) => {
  const t = useTranslations('User.Details')
  const format = useFormatter()
  const [activeTab, setActiveTab] = useState<Tab>('personal')
  const nationality = user.nationality as string

  return (
    <div>
      {/* Tab switcher — full width on mobile, inline on desktop */}
      <div className="flex gap-1.5 mb-3 sm:mb-5">
        {(['personal', 'address'] as Tab[]).map((tab) => {
          const label = tab === 'personal' ? t('myData') : t('myAddress')
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-[10px] text-[13px] font-medium transition-all"
              style={
                isActive
                  ? {
                      background: 'linear-gradient(135deg, #0a4a6e, #0e7ea8)',
                      color: '#fff',
                      fontWeight: 600,
                      border: '1.5px solid transparent',
                    }
                  : {
                      color: '#3d5a70',
                      background: '#fff',
                      border: '1.5px solid #d4eaf2',
                    }
              }
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Info card */}
      <div
        className="relative rounded-[14px] p-4 sm:p-6"
        style={{ background: '#fff', border: '2px solid #d4eaf2' }}
      >
        {/* Edit button — top right, desktop only (mobile has it in the hero) */}
        <div className="hidden sm:block absolute top-4 right-4 sm:top-5 sm:right-5">
          <UserUpdateForm user={user} />
        </div>

        {activeTab === 'personal' && (
          <>
            {/* 2-col on mobile, 3-col on desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-4 sm:gap-y-5 sm:pr-20">
              <InfoField label={t('nif')} value={user.nif} />
              <InfoField label={t('identity')} value={user.identity} />
              <InfoField
                label={t('nationality')}
                value={
                  nationality ? (
                    <span className="inline-flex items-center gap-1.5">
                      <FlagComponent country={countryCode} countryName={nationality} />
                      {nationality}
                    </span>
                  ) : undefined
                }
              />
              {user.birthDate && (
                <InfoField
                  label={t('birthday')}
                  value={format.dateTime(new Date(user.birthDate), { dateStyle: 'medium' })}
                />
              )}
              <InfoField
                label={t('gender')}
                value={
                  typeof user.gender === 'object' ? user.gender?.value : (user.gender ?? undefined)
                }
              />
              <InfoField label={t('phone')} value={user.phone} />
            </div>
            {/* Email full-width below divider on mobile */}
            <div className="mt-4 pt-4 sm:hidden" style={{ borderTop: '1px solid #d4eaf2' }}>
              <InfoField label={t('email')} value={user.email} />
            </div>
            {/* Email in grid on desktop */}
            <div className="hidden sm:block mt-5">
              <div className="grid grid-cols-3 gap-x-6">
                <InfoField label={t('email')} value={user.email} />
              </div>
            </div>
          </>
        )}

        {activeTab === 'address' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-4 sm:gap-y-5 sm:pr-20">
            {/* Street full-width on mobile */}
            <div className="col-span-2 sm:col-span-1">
              <InfoField label={t('street')} value={user.Address?.street} />
            </div>
            <InfoField label={t('state')} value={user.Address?.state} />
            <InfoField label={t('zipcode')} value={user.Address?.zipcode} />
          </div>
        )}
      </div>
    </div>
  )
}
