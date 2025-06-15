'use client'

import { Gender, User } from '@/payload-types'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Error } from '@/blocks/Form/Error'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { updateUserData } from '@/helpers/userHelper'
import { Loader, Pencil } from 'lucide-react'
import { useState } from 'react'

export type UserFormData = {
  nif?: string | null
  identityCardNumber?: string | null
  nationality?: string | null
  birthDate?: Date
  phoneNumber?: string | null
  gender?: string | Gender | null
  address: {
    street?: string | null
    number?: string | null
    state?: string | null
    zipcode?: string | null
  }
}

export const UserUpdateForm: React.FC<{ user: User }> = (props) => {
  const { user } = props
  const t = useTranslations()
  const [open, setOpen] = useState<boolean>(false)

  const {
    handleSubmit,
    register,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    defaultValues: {
      identityCardNumber: user.identity,
      phoneNumber: user.phone,
      address: {
        street: user.Address?.street,
        number: user.Address?.number,
        state: user.Address?.state,
        zipcode: user.Address?.zipcode,
      },
    },
  })

  const onSubmit: SubmitHandler<UserFormData> = async (data) => {
    await updateUserData({ data, user: user })
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <Pencil className="w-4 h-4" />
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetTitle>{t('User.Details.editProfile')}</SheetTitle>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4 border-t border-t-gray-300 pt-4 flex flex-col gap-4"
        >
          <span className="font-bold text-sm text-gray-800">{t('User.Details.myData')}</span>
          <Controller
            name="identityCardNumber"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                <Label htmlFor={`identityCardNumber`} className="capitalize text-sm font-semibold">
                  {t('User.Details.identity')}
                </Label>
                <Input
                  {...field}
                  value={field.value ?? ''}
                  type="text"
                  {...register(`identityCardNumber`, { required: true })}
                />
                {errors[`identityCardNumber`] && <Error />}
              </div>
            )}
          />
          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                <Label htmlFor={`phoneNumber`} className="capitalize text-sm font-semibold">
                  {t('User.Details.phone')}
                </Label>
                <Input
                  {...field}
                  value={field.value ?? ''}
                  type="text"
                  {...register(`phoneNumber`, { required: true })}
                />
                {errors[`phoneNumber`] && <Error />}
              </div>
            )}
          />
          <span className="font-bold text-sm text-gray-800">{t('User.Details.myAddress')}</span>
          <Controller
            name="address.street"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                <Label htmlFor={`address.street`} className="capitalize text-sm font-semibold">
                  {t('User.Details.street')}
                </Label>
                <Input
                  {...field}
                  value={field.value ?? ''}
                  type="text"
                  {...register(`address.street`, { required: true })}
                />
                {errors[`address`]?.['street'] && <Error />}
              </div>
            )}
          />
          <Controller
            name="address.number"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                <Label htmlFor={`address.number`} className="capitalize text-sm font-semibold">
                  {t('User.Details.number')}
                </Label>
                <Input
                  {...field}
                  value={field.value ?? ''}
                  type="text"
                  {...register(`address.number`, { required: true })}
                />
                {errors[`address`]?.['number'] && <Error />}
              </div>
            )}
          />
          <Controller
            name="address.state"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                <Label htmlFor={`address.state`} className="capitalize text-sm font-semibold">
                  {t('User.Details.state')}
                </Label>
                <Input
                  {...field}
                  value={field.value ?? ''}
                  type="text"
                  {...register(`address.state`, { required: true })}
                />
                {errors[`address`]?.['state'] && <Error />}
              </div>
            )}
          />
          <Controller
            name="address.zipcode"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                <Label htmlFor={`address.zipcode`} className="capitalize text-sm font-semibold">
                  {t('User.Details.zipcode')}
                </Label>
                <Input
                  {...field}
                  value={field.value ?? ''}
                  type="text"
                  {...register(`address.zipcode`, { required: true })}
                />
                {errors[`address`]?.['zipcode'] && <Error />}
              </div>
            )}
          />
          <Button type="submit" disabled={isSubmitting}>
            {!isSubmitting ? t('Common.save') : <Loader className="w-4 h-4 animate-spin" />}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
