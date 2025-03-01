import type { Control, FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { Label } from '@/components/ui/label'

import React from 'react'
import { Controller } from 'react-hook-form'

import { Error } from '../Error'
import { Input } from '@/components/ui/input'
import { Address as AddressBlock } from '@/payload-types'

export const Address: React.FC<
  AddressBlock & {
    control: Control
    errors: Partial<FieldErrorsImpl> & {
      [key: string]: any
    }
    register: UseFormRegister<FieldValues>
  }
> = ({ name, control, errors, label, register, address }) => {
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
      <div>
        <Controller
          control={control}
          name={`${name}.street`}
          render={() => (
            <div>
              <Label htmlFor={`${name}.street`}>
                {streetLabel}
                {streetRequired && (
                  <span className="required">
                    * <span className="sr-only">(required)</span>
                  </span>
                )}
              </Label>
              <Input
                id={`${name}.street`}
                type="text"
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
            <div>
              <Label htmlFor={`${name}.number`}>
                {numberLabel}
                {numberRequired && (
                  <span className="required">
                    * <span className="sr-only">(required)</span>
                  </span>
                )}
              </Label>
              <Input
                id={`${name}.number`}
                type="text"
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
            <div>
              <Label htmlFor={`${name}.state`}>
                {stateLabel}
                {stateRequired && (
                  <span className="required">
                    * <span className="sr-only">(required)</span>
                  </span>
                )}
              </Label>
              <Input
                id={`${name}.state`}
                type="text"
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
            <div>
              <Label htmlFor={`${name}.zipcode`}>
                {zipcodeLabel}
                {zipRequired && (
                  <span className="required">
                    * <span className="sr-only">(required)</span>
                  </span>
                )}
              </Label>
              <Input
                id={`${name}.zipcode`}
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
