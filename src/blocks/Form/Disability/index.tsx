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
import { DisabilityField, GeneralConfig } from '@/payload-types'
import { useTranslations } from 'next-intl'

type disabilityType = {
  label: string
  value: string
  id?: string | null
  disabilityId?: string | null
}

export const DisabilitySelect: React.FC<
  DisabilityField & {
    control: Control
    errors: Partial<FieldErrorsImpl>
    generalConfigData: GeneralConfig
  }
> = ({ name, control, errors, label, required, generalConfigData }) => {
  const t = useTranslations()
  const [disabilities, setDisabilities] = useState<disabilityType[]>([])

  useEffect(() => {
    console.log('generalConfigData', generalConfigData)
    if (
      generalConfigData &&
      generalConfigData.userData &&
      generalConfigData.userData.disabilities
    ) {
      setDisabilities(generalConfigData.userData.disabilities)
    }
  }, [])

  return (
    <Width width={100}>
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
          const controlledValue = disabilities.find((t) => t.disabilityId === value)

          return (
            <SelectComponent
              onValueChange={(val) => onChange(val)}
              value={controlledValue?.disabilityId || controlledValue?.value}
            >
              <SelectTrigger className="w-full border-border" id={name}>
                <SelectValue placeholder={label} />
              </SelectTrigger>
              <SelectContent>
                {/* TODO - Verificar aqui porque disabilityId está vindo vazio e testar se isso nao vai quebrar o criar user  */}
                {disabilities.map(({ label, disabilityId }) => {
                  return (
                    <SelectItem key={disabilityId} value={disabilityId || value}>
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
