import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'

import { Error } from '../Error'
import { Width } from '../Width'
import { Password as PasswordField } from '@/payload-types'

// TODO Add password
export const Password: React.FC<
  PasswordField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
  }
> = ({ name, errors, label, register, hasConfirmPassword, confirmLabel, errorPassword }) => {
  return (
    <Width width={'100%'}>
      <Label htmlFor={name}>
        {label}
        <span className="required">
          * <span className="sr-only">(required)</span>
        </span>
      </Label>
      <Input id={name} type="password" {...register('password', { required: true })} />
      {errors[name] && <Error />}
      {hasConfirmPassword && (
        <div className="mt-6">
          <Label htmlFor={`confirmPassword`}>
            {confirmLabel}
            <span className="required">
              * <span className="sr-only">(required)</span>
            </span>
          </Label>
          <Input
            id={`confirmPassword`}
            type="password"
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
    </Width>
  )
}
