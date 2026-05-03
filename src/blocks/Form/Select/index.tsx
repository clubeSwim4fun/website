import type { Control, FieldErrorsImpl } from 'react-hook-form'

import { Label } from '@/components/ui/label'
import {
  Select as SelectComponent,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import React, { useEffect, useState } from 'react'
import { Controller } from 'react-hook-form'

import { Error } from '../Error'
import { Width } from '../Width'
import { GeneralConfig, Select as SelectType } from '@/payload-types'
import { useTranslations } from 'next-intl'
import { useStepPayment } from '@/blocks/SectionWithAside/StepPaymentContext'

type optionsType = {
  label: string
  value: string
  price?: number | null
  id?: string | null
  collectionId?: string | null
}

export const Select: React.FC<
  SelectType & {
    control: Control
    errors: Partial<FieldErrorsImpl>
    generalConfigData: GeneralConfig
  }
> = ({
  name,
  control,
  errors,
  label,
  options,
  required,
  type,
  generalConfigData,
  globalConfigCollection,
  isPaymentSelector,
}) => {
  const t = useTranslations()
  const [dynamicOptions, setDynamicOptions] = useState<optionsType[]>([])
  const paymentCtx = useStepPayment()

  useEffect(() => {
    if (type === 'default') {
      setDynamicOptions(options || [])
    } else if (!!globalConfigCollection) {
      setDynamicOptions(
        (
          generalConfigData?.userData as Partial<
            Record<'genders' | 'disabilities' | 'aboutClub', optionsType[]>
          >
        )?.[globalConfigCollection as 'genders' | 'disabilities' | 'aboutClub'] ?? [],
      )
    }
  }, [])

  const handleValueChange = (val: string, onChange: (v: string) => void) => {
    onChange(val)
    if (isPaymentSelector && paymentCtx) {
      const opt = dynamicOptions.find((o) => o.value === val)
      if (opt) {
        const amount = opt.price ?? parseFloat(opt.value)
        if (!isNaN(amount)) {
          paymentCtx.setSelectedPaymentOption({ amount, label: opt.label })
        }
      }
    }
  }

  return (
    <Width width={100} className="flex flex-col gap-2">
      <Label htmlFor={name}>
        {label}
        {required && (
          <span className="required">
            * <span className="sr-only">({t('Common.required')})</span>
          </span>
        )}
      </Label>
      <Controller
        control={control}
        defaultValue=""
        name={name}
        render={({ field: { onChange, value } }) => {
          const controlledValue = dynamicOptions.find(
            (t) => (type === 'default' ? t.value : t.collectionId) === value,
          )

          return (
            <SelectComponent
              onValueChange={(val) => handleValueChange(val, onChange)}
              value={
                (type === 'default' ? controlledValue?.value : controlledValue?.collectionId) ||
                value
              }
            >
              <SelectTrigger className="w-full border-border" id={name}>
                <SelectValue placeholder={label} />
              </SelectTrigger>
              <SelectContent>
                {dynamicOptions.map(({ label, value, collectionId }, idx) => {
                  return (
                    <SelectItem
                      key={idx}
                      value={(type === 'default' ? value : collectionId) || value}
                    >
                      {label}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </SelectComponent>
          )
        }}
        rules={{ required: !!required }}
      />
      {errors[name] && <Error />}
    </Width>
  )
}
