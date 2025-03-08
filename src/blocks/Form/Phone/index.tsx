import { Control, Controller, type FieldErrorsImpl } from 'react-hook-form'

import { Label } from '@/components/ui/label'
import React from 'react'

import { Error } from '../Error'
import { Width } from '../Width'
import { PhoneInput } from '@/components/ui/phone-input'
import { Phone as PhoneBlock } from '@/payload-types'

export const Phone: React.FC<
  PhoneBlock & {
    control: Control
    errors: Partial<FieldErrorsImpl>
    disabled: boolean
  }
> = ({ name, errors, label, required, control, disabled }) => {
  return (
    <Width width={100}>
      <Label htmlFor={name}>
        {label}

        {required && (
          <span className="required">
            * <span className="sr-only">(required)</span>
          </span>
        )}
      </Label>
      <Controller
        control={control}
        name={name}
        rules={{ required: Boolean(required) }}
        render={({ field }) => {
          return (
            <PhoneInput
              disabled={disabled}
              id={name}
              type="phone"
              {...field}
              placeholder="Enter a phone number"
            />
          )
        }}
      />
      {errors[name] && <Error />}
    </Width>
  )
}
