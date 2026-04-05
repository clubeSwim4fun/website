'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldError, FieldGroup, FieldLabel, FieldRow, Hint } from './StepCard'
import { UploadZone } from './UploadZone'
import { RegistrationFormData } from './types'
import { CmsField, label, options, required, extraFieldsForStep } from './useFormFields'
import { DynamicField } from './DynamicField'
import { MaskedInput } from './MaskedInput'
import { GeneralConfig } from '@/payload-types'
import { useTranslations } from 'next-intl'
import { validateNif } from '@/utilities/validateNif'

type Errors = Partial<Record<keyof RegistrationFormData, string>>

type Props = {
  data: RegistrationFormData
  errors: Errors
  onChange: (field: keyof RegistrationFormData, value: string) => void
  onFileChange: (field: 'identityFile' | 'profilePicture', files: File[]) => void
  generalConfig: GeneralConfig
  fieldMap: Record<string, CmsField>
}

export function Step3({ data, errors, onChange, onFileChange, generalConfig, fieldMap }: Props) {
  const t = useTranslations('Registration')
  const extra = extraFieldsForStep(fieldMap, '3')

  const nifInvalid = data.nif.length === 9 && !validateNif(data.nif)

  const disabilityField = fieldMap['disability']
  const disabilityOptions =
    disabilityField?.type === 'globalConfig'
      ? (
          (generalConfig?.userData?.disabilities ?? []) as {
            label: string
            collectionId?: string | null
          }[]
        ).map((d) => ({ label: d.label, value: d.collectionId ?? d.label }))
      : options(fieldMap, 'disability')

  const insuranceOptions = options(fieldMap, 'sportInsurance').length
    ? options(fieldMap, 'sportInsurance')
    : [
        { label: t('insuranceNone'), value: 'none' },
        { label: 'FPN (Federação Portuguesa de Natação)', value: 'fpn' },
        { label: 'FPT (Federação Portuguesa de Triatlo)', value: 'fpt' },
      ]

  return (
    <div className="flex flex-col gap-5">
      <FieldRow>
        <FieldGroup>
          <FieldLabel htmlFor="identity" required={required(fieldMap, 'identity')}>
            {label(fieldMap, 'identity', t('idDocumentNumber'))}
          </FieldLabel>
          <Input
            id="identity"
            placeholder={t('idDocumentPlaceholder')}
            value={data.identity}
            onChange={(e) => onChange('identity', e.target.value.toUpperCase())}
            className={errors.identity ? 'border-[#e85d4a]' : ''}
            maxLength={20}
          />
          <FieldError message={errors.identity} />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="nif" required={required(fieldMap, 'nif')}>
            {label(fieldMap, 'nif', t('nif'))}
          </FieldLabel>
          <MaskedInput
            id="nif"
            mask="999999999"
            placeholder="123456789"
            value={data.nif}
            onValueChange={(v) => onChange('nif', v)}
            className={errors.nif || nifInvalid ? 'border-[#e85d4a]' : ''}
            maxLength={9}
            inputMode="numeric"
          />
          {nifInvalid && !errors.nif && <FieldError message={t('errorNifInvalid')} />}
          <FieldError message={errors.nif} />
        </FieldGroup>
      </FieldRow>

      <FieldRow>
        <UploadZone
          label={label(fieldMap, 'identityFile', t('idDocumentCopy'))}
          value={data.identityFile}
          onChange={(files) => onFileChange('identityFile', files)}
          error={errors.identityFile}
          hint={t('uploadHint')}
        />
        <UploadZone
          label={label(fieldMap, 'profilePicture', t('profilePhoto'))}
          value={data.profilePicture}
          onChange={(files) => onFileChange('profilePicture', files)}
          error={errors.profilePicture}
          hint={t('uploadHint')}
        />
      </FieldRow>

      <FieldRow>
        <FieldGroup>
          <FieldLabel>{label(fieldMap, 'disability', t('disabilityCategory'))}</FieldLabel>
          <Select value={data.disability} onValueChange={(v) => onChange('disability', v)}>
            <SelectTrigger>
              <SelectValue placeholder={t('disabilityCategoryPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {disabilityOptions.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Hint>{t('disabilityHint')}</Hint>
        </FieldGroup>
        <FieldGroup>
          <FieldLabel>{label(fieldMap, 'sportInsurance', t('sportsInsurance'))}</FieldLabel>
          <Select value={data.sportInsurance} onValueChange={(v) => onChange('sportInsurance', v)}>
            <SelectTrigger>
              <SelectValue placeholder={t('sportsInsurancePlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {insuranceOptions.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldGroup>
      </FieldRow>

      {extra.map((f) => (
        <DynamicField
          key={f.name}
          name={f.name}
          field={f}
          value={data[f.name] as string | boolean}
          error={errors[f.name as keyof RegistrationFormData]}
          onChange={(name, val) => onChange(name as keyof RegistrationFormData, val as string)}
        />
      ))}
    </div>
  )
}
