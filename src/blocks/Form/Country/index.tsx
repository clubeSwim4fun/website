import type { CountryField } from '@payloadcms/plugin-form-builder/types'
import type { Control, FieldErrorsImpl } from 'react-hook-form'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import React from 'react'
import { Controller } from 'react-hook-form'

import { Error } from '../Error'
import { Width } from '../Width'
import COUNTRY_LIST from '@/utilities/countryList'

export const Country: React.FC<
  CountryField & {
    control: Control
    errors: Partial<FieldErrorsImpl>
    disabled: boolean
  }
> = ({ name, control, errors, label, required, width, disabled }) => {
  return (
    <Width width={width}>
      <Label className="" htmlFor={name}>
        {label}

        {required && (
          <span className="required">
            * <span className="sr-only">(required)</span>
          </span>
        )}
      </Label>
      <Controller
        control={control}
        defaultValue=""
        name={name}
        render={({ field: { onChange, value } }) => {
          const controlledValue = COUNTRY_LIST.find((t) => t.name === value)

          return (
            <Select onValueChange={(val) => onChange(val)} value={controlledValue?.name}>
              <SelectTrigger className="w-full" id={name} disabled={disabled}>
                <SelectValue placeholder={label} />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_LIST.map(({ name }) => {
                  return (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          )
        }}
        rules={{ required }}
      />
      {errors[name] && <Error />}
    </Width>
  )
}
