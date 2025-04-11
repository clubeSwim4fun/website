import type { Control, FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { Label } from '@/components/ui/label'

import React from 'react'
import { Controller } from 'react-hook-form'

import { Error } from '../Error'
import { Input } from '@/components/ui/input'
import { Address as AddressBlock } from '@/payload-types'
import { useTranslations } from 'next-intl'

/* eslint-disable */
export const Address: React.FC<
  AddressBlock & {
    control: Control
    errors: Partial<FieldErrorsImpl> & {
      [key: string]: any
    }
    register: UseFormRegister<FieldValues>
    disabled: boolean
  }
> = ({ name, control, label, errors, register, address, disabled }) => {
  const t = useTranslations()

  if (!address) {
    return
  }
  const {
    streetLabel,
    stateLabel,
    numberLabel,
    numberRequired,
    stateRequired,
    streetRequired,
    zipRequired,
    zipcodeLabel,
    streetSize,
    numberSize,
    stateSize,
    zipSize,
  } = address
  const AddressField = ({
    control,
    name,
    register,
  }: {
    control: Control
    name: string
    register: UseFormRegister<FieldValues>
  }) => {
    return (
      <div className="grid grid-cols-6 gap-3">
        <Controller
          control={control}
          name={`${name}.street`}
          render={() => (
            <div
              className={
                streetSize === 'one-third'
                  ? 'col-span-6 md:col-span-2'
                  : streetSize === 'half'
                    ? 'col-span-6 md:col-span-3'
                    : 'col-span-6'
              }
            >
              <Label htmlFor={`${name}.street`}>
                {streetLabel}
                {streetRequired && (
                  <span className="required">
                    * <span className="sr-only">({t('Common.required')})</span>
                  </span>
                )}
              </Label>
              <Input
                id={`${name}.street`}
                type="text"
                disabled={disabled}
                defaultValue={''}
                {...register(`${name}.street`, { required: !!streetRequired })}
              />
              {errors[`endereco`]?.[`street`] && <Error />}
            </div>
          )}
        />
        <Controller
          control={control}
          name={`${name}.number`}
          render={() => (
            <div
              className={
                numberSize === 'one-third'
                  ? 'col-span-6 md:col-span-2'
                  : numberSize === 'half'
                    ? 'col-span-6 md:col-span-3'
                    : 'col-span-6'
              }
            >
              <Label htmlFor={`${name}.number`}>
                {numberLabel}
                {numberRequired && (
                  <span className="required">
                    * <span className="sr-only">({t('Common.required')})</span>
                  </span>
                )}
              </Label>
              <Input
                id={`${name}.number`}
                type="text"
                disabled={disabled}
                defaultValue={''}
                {...register(`${name}.number`, { required: !!numberRequired })}
              />
              {errors[`endereco`]?.[`number`] && <Error />}
            </div>
          )}
        />
        <Controller
          control={control}
          name={`${name}.state`}
          render={() => (
            <div
              className={
                stateSize === 'one-third'
                  ? 'col-span-6 md:col-span-2'
                  : stateSize === 'half'
                    ? 'col-span-6 md:col-span-3'
                    : 'col-span-6'
              }
            >
              <Label htmlFor={`${name}.state`}>
                {stateLabel}
                {stateRequired && (
                  <span className="required">
                    * <span className="sr-only">({t('Common.required')})</span>
                  </span>
                )}
              </Label>
              <Input
                id={`${name}.state`}
                type="text"
                disabled={disabled}
                defaultValue={''}
                {...register(`${name}.state`, { required: !!stateRequired })}
              />
              {errors[`endereco`]?.[`state`] && <Error />}
            </div>
          )}
        />
        <Controller
          control={control}
          name={`${name}.zipcode`}
          render={() => (
            <div
              className={
                zipSize === 'one-third'
                  ? 'col-span-6 md:col-span-2'
                  : zipSize === 'half'
                    ? 'col-span-6 md:col-span-3'
                    : 'col-span-6'
              }
            >
              <Label htmlFor={`${name}.zipcode`}>
                {zipcodeLabel}
                {zipRequired && (
                  <span className="required">
                    * <span className="sr-only">({t('Common.required')})</span>
                  </span>
                )}
              </Label>
              <Input
                id={`${name}.zipcode`}
                disabled={disabled}
                type="text"
                defaultValue={''}
                {...register(`${name}.zipcode`, { required: !!zipRequired })}
              />
              {errors[`endereco`]?.[`zipcode`] && <Error />}
            </div>
          )}
        />
      </div>
    )
  }

  return (
    <div>
      <Label className="" htmlFor={name}>
        {label}
      </Label>
      <AddressField control={control} name={name} register={register} />
    </div>
  )
}
