'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PhoneInput } from '@/components/ui/phone-input'
import { FieldError, FieldGroup, FieldLabel, FieldRow } from './StepCard'
import { RegistrationFormData } from './types'
import { CmsField, label, options, required, extraFieldsForStep } from './useFormFields'
import { DynamicField } from './DynamicField'
import { MaskedInput } from './MaskedInput'
import { DatePickerInput } from './DatePickerInput'
import COUNTRY_LIST from '@/utilities/countryList'
import { useTranslations } from 'next-intl'

type Errors = Partial<Record<keyof RegistrationFormData, string>>
type Props = {
  data: RegistrationFormData
  errors: Errors
  onChange: (field: keyof RegistrationFormData, value: string) => void
  fieldMap: Record<string, CmsField>
}

const TSHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']

export function Step2({ data, errors, onChange, fieldMap }: Props) {
  const t = useTranslations('Registration')
  const extra = extraFieldsForStep(fieldMap, '2')

  const genderOptions = [
    { label: t('genderMale'), value: 'male' },
    { label: t('genderFemale'), value: 'female' },
    { label: t('genderOther'), value: 'other' },
    { label: t('genderNotSpecified'), value: 'not_specified' },
  ]

  const tshirtOptions = options(fieldMap, 'tshirtSize').length
    ? options(fieldMap, 'tshirtSize')
    : TSHIRT_SIZES.map((s) => ({ label: s, value: s }))

  const addressField = fieldMap['address']
  const streetLbl = addressField?.address?.streetLabel ?? t('homeAddress')
  const numberLbl = addressField?.address?.numberLabel ?? t('doorApt')
  const stateLbl = addressField?.address?.stateLabel ?? t('city')
  const zipcodeLbl = addressField?.address?.zipcodeLabel ?? t('postalCode')

  return (
    <div className="flex flex-col gap-5">
      <FieldRow>
        <FieldGroup>
          <FieldLabel required={required(fieldMap, 'gender')}>
            {label(fieldMap, 'gender', t('gender'))}
          </FieldLabel>
          <Select value={data.gender} onValueChange={(v) => onChange('gender', v)}>
            <SelectTrigger id="gender" className={errors.gender ? 'border-[#e85d4a]' : ''}>
              <SelectValue placeholder={t('genderPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {genderOptions.map((g) => (
                <SelectItem key={g.value} value={g.value}>
                  {g.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={errors.gender} />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="birthDate" required={required(fieldMap, 'birthDate')}>
            {label(fieldMap, 'birthDate', t('dateOfBirth'))}
          </FieldLabel>
          <DatePickerInput
            id="birthDate"
            value={data.birthDate}
            onChange={(iso) => onChange('birthDate', iso)}
            className={errors.birthDate ? 'border-[#e85d4a]' : ''}
          />
          <FieldError message={errors.birthDate} />
        </FieldGroup>
      </FieldRow>

      <FieldRow>
        <FieldGroup>
          <FieldLabel required={required(fieldMap, 'nationality')}>
            {label(fieldMap, 'nationality', t('nationality'))}
          </FieldLabel>
          <Select value={data.nationality} onValueChange={(v) => onChange('nationality', v)}>
            <SelectTrigger
              id="nationality"
              className={errors.nationality ? 'border-[#e85d4a]' : ''}
            >
              <SelectValue placeholder={t('nationalityPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {COUNTRY_LIST.map((c) => (
                <SelectItem key={c.code} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={errors.nationality} />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel required={required(fieldMap, 'tshirtSize')}>
            {label(fieldMap, 'tshirtSize', t('tshirtSize'))}
          </FieldLabel>
          <Select value={data.tshirtSize} onValueChange={(v) => onChange('tshirtSize', v)}>
            <SelectTrigger id="tshirtSize" className={errors.tshirtSize ? 'border-[#e85d4a]' : ''}>
              <SelectValue placeholder={t('tshirtSizePlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {tshirtOptions.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={errors.tshirtSize} />
        </FieldGroup>
      </FieldRow>

      {/* Street + number: street takes remaining space, number is fixed narrow */}
      <div className="grid grid-cols-[1fr_80px] gap-4 sm:block sm:space-y-0">
        <FieldGroup>
          <FieldLabel
            htmlFor="addressStreet"
            required={addressField?.address?.streetRequired ?? true}
          >
            {streetLbl}
          </FieldLabel>
          <Input
            id="addressStreet"
            placeholder={t('addressStreetPlaceholder')}
            value={data.addressStreet}
            onChange={(e) => onChange('addressStreet', e.target.value)}
            className={errors.addressStreet ? 'border-[#e85d4a]' : ''}
          />
          <FieldError message={errors.addressStreet} />
        </FieldGroup>
        {/* Number inline with street on mobile; hidden on desktop (shown in 3-col below) */}
        <FieldGroup className="sm:hidden">
          <FieldLabel htmlFor="addressNumber-m">{numberLbl}</FieldLabel>
          <Input
            id="addressNumber-m"
            placeholder="Nr"
            value={data.addressNumber}
            onChange={(e) => onChange('addressNumber', e.target.value)}
          />
        </FieldGroup>
      </div>

      {/* Desktop: 3-col (number + city + zipcode) | Mobile: 2-col (city + zipcode, number already above) */}
      <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-2">
        <FieldGroup className="max-sm:hidden">
          <FieldLabel htmlFor="addressNumber">{numberLbl}</FieldLabel>
          <Input
            id="addressNumber"
            placeholder="Nr"
            value={data.addressNumber}
            onChange={(e) => onChange('addressNumber', e.target.value)}
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel
            htmlFor="addressState"
            required={addressField?.address?.stateRequired ?? true}
          >
            {stateLbl}
          </FieldLabel>
          <Input
            id="addressState"
            placeholder={t('cityPlaceholder')}
            value={data.addressState}
            onChange={(e) => onChange('addressState', e.target.value)}
            className={errors.addressState ? 'border-[#e85d4a]' : ''}
          />
          <FieldError message={errors.addressState} />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel
            htmlFor="addressZipcode"
            required={addressField?.address?.zipRequired ?? true}
          >
            {zipcodeLbl}
          </FieldLabel>
          <MaskedInput
            id="addressZipcode"
            mask="9999-999"
            placeholder="1000-001"
            value={data.addressZipcode}
            onValueChange={(v) => onChange('addressZipcode', v)}
            className={errors.addressZipcode ? 'border-[#e85d4a]' : ''}
            inputMode="numeric"
          />
          <FieldError message={errors.addressZipcode} />
        </FieldGroup>
      </div>

      <FieldRow>
        <FieldGroup>
          <FieldLabel htmlFor="emergencyContact" required={required(fieldMap, 'emergencyContact')}>
            {label(fieldMap, 'emergencyContact', t('emergencyContactName'))}
          </FieldLabel>
          <Input
            id="emergencyContact"
            placeholder={t('emergencyContactPlaceholder')}
            value={data.emergencyContact}
            onChange={(e) => onChange('emergencyContact', e.target.value)}
            className={errors.emergencyContact ? 'border-[#e85d4a]' : ''}
          />
          <FieldError message={errors.emergencyContact} />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel required={required(fieldMap, 'emergencyPhone')}>
            {label(fieldMap, 'emergencyPhone', t('emergencyPhone'))}
          </FieldLabel>
          <PhoneInput
            defaultCountry="PT"
            value={data.emergencyPhone}
            onChange={(v) => onChange('emergencyPhone', v ?? '')}
            placeholder="912 345 678"
            id="emergencyPhone"
            className={errors.emergencyPhone ? '[&_input]:border-[#e85d4a]' : ''}
          />
          <FieldError message={errors.emergencyPhone} />
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
