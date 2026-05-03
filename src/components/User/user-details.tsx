'use client'

import { User } from '@/payload-types'
import { useState, useEffect, useTransition } from 'react'
import flags from 'react-phone-number-input/flags'
import { useFormatter, useTranslations } from 'next-intl'
import { UserUpdateForm } from './user-update-form'
import { updateNotificationPreferences } from '@/actions/updateNotificationPreferences'
import { Mail } from 'lucide-react'

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

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-60"
      style={{ background: checked ? '#0e7ea8' : '#d4eaf2' }}
    >
      <span
        className="pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </button>
  )
}

type Tab = 'personal' | 'address' | 'communications'
const TABS: Tab[] = ['personal', 'address', 'communications']

type Props = {
  user: User
  countryCode: string
}

export const UserDetails: React.FC<Props> = ({ user, countryCode }) => {
  const t = useTranslations('User.Details')
  const tc = useTranslations('Communications')
  const tReg = useTranslations('Registration')
  const format = useFormatter()
  const [activeTab, setActiveTab] = useState<Tab>('personal')
  const nationality = user.nationality as string
  const [emailEnabled, setEmailEnabled] = useState(user.emailNotificationsEnabled ?? false)
  const [isPending, startTransition] = useTransition()
  const [savedFlash, setSavedFlash] = useState(false)

  // Pre-select tab from URL hash on mount (e.g. /my-profile#communications)
  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as Tab
    if (TABS.includes(hash)) setActiveTab(hash)
  }, [])

  const handleToggle = (value: boolean) => {
    setEmailEnabled(value)
    startTransition(async () => {
      await updateNotificationPreferences({ emailNotificationsEnabled: value })
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 1500)
    })
  }

  const tabLabel = (tab: Tab) => {
    if (tab === 'personal') return t('myData')
    if (tab === 'address') return t('myAddress')
    return t('communications')
  }

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex gap-1.5 mb-3 sm:mb-5 flex-wrap">
        {TABS.map((tab) => {
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
              {tabLabel(tab)}
            </button>
          )
        })}
      </div>

      {/* Info card */}
      <div
        className="relative rounded-[14px] p-4 sm:p-6"
        style={{ background: '#fff', border: '2px solid #d4eaf2' }}
      >
        {activeTab !== 'communications' && (
          <div className="hidden sm:block absolute top-4 right-4 sm:top-5 sm:right-5">
            <UserUpdateForm user={user} />
          </div>
        )}

        {activeTab === 'personal' && (
          <>
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
                value={(() => {
                  const g = user.gender
                  if (!g) return undefined
                  const map: Record<string, string> = {
                    male: tReg('genderMale'),
                    female: tReg('genderFemale'),
                    other: tReg('genderOther'),
                    not_specified: tReg('genderNotSpecified'),
                    // legacy values from old relationship-based gender docs
                    masculino: tReg('genderMale'),
                    feminino: tReg('genderFemale'),
                  }
                  return map[g.toLowerCase()] ?? g
                })()}
              />
              <InfoField label={t('phone')} value={user.phone} />
            </div>
            <div className="mt-4 pt-4 sm:hidden" style={{ borderTop: '1px solid #d4eaf2' }}>
              <InfoField label={t('email')} value={user.email} />
            </div>
            <div className="hidden sm:block mt-5">
              <div className="grid grid-cols-3 gap-x-6">
                <InfoField label={t('email')} value={user.email} />
              </div>
            </div>
          </>
        )}

        {activeTab === 'address' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-4 sm:gap-y-5 sm:pr-20">
            <div className="col-span-2 sm:col-span-1">
              <InfoField label={t('street')} value={user.Address?.street} />
            </div>
            <InfoField label={t('state')} value={user.Address?.state} />
            <InfoField label={t('zipcode')} value={user.Address?.zipcode} />
          </div>
        )}

        {activeTab === 'communications' && (
          <div>
            <div
              className="flex items-center gap-3 mb-5 pb-4"
              style={{ borderBottom: '1.5px solid #d4eaf2' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: '#e0f5fb' }}
              >
                <Mail className="w-5 h-5" style={{ color: '#0e7ea8' }} />
              </div>
              <div>
                <p className="font-bold text-[15px]" style={{ color: '#0a4a6e' }}>
                  {tc('title')}
                </p>
                <p className="text-[13px]" style={{ color: '#8aaabb' }}>
                  {tc('subtitle')}
                </p>
              </div>
            </div>

            <div
              className="flex items-center gap-4 py-4"
              style={{ borderBottom: '1px solid #d4eaf2' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: '#f0fafd' }}
              >
                <Mail className="w-5 h-5" style={{ color: '#0e7ea8' }} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[14px] mb-0.5" style={{ color: '#0f1f2e' }}>
                  {tc('emailTitle')}
                </p>
                <p className="text-[12px] mb-2" style={{ color: '#8aaabb' }}>
                  {tc('emailDesc')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {tc('emailTags')
                    .split(' · ')
                    .map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] px-2.5 py-0.5 rounded-full font-medium"
                        style={
                          emailEnabled
                            ? {
                                background: '#e0f5fb',
                                color: '#0a4a6e',
                                border: '1px solid #3bb8d8',
                              }
                            : {
                                background: '#f1f5f9',
                                color: '#8aaabb',
                                border: '1px solid #d4eaf2',
                              }
                        }
                      >
                        {tag}
                      </span>
                    ))}
                </div>
              </div>

              <div className="flex flex-col items-center gap-1 shrink-0">
                <Toggle checked={emailEnabled} onChange={handleToggle} disabled={isPending} />
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: emailEnabled ? '#0e7ea8' : '#8aaabb' }}
                >
                  {isPending
                    ? tc('saving')
                    : savedFlash
                      ? tc('saved')
                      : emailEnabled
                        ? tc('enabled')
                        : tc('disabled')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
