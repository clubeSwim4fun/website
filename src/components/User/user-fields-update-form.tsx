'use client'

import { Gender, GeneralConfig, User } from '@/payload-types'
import { Control, Controller, SubmitHandler, useForm } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Error } from '@/blocks/Form/Error'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { updateUserData } from '@/helpers/userHelper'
import { Loader } from 'lucide-react'
import { useState } from 'react'
import { FileUploader } from '../FileUploader'
import { Country } from '@/blocks/Form/Country'
import { Select } from '@/blocks/Form/Select'

export type UserFormData = {
  nif?: string | null
  identityCardNumber?: string | null
  identityCardFile?: File[] | null
  profilePicture?: File[] | null
  nationality?: string | null
  disability?: string | null
  phoneNumber?: string | null
  gender?: string | Gender | null
  address: {
    street?: string | null
    number?: string | null
    state?: string | null
    zipcode?: string | null
  }
}

export const UserFieldsUpdateForm: React.FC<{
  user: User
  fieldsToUpdate: string[]
  generalConfig: GeneralConfig
}> = (props) => {
  const { user, fieldsToUpdate, generalConfig } = props
  const t = useTranslations()
  const [open, setOpen] = useState<boolean>(false)

  const {
    handleSubmit,
    register,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    defaultValues: {
      nif: user.nif ?? '',
      identityCardNumber: user.identity ?? '',
      nationality: user.nationality ?? '',
      phoneNumber: user.phone ?? '',
      gender: user.gender ?? '',
      address: {
        street: user.Address?.street ?? '',
        number: user.Address?.number ?? '',
        state: user.Address?.state ?? '',
        zipcode: user.Address?.zipcode ?? '',
      },
    },
  })

  const onSubmit: SubmitHandler<UserFormData> = async (data) => {
    console.log('Submitting user data update:', data)
    await updateUserData({ data, user: user, isRegistrationFix: true })
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="default" className="" onClick={() => setOpen(true)}>
          {t('Common.update')}
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetTitle>{t('User.Details.editProfile')}</SheetTitle>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4 border-t border-t-gray-300 pt-4 flex flex-col gap-4"
        >
          <span className="font-bold text-sm text-gray-800">{t('User.Details.myData')}</span>
          {fieldsToUpdate.includes('profilePicture') && (
            <Controller
              control={control}
              name={'profilePicture'}
              rules={{ required: true }}
              render={({ field }) => {
                return (
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor={`identityCardNumber`}
                      className="capitalize text-sm font-semibold"
                    >
                      {t('User.Details.profilePicture')}
                    </Label>
                    <FileUploader
                      onValueChange={field.onChange}
                      accept={{ 'image/*': [], 'application/pdf': [] }}
                      maxFileCount={2}
                      maxSize={2 * 1024 * 1024}
                    />
                    {errors[`profilePicture`] && <Error />}
                  </div>
                )
              }}
            />
          )}
          {fieldsToUpdate.includes('nif') && (
            <Controller
              name="nif"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`nif`} className="capitalize text-sm font-semibold">
                    {t('User.Details.nif')}
                  </Label>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    type="text"
                    {...register(`nif`, { required: true })}
                  />
                  {errors[`nif`] && <Error />}
                </div>
              )}
            />
          )}
          {fieldsToUpdate.includes('nationality') && (
            <Country
              blockType="country"
              control={control as unknown as Control}
              disabled={false}
              errors={errors}
              name="nationality"
              label={t('User.Details.nationality')}
              required
              defaultValue={user.nationality as string}
            />
          )}
          {fieldsToUpdate.includes('disability') && (
            <Controller
              name="disability"
              control={control}
              render={() => (
                <div className="flex flex-col gap-2">
                  <Select
                    blockType="select"
                    name="disability"
                    control={control as unknown as Control}
                    errors={errors}
                    label={t('User.Details.disability')}
                    globalConfigCollection="disabilities"
                    generalConfigData={generalConfig}
                    required
                  />
                </div>
              )}
            />
          )}
          {fieldsToUpdate.includes('identityCardNumber') && (
            <Controller
              name="identityCardNumber"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor={`identityCardNumber`}
                    className="capitalize text-sm font-semibold"
                  >
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
          )}
          {fieldsToUpdate.includes('identityCardFile') && (
            <Controller
              control={control}
              name={'identityCardFile'}
              rules={{ required: true }}
              render={({ field }) => {
                return (
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor={`identityCardNumber`}
                      className="capitalize text-sm font-semibold"
                    >
                      {t('User.Details.identity')}
                    </Label>
                    <FileUploader
                      onValueChange={field.onChange}
                      accept={{ 'image/*': [], 'application/pdf': [] }}
                      maxFileCount={2}
                      maxSize={2 * 1024 * 1024}
                    />
                    {errors[`identityCardFile`] && <Error />}
                  </div>
                )
              }}
            />
          )}
          {fieldsToUpdate.includes('phoneNumber') && (
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
          )}
          {fieldsToUpdate.includes('address') && (
            <>
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
            </>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {!isSubmitting ? t('Common.save') : <Loader className="w-4 h-4 animate-spin" />}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
