'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { FieldError } from './StepCard'
import { Toggle } from './Toggle'
import { RegistrationFormData } from './types'
import { CmsField, label, options, extraFieldsForStep } from './useFormFields'
import { DynamicField } from './DynamicField'
import { GeneralConfig } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { useTranslations } from 'next-intl'

type Errors = Partial<Record<keyof RegistrationFormData, string>>

type Props = {
  data: RegistrationFormData
  errors: Errors
  onChange: (field: keyof RegistrationFormData, value: string | boolean) => void
  fieldMap: Record<string, CmsField>
  generalConfig: GeneralConfig
}

export function Step4({ data, errors, onChange, fieldMap, generalConfig }: Props) {
  const t = useTranslations('Registration')
  const extra = extraFieldsForStep(fieldMap, '4')

  const heardField = fieldMap['heardAboutClub']
  const heardOptions =
    heardField?.type === 'globalConfig'
      ? (
          (generalConfig?.userData?.aboutClub ?? []) as {
            label: string
            collectionId?: string | null
          }[]
        ).map((o) => ({ label: o.label, value: o.collectionId ?? o.label }))
      : options(fieldMap, 'heardAboutClub')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
          {t('communicationPreferences')}
        </p>
        <div className="rounded-xl border border-border divide-y divide-border">
          <div className="px-4">
            <Toggle
              checked={data.emailNotifications}
              onChange={(v) => onChange('emailNotifications', v)}
              label={t('emailNotificationsLabel')}
              description={t('emailNotificationsDesc')}
            />
          </div>
          <div className="px-4">
            <Toggle
              checked={data.whatsappNotifications}
              onChange={(v) => onChange('whatsappNotifications', v)}
              label={t('whatsappNotificationsLabel')}
              description={t('whatsappNotificationsDesc')}
            />
          </div>
        </div>
      </div>

      {heardOptions.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-foreground/70">
            {label(fieldMap, 'heardAboutClub', t('heardAboutUs'))}
          </label>
          <select
            value={data.heardAboutClub}
            onChange={(e) => onChange('heardAboutClub', e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">{t('heardAboutUsPlaceholder')}</option>
            {heardOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Checkbox
          id="wantsInvoiceWithNif"
          checked={data.wantsInvoiceWithNif}
          onCheckedChange={(v) => onChange('wantsInvoiceWithNif', Boolean(v))}
        />
        <label htmlFor="wantsInvoiceWithNif" className="text-sm cursor-pointer">
          {label(fieldMap, 'wantsInvoiceWithNif', t('wantsInvoice'))}
        </label>
      </div>

      <div
        className={cn(
          'rounded-xl border p-4 flex gap-3 items-start',
          errors.consent ? 'border-[#e85d4a] bg-red-50' : 'border-[#3bb8d8] bg-[#e0f5fb]',
        )}
      >
        <Checkbox
          id="consent"
          checked={data.consent}
          onCheckedChange={(v) => onChange('consent', Boolean(v))}
          className="mt-0.5 shrink-0"
        />
        <label htmlFor="consent" className="text-sm cursor-pointer leading-relaxed">
          {label(fieldMap, 'consent', t('consentPrefix'))}{' '}
          <a
            href="/internal-rules"
            target="_blank"
            className="underline text-[hsl(var(--blue-swim))]"
          >
            {t('consentRegulations')}
          </a>{' '}
          {t('consentAnd')}{' '}
          <a
            href="/privacy-policy"
            target="_blank"
            className="underline text-[hsl(var(--blue-swim))]"
          >
            {t('consentPrivacy')}
          </a>
          .<span className="text-[#e85d4a] ml-0.5">*</span>
        </label>
      </div>
      <FieldError message={errors.consent} />

      {extra.map((f) => (
        <DynamicField
          key={f.name}
          name={f.name}
          field={f}
          value={data[f.name] as string | boolean}
          error={errors[f.name as keyof RegistrationFormData]}
          onChange={(name, val) =>
            onChange(name as keyof RegistrationFormData, val as string | boolean)
          }
        />
      ))}
    </div>
  )
}
