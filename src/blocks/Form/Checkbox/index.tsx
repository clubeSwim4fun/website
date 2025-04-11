import type { CheckboxField } from '@payloadcms/plugin-form-builder/types'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { useFormContext } from 'react-hook-form'

import { Checkbox as CheckboxUi } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import React from 'react'

import { Error } from '../Error'
import { Width } from '../Width'
import { useTranslations } from 'next-intl'

export const Checkbox: React.FC<
  CheckboxField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
    disabled: boolean
  }
> = ({ name, defaultValue, errors, label, register, required, width, disabled }) => {
  const props = register(name, { required: required })
  const { setValue } = useFormContext()
  const t = useTranslations()

  return (
    <Width width={width}>
      <div className="flex items-center gap-2">
        <CheckboxUi
          defaultChecked={defaultValue}
          disabled={disabled}
          id={name}
          {...props}
          onCheckedChange={(checked) => {
            setValue(props.name, checked)
          }}
        />
        <Label htmlFor={name}>
          {required && (
            <span className="required">
              * <span className="sr-only">({t('Common.required')})</span>
            </span>
          )}
          {label}
        </Label>
      </div>
      {errors[name] && <Error />}
    </Width>
  )
}
