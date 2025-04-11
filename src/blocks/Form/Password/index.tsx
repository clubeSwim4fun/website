import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'

import { Error } from '../Error'
import { Width } from '../Width'
import { Password as PasswordField } from '@/payload-types'
import { useTranslations } from 'next-intl'

// TODO Add password
export const Password: React.FC<
  PasswordField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
    disabled: boolean
  }
> = ({
  name,
  errors,
  label,
  register,
  hasConfirmPassword,
  confirmLabel,
  errorPassword,
  disabled,
}) => {
  const t = useTranslations()

  return (
    <div className="grid grid-cols-6 gap-3">
      <div className={hasConfirmPassword ? 'col-span-6 md:col-span-3' : 'col-span-6'}>
        <Label htmlFor={name}>
          {label}
          <span className="required">
            * <span className="sr-only">({t('Common.required')})</span>
          </span>
        </Label>
        <Input
          id={name}
          type="password"
          disabled={disabled}
          {...register('password', { required: true })}
        />
      </div>
      {hasConfirmPassword && (
        <div className="col-span-6 md:col-span-3">
          <Label htmlFor={`confirmPassword`}>
            {confirmLabel}
            <span className="required">
              * <span className="sr-only">({t('Common.required')})</span>
            </span>
          </Label>
          <Input
            id={`confirmPassword`}
            type="password"
            disabled={disabled}
            {...register(`confirmPassword`, {
              validate: {
                checkPasswordMatch: (confirmPassword, { password }) => {
                  return confirmPassword === password
                    ? true
                    : errorPassword || 'Password does not match'
                },
              },
            })}
          />
          {errors[`confirmPassword`] && (
            <Error error={errors[`confirmPassword`]?.message as string} />
          )}
        </div>
      )}
      {errors[name] && <Error />}
    </div>
  )
}
