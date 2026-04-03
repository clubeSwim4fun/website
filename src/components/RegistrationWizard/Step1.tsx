'use client'

import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/phone-input'
import { FieldError, FieldGroup, FieldLabel, FieldRow, Hint } from './StepCard'
import { PasswordStrength } from './PasswordStrength'
import { FormData } from './types'
import { CmsField, label, required } from './useFormFields'
import { useTranslations } from 'next-intl'

type Errors = Partial<Record<keyof FormData, string>>

type Props = {
  data: FormData
  errors: Errors
  onChange: (field: keyof FormData, value: string) => void
  onConfirmError: (msg: string | undefined) => void
  fieldMap: Record<string, CmsField>
}

export function Step1({ data, errors, onChange, onConfirmError, fieldMap }: Props) {
  const t = useTranslations('Registration')

  // Password field carries confirm-password config in CMS
  const pwField = fieldMap['password']

  return (
    <div className="flex flex-col gap-5">
      <FieldRow>
        <FieldGroup>
          <FieldLabel htmlFor="nome" required={required(fieldMap, 'nome')}>
            {label(fieldMap, 'nome', t('firstName'))}
          </FieldLabel>
          <Input
            id="nome"
            placeholder={t('firstNamePlaceholder')}
            value={data.nome}
            onChange={(e) => onChange('nome', e.target.value)}
            className={errors.nome ? 'border-[#e85d4a]' : ''}
          />
          <FieldError message={errors.nome} />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="surname" required={required(fieldMap, 'surname')}>
            {label(fieldMap, 'surname', t('lastName'))}
          </FieldLabel>
          <Input
            id="surname"
            placeholder={t('lastNamePlaceholder')}
            value={data.surname}
            onChange={(e) => onChange('surname', e.target.value)}
            className={errors.surname ? 'border-[#e85d4a]' : ''}
          />
          <FieldError message={errors.surname} />
        </FieldGroup>
      </FieldRow>

      <FieldGroup>
        <FieldLabel htmlFor="email" required={required(fieldMap, 'email')}>
          {label(fieldMap, 'email', t('emailAddress'))}
        </FieldLabel>
        <Input
          id="email"
          type="email"
          placeholder="ana.silva@email.com"
          value={data.email}
          onChange={(e) => onChange('email', e.target.value)}
          className={errors.email ? 'border-[#e85d4a]' : ''}
        />
        <Hint>{t('emailHint')}</Hint>
        <FieldError message={errors.email} />
      </FieldGroup>

      <FieldRow>
        <FieldGroup>
          <FieldLabel htmlFor="password" required>
            {label(fieldMap, 'password', t('password'))}
          </FieldLabel>
          <Input
            id="password"
            type="password"
            placeholder={t('passwordPlaceholder')}
            value={data.password}
            onChange={(e) => onChange('password', e.target.value)}
            className={errors.password ? 'border-[#e85d4a]' : ''}
          />
          <PasswordStrength password={data.password} />
          <FieldError message={errors.password} />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="confirmPassword" required>
            {pwField?.confirmLabel ?? t('confirmPassword')}
          </FieldLabel>
          <Input
            id="confirmPassword"
            type="password"
            placeholder={t('confirmPasswordPlaceholder')}
            value={data.confirmPassword}
            onChange={(e) => {
              onChange('confirmPassword', e.target.value)
              // inline mismatch feedback while typing
              if (data.password && e.target.value && e.target.value !== data.password) {
                onConfirmError(t('errorPasswordMatch'))
              } else {
                onConfirmError(undefined)
              }
            }}
            className={errors.confirmPassword ? 'border-[#e85d4a]' : ''}
          />
          <FieldError message={errors.confirmPassword} />
        </FieldGroup>
      </FieldRow>

      <FieldGroup>
        <FieldLabel required={required(fieldMap, 'phone')}>
          {label(fieldMap, 'phone', t('phoneNumber'))}
        </FieldLabel>
        <PhoneInput
          defaultCountry="PT"
          value={data.phone}
          onChange={(v) => onChange('phone', v ?? '')}
          placeholder="912 345 678"
          className={errors.phone ? '[&_input]:border-[#e85d4a]' : ''}
        />
        <FieldError message={errors.phone} />
      </FieldGroup>
    </div>
  )
}
