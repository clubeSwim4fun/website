import type { EmailField } from '@payloadcms/plugin-form-builder/types'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'

import { Error } from '../Error'
import { Width } from '../Width'
import { useTranslations } from 'next-intl'

export const Email: React.FC<
  EmailField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
    disabled: boolean
  }
> = ({ name, defaultValue, errors, label, register, required, width, disabled }) => {
  const t = useTranslations()

  return (
    <Width width={width}>
      <Label htmlFor={name}>
        {label}

        {required && (
          <span className="required">
            * <span className="sr-only">({t('Common.required')})</span>
          </span>
        )}
      </Label>
      <Input
        defaultValue={defaultValue}
        id={name}
        type="text"
        disabled={disabled}
        {...register(name, { pattern: /^\S[^\s@]*@\S+$/, required })}
      />

      {errors[name] && <Error />}
    </Width>
  )
}
