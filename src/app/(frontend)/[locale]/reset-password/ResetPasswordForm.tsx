'use client'

import React, { FormEvent, ReactElement, useState } from 'react'

import { Button } from '@/components/ui/button'
import { resetPassword, ResetPasswordResponse } from '@/actions/login'
import { Input } from '@/components/ui/input'
import { LoaderCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { Password } from '@/blocks/Form/Password'
import { useForm } from 'react-hook-form'

export default function ResetPasswordForm(): ReactElement {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(true)
  const t = useTranslations()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  type RequestTokenFormData = { email?: string; password?: string }

  const formMethods = useForm<RequestTokenFormData>()

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = formMethods

  async function handleSubmitFn(data: { email?: string; password?: string }) {
    setIsPending(true)
    setError(null)

    let result: ResetPasswordResponse

    if (data.email) {
      result = await resetPassword({ email: data.email })
    } else {
      result = await resetPassword({ token: token || '', password: data.password || '' })
    }

    setIsPending(false)

    if (!result.success) {
      // Display the error message
      if (result.error?.status === 403) {
        setError(t('Sign-in.resetPasswordTokenInvalid'))
      } else {
        setError(result.message || 'Reset password failed, please try again')
      }
    } else if (result.success && !token) {
      setMessage(t('Sign-in.resetPasswordEmailSent'))
    } else if (result.success && token) {
      setMessage(t('Sign-in.resetPasswordSuccess'))
      setShowForm(false)
    }
  }

  const requestTokenForm = () => {
    return (
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(handleSubmitFn)}>
        <div className="flex flex-col gap-2">
          <Input
            className="w-full focus:outline-none"
            id="email"
            type="email"
            {...register('email', { required: true })}
          />
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <span className="flex items-center gap-2">
              <LoaderCircle className="w-4 h-4 animate-spin" /> {t('Common.submiting')}
            </span>
          ) : (
            t('Common.submit')
          )}
        </Button>
      </form>
    )
  }

  const resetPasswordForm = () => {
    return (
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(handleSubmitFn)}>
        <div className="flex flex-col gap-2">
          <Password
            blockType="password"
            label="password label"
            errors={errors}
            disabled={isPending}
            register={register}
            {...register('password', { required: true })}
            hasConfirmPassword
            confirmLabel={'confirm password label'}
          />
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <span className="flex items-center gap-2">
              <LoaderCircle className="w-4 h-4 animate-spin" /> {t('Common.submiting')}
            </span>
          ) : (
            t('Common.submit')
          )}
        </Button>
      </form>
    )
  }

  return (
    <div className="flex gap-8 min-h-full flex-col justify-center items-center">
      <div className="text-3xl">{t('Sign-in.resetPassword')}</div>
      {showForm && (
        <div className="w-full mx-auto sm:max-w-lg">
          {token ? resetPasswordForm() : requestTokenForm()}
        </div>
      )}
      {message && <div className="text-green-500 mt-4">{message}</div>}
    </div>
  )
}
