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
import { GenderField, GeneralConfig } from '@/payload-types'
import { useTranslations } from 'next-intl'

type genderType = {
  label: string
  value: string
  id?: string | null
  genderId?: string | null
}

export const GenderSelect: React.FC<
  GenderField & {
    control: Control
    errors: Partial<FieldErrorsImpl>
    generalConfigData: GeneralConfig
  }
> = ({ name, control, errors, label, required, generalConfigData }) => {
  const t = useTranslations()
  const [genders, setGenders] = useState<genderType[]>([])

  useEffect(() => {
    if (generalConfigData && generalConfigData.userData && generalConfigData.userData.genders) {
      setGenders(generalConfigData.userData.genders)
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
          const controlledValue = genders.find((t) => t.genderId === value)

          return (
            <SelectComponent
              onValueChange={(val) => onChange(val)}
              value={controlledValue?.genderId || controlledValue?.value}
            >
              <SelectTrigger className="w-full border-border" id={name}>
                <SelectValue placeholder={label} />
              </SelectTrigger>
              <SelectContent>
                {/* TODO - Verificar aqui porque genderId está vindo vazio e testar se isso nao vai quebrar o criar user  */}
                {genders.map(({ label, genderId }) => {
                  return (
                    <SelectItem key={genderId} value={genderId || value}>
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
