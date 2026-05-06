'use client'

import React, { useState } from 'react'
import { LoaderCircle, ArrowRight, ArrowLeft, CheckCircle, Info, Lock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { Link } from '@/i18n/routing'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/RegistrationWizard/PasswordInput'
import { resetPassword, ResetPasswordResponse, setNewPassword } from '@/actions/login'
import { cn } from '@/utilities/ui'
import { Media } from '@/payload-types'
import { Logo } from '@/components/Logo/Logo'

type FormData = { email?: string; password?: string; confirmPassword?: string }

export default function ResetPasswordForm({ logo }: { logo?: Media | null }) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const t = useTranslations('Sign-in')
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const mustReset = searchParams.get('mustReset') === 'true'

  const isNewPassword = !!(token || mustReset)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>()

  async function onSubmit(data: FormData) {
    setIsPending(true)
    setError(null)

    let result: ResetPasswordResponse

    if (mustReset && data.password) {
      const r = await setNewPassword({ password: data.password })
      result = { success: r.success, message: r.message }
      if (r.success) {
        router.push('/')
        return
      }
    } else if (token && data.password) {
      result = await resetPassword({ token, password: data.password })
    } else {
      result = await resetPassword({ email: data.email })
    }

    setIsPending(false)

    if (!result.success) {
      setError(result.error?.status === 403 ? t('resetPasswordTokenInvalid') : result.message)
    } else if (!isNewPassword) {
      setShowSuccess(true)
    } else {
      setShowSuccess(true)
    }
  }

  const inputClass = cn(
    'h-12 rounded-xl border-[hsl(var(--swim-border))] bg-white px-4 text-sm',
    'focus-visible:ring-2 focus-visible:ring-[hsl(var(--mid))] focus-visible:ring-offset-0 focus-visible:border-[hsl(var(--mid))]',
  )

  const eyebrow = isNewPassword ? t('newPasswordEyebrow') : t('forgotEyebrow')
  const title = mustReset
    ? t('mustResetTitle')
    : isNewPassword
      ? t('newPasswordTitle')
      : t('forgotTitle')
  const subtitle = mustReset
    ? t('mustResetSubtitle')
    : isNewPassword
      ? t('newPasswordSubtitle')
      : t('forgotSubtitle')

  return (
    <div className="min-h-[calc(100vh-68px)] grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[hsl(var(--deep))] to-[hsl(var(--mid))] p-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10">
          <Link href="/" className="mb-12 block">
            <Logo media={logo} className="brightness-0 invert" />
          </Link>
          <h2 className="text-4xl font-extrabold text-white leading-tight tracking-tight mb-4">
            {t('brandTitle')}
          </h2>
          <p className="text-[15px] text-white/70 leading-relaxed max-w-sm">{t('brandDesc')}</p>
        </div>
        <div className="relative z-10">
          <blockquote className="text-sm italic text-white/65 leading-relaxed pl-4 border-l-2 border-white/25">
            {t('brandQuote')}
          </blockquote>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-6 py-12 lg:px-16 bg-background">
        <div className="w-full max-w-[440px]">
          {showSuccess ? (
            /* Success state */
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[hsl(var(--green-light))] border-2 border-[hsl(var(--green))] flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-7 h-7 text-[hsl(var(--green))]" strokeWidth={2.5} />
              </div>
              <h2 className="text-[22px] font-extrabold text-[hsl(var(--deep))] mb-2">
                {isNewPassword ? t('resetPasswordSuccess') : t('forgotSuccessTitle')}
              </h2>
              <p className="text-sm text-[hsl(var(--ink-mid))] leading-relaxed mb-6">
                {isNewPassword ? t('resetPasswordSuccess') : t('forgotSuccessDesc')}
              </p>
              <Link
                href="/sign-in"
                className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-gradient-to-r from-[hsl(var(--deep))] to-[hsl(var(--mid))] text-white font-bold text-sm hover:opacity-90 transition-opacity"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('backToLogin')}
              </Link>
              {!isNewPassword && (
                <p className="text-sm text-[hsl(var(--ink-mid))] mt-4">
                  {t('didntReceive')}{' '}
                  <button
                    onClick={() => setShowSuccess(false)}
                    className="font-semibold text-[hsl(var(--mid))] hover:underline"
                  >
                    {t('tryAgain')}
                  </button>
                </p>
              )}
            </div>
          ) : (
            <>
              {!mustReset && (
                <Link
                  href="/sign-in"
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[hsl(var(--mid))] hover:gap-2.5 transition-all mb-7"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {t('backToLogin')}
                </Link>
              )}

              <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[hsl(var(--mid))] mb-4 before:content-[''] before:w-[18px] before:h-[2px] before:bg-[hsl(var(--mid))] before:rounded-full">
                {eyebrow}
              </p>
              <h1 className="text-[30px] font-extrabold text-[hsl(var(--deep))] leading-tight mb-2">
                {title}
              </h1>
              <p className="text-sm text-[hsl(var(--ink-mid))] leading-relaxed mb-8">{subtitle}</p>

              {!isNewPassword && (
                <div className="flex gap-2.5 bg-[hsl(var(--pale))] border border-[hsl(var(--light))] rounded-xl px-4 py-3.5 text-[13px] text-[hsl(var(--deep))] mb-6 leading-snug">
                  <Info className="w-4 h-4 text-[hsl(var(--mid))] shrink-0 mt-0.5" />
                  {t('forgotInfoBox')}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {!isNewPassword ? (
                  <div className="space-y-1.5">
                    <label
                      htmlFor="email"
                      className="block text-[11px] font-bold uppercase tracking-[0.7px] text-[hsl(var(--ink-mid))]"
                    >
                      {t('forgotEmailLabel')}
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="exemplo@email.com"
                      autoComplete="email"
                      {...register('email', { required: true })}
                      className={inputClass}
                    />
                    <p className="text-xs text-[hsl(var(--ink-light))]">{t('forgotEmailHint')}</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="password"
                        className="block text-[11px] font-bold uppercase tracking-[0.7px] text-[hsl(var(--ink-mid))]"
                      >
                        {t('newPasswordLabel')}
                      </label>
                      <PasswordInput
                        id="password"
                        placeholder="••••••••"
                        {...register('password', { required: true, minLength: 8 })}
                        className={inputClass}
                      />
                      {errors.password && (
                        <p className="text-xs text-[hsl(var(--coral))]">
                          {t('resetPasswordError')}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="confirmPassword"
                        className="block text-[11px] font-bold uppercase tracking-[0.7px] text-[hsl(var(--ink-mid))]"
                      >
                        {t('confirmPasswordLabel')}
                      </label>
                      <PasswordInput
                        id="confirmPassword"
                        placeholder="••••••••"
                        {...register('confirmPassword', {
                          required: true,
                          validate: (v) => v === watch('password'),
                        })}
                        className={inputClass}
                      />
                      {errors.confirmPassword && (
                        <p className="text-xs text-[hsl(var(--coral))]">
                          {t('resetPasswordError')}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {error && (
                  <p className="text-sm text-[hsl(var(--coral))] bg-[hsl(var(--coral-light))] rounded-xl px-4 py-3">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[hsl(var(--deep))] to-[hsl(var(--mid))] text-white font-bold text-[15px] tracking-[0.3px] hover:opacity-90 transition-opacity mt-1.5"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                      {isNewPassword ? t('saving') : t('forgotSending')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {isNewPassword ? t('newPasswordCta') : t('forgotCta')}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>

              {!isNewPassword && (
                <p className="text-center text-sm text-[hsl(var(--ink-mid))] mt-6">
                  {t('rememberedPassword')}{' '}
                  <Link
                    href="/sign-in"
                    className="font-semibold text-[hsl(var(--mid))] hover:underline"
                  >
                    {t('backToLogin')}
                  </Link>
                  <span className="block mt-2">
                    {t('dontHaveAccount')}{' '}
                    <Link
                      href="/sign-up"
                      className="font-semibold text-[hsl(var(--mid))] hover:underline"
                    >
                      {t('registerNow')}
                    </Link>
                  </span>
                </p>
              )}

              <p className="flex items-center justify-center gap-1.5 text-[11px] text-[hsl(var(--ink-light))] mt-5">
                <Lock className="w-3 h-3" />
                {t('secureNote')}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
