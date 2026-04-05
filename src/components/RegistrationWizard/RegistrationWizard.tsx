'use client'

import { useState, useRef, useEffect } from 'react'
import { User, Lock, FileText, Star, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProgressBanner } from './ProgressBanner'
import { StepCard } from './StepCard'
import { Step1 } from './Step1'
import { Step2 } from './Step2'
import { Step3 } from './Step3'
import { Step4 } from './Step4'
import { RegistrationFormData, StepConfig, StepId } from './types'
import { createUser } from '@/actions/createUser'
import { GeneralConfig } from '@/payload-types'
import { calcStrength } from './PasswordStrength'
import { buildFieldMap } from './useFormFields'
import { useTranslations } from 'next-intl'
import type { Form } from '@payloadcms/plugin-form-builder/types'

const STEP_ICONS: Record<StepId, React.ReactNode> = {
  1: <User className="w-5 h-5" />,
  2: <Star className="w-5 h-5" />,
  3: <FileText className="w-5 h-5" />,
  4: <Lock className="w-5 h-5" />,
}

const EMPTY: RegistrationFormData = {
  nome: '',
  surname: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  gender: '',
  birthDate: '',
  nationality: '',
  tshirtSize: '',
  addressStreet: '',
  addressNumber: '',
  addressState: '',
  addressZipcode: '',
  emergencyContact: '',
  emergencyPhone: '',
  identity: '',
  nif: '',
  identityFile: [],
  profilePicture: [],
  disability: '',
  sportInsurance: '',
  emailNotifications: true,
  whatsappNotifications: false,
  heardAboutClub: '',
  wantsInvoiceWithNif: false,
  consent: false,
}

type Props = {
  generalConfig: GeneralConfig
  form?: Form
  submitButtonLabel?: string | null
}

export function RegistrationWizard({ generalConfig, form, submitButtonLabel }: Props) {
  const t = useTranslations('Registration')
  const fieldMap = buildFieldMap(form)

  const STEPS: StepConfig[] = [
    { id: 1, title: t('step1Title'), subtitle: t('step1Subtitle') },
    { id: 2, title: t('step2Title'), subtitle: t('step2Subtitle') },
    { id: 3, title: t('step3Title'), subtitle: t('step3Subtitle') },
    { id: 4, title: t('step4Title'), subtitle: t('step4Subtitle') },
  ]

  const [step, setStep] = useState<StepId>(1)
  const [data, setData] = useState<RegistrationFormData>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationFormData, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [debugResponse, setDebugResponse] = useState<unknown>(null)
  const [debugPayload, setDebugPayload] = useState<unknown>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // Scroll to card when step changes, but only from step 2 onwards
  useEffect(() => {
    if (step > 1 && cardRef.current) {
      const top = cardRef.current.getBoundingClientRect().top + window.scrollY - 100
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }, [step])

  const set = (field: keyof RegistrationFormData, value: string | boolean | File[]) =>
    setData((prev) => ({ ...prev, [field]: value }))

  const validate = (): boolean => {
    const e: Partial<Record<keyof RegistrationFormData, string>> = {}
    const req = (name: string, fallback = true) =>
      fieldMap[name] !== undefined ? fieldMap[name]!.required : fallback

    if (step === 1) {
      if (req('nome') && !data.nome.trim()) e.nome = t('errorFirstName')
      if (req('surname') && !data.surname.trim()) e.surname = t('errorLastName')
      if (!data.email.trim() || !/^\S[^\s@]*@\S+$/.test(data.email)) e.email = t('errorEmail')
      if (!data.password || calcStrength(data.password) < 2) e.password = t('errorPassword')
      if (data.password !== data.confirmPassword) e.confirmPassword = t('errorPasswordMatch')
      if (req('phone') && !data.phone) e.phone = t('errorPhone')
    }
    if (step === 2) {
      if (req('gender') && !data.gender) e.gender = t('errorGender')
      if (req('birthDate') && !data.birthDate) e.birthDate = t('errorBirthDate')
      if (req('nationality') && !data.nationality) e.nationality = t('errorNationality')
      if (req('tshirtSize') && !data.tshirtSize) e.tshirtSize = t('errorTshirtSize')
      if (req('address', true) && !data.addressStreet.trim()) e.addressStreet = t('errorAddress')
      if (!data.addressState.trim()) e.addressState = t('errorCity')
      if (!data.addressZipcode.trim()) e.addressZipcode = t('errorPostalCode')
      if (req('emergencyContact') && !data.emergencyContact.trim())
        e.emergencyContact = t('errorEmergencyContact')
      if (req('emergencyPhone') && !data.emergencyPhone) e.emergencyPhone = t('errorEmergencyPhone')
    }
    if (step === 3) {
      if (req('identity') && !data.identity.trim()) e.identity = t('errorIdentity')
      if (req('nif') && !data.nif.trim()) e.nif = t('errorNif')
      if (req('identityFile', false) && !data.identityFile?.length)
        e.identityFile = t('errorIdentityFile')
      if (req('profilePicture', false) && !data.profilePicture?.length)
        e.profilePicture = t('errorProfilePicture')
    }
    if (step === 4) {
      if (!data.consent) e.consent = t('errorConsent')
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleContinue = async () => {
    if (!validate()) return
    if (step < 4) {
      setStep((s) => (s + 1) as StepId)
      return
    }

    setSubmitting(true)
    setServerError(null)
    setDebugResponse(null)
    setDebugPayload(null)
    try {
      // Build FormData so File objects are properly serialized to the server action
      const formData = new FormData()

      const meta: Record<string, { value: string; relatesTo: string }> = {
        nome: { value: data.nome, relatesTo: 'name' },
        surname: { value: data.surname, relatesTo: 'surname' },
        email: { value: data.email, relatesTo: 'email' },
        password: { value: data.password, relatesTo: 'password' },
        phone: { value: data.phone, relatesTo: 'phone' },
        gender: { value: data.gender, relatesTo: 'gender' },
        birthDate: { value: data.birthDate, relatesTo: 'birthDate' },
        nationality: { value: data.nationality, relatesTo: 'nationality' },
        tshirtSize: { value: data.tshirtSize, relatesTo: 'tshirtSize' },
        addressStreet: { value: data.addressStreet, relatesTo: 'Address.street' },
        addressNumber: { value: data.addressNumber, relatesTo: 'Address.number' },
        addressState: { value: data.addressState, relatesTo: 'Address.state' },
        addressZipcode: { value: data.addressZipcode, relatesTo: 'Address.zipcode' },
        emergencyContact: { value: data.emergencyContact, relatesTo: 'emergencyContact' },
        emergencyPhone: { value: data.emergencyPhone, relatesTo: 'emergencyPhone' },
        identity: { value: data.identity, relatesTo: 'identity' },
        nif: { value: data.nif, relatesTo: 'nif' },
        disability: { value: data.disability, relatesTo: 'disability' },
        sportInsurance: { value: data.sportInsurance, relatesTo: 'sportInsurance' },
        wantsInvoiceWithNif: {
          value: String(data.wantsInvoiceWithNif),
          relatesTo: 'wantsInvoiceWithNif',
        },
        heardAboutClub: { value: data.heardAboutClub, relatesTo: 'heardAboutClub' },
      }

      formData.append('__meta', JSON.stringify(meta))

      // Append files directly — key is the relatesTo value so the server can map them
      for (const file of data.identityFile ?? []) {
        formData.append('identityFile', file)
      }
      for (const file of data.profilePicture ?? []) {
        formData.append('profilePicture', file)
      }

      setDebugPayload(meta)
      const result = await createUser(formData)
      setDebugResponse(result)
      if (!result.success) {
        setServerError(result.error ?? t('errorServer'))
      } else {
        setDone(true)
      }
    } catch (err) {
      console.error('[RegistrationWizard] submit error:', err)
      setServerError(t('errorServer'))
    } finally {
      setSubmitting(false)
    }
  }

  const currentStepConfig = STEPS.find((s) => s.id === step)!

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto px-4 md:px-0">
      <ProgressBanner currentStep={step} steps={STEPS} done={done} />

      {done ? (
        <div className="bg-white rounded-xl border border-border shadow-sm p-10 flex flex-col items-center gap-5 text-center">
          <div className="w-16 h-16 rounded-full border-4 border-[#2ecc71] flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-[#2ecc71]" />
          </div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-syne, sans-serif)' }}>
            {t('successTitle')}
          </h2>
          <p className="text-muted-foreground max-w-sm">{t('successDescription')}</p>
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #1a3a5c, #2a7fa8)' }}
          >
            {t('membershipConfirmed')}
          </span>
        </div>
      ) : (
        <>
          <StepCard
            ref={cardRef}
            icon={STEP_ICONS[step]}
            title={currentStepConfig.title}
            subtitle={currentStepConfig.subtitle}
          >
            <div>
              {step === 1 && (
                <Step1
                  data={data}
                  errors={errors}
                  onChange={set}
                  onConfirmError={(msg) => setErrors((e) => ({ ...e, confirmPassword: msg }))}
                  fieldMap={fieldMap}
                />
              )}
              {step === 2 && (
                <Step2
                  data={data}
                  errors={errors}
                  onChange={set}
                  generalConfig={generalConfig}
                  fieldMap={fieldMap}
                />
              )}
              {step === 3 && (
                <Step3
                  data={data}
                  errors={errors}
                  onChange={set}
                  onFileChange={(field, files) => set(field, files as unknown as string)}
                  generalConfig={generalConfig}
                  fieldMap={fieldMap}
                />
              )}
              {step === 4 && (
                <Step4
                  data={data}
                  errors={errors}
                  onChange={set}
                  fieldMap={fieldMap}
                  generalConfig={generalConfig}
                />
              )}
            </div>
          </StepCard>

          {serverError && <p className="text-sm text-[#e85d4a] text-center">{serverError}</p>}

          {debugPayload !== null && (
            <pre className="text-xs bg-muted border border-border rounded-lg p-3 overflow-auto max-h-60 whitespace-pre-wrap break-all">
              {JSON.stringify(debugPayload, null, 2)}
            </pre>
          )}
          {debugResponse !== null && (
            <pre className="text-xs bg-muted border border-border rounded-lg p-3 overflow-auto max-h-60 whitespace-pre-wrap break-all">
              {JSON.stringify(debugResponse, null, 2)}
            </pre>
          )}

          <div className="flex items-center justify-between">
            {step > 1 ? (
              <Button
                variant="outline"
                onClick={() => {
                  setErrors({})
                  setStep((s) => (s - 1) as StepId)
                }}
                disabled={submitting}
              >
                {t('back')}
              </Button>
            ) : (
              <span />
            )}
            <div className="flex flex-col items-end gap-1">
              <Button onClick={handleContinue} disabled={submitting} className="min-w-[160px]">
                {submitting
                  ? t('submitting')
                  : step === 4
                    ? (submitButtonLabel ?? t('completeRegistration'))
                    : t('continue')}
              </Button>
              <p className="text-xs text-muted-foreground">
                {step < 4 ? t('stepCounter', { step, remaining: 4 - step }) : t('stepReview')}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
