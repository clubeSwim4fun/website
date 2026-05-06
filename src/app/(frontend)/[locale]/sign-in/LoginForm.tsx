'use client'

import React, { FormEvent, useState } from 'react'
import { LoaderCircle, Lock, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/RegistrationWizard/PasswordInput'
import { login, LoginResponse } from '@/actions/login'
import { cn } from '@/utilities/ui'
import { Page, Media } from '@/payload-types'
import { Logo } from '@/components/Logo/Logo'

export default function LoginForm({
  loginSettings,
  logo,
}: {
  loginSettings?: { registerUrl?: (string | null) | Page }
  logo?: Media | null
}) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const t = useTranslations('Sign-in')

  const registerUrl =
    typeof loginSettings?.registerUrl === 'string'
      ? loginSettings.registerUrl
      : loginSettings?.registerUrl?.slug || 'sign-up'

  const callbackUrl = searchParams.get('callbackUrl') || '/'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const result: LoginResponse = await login({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    })

    if (!result.success) {
      setError(result.error || 'Login failed')
      setIsPending(false)
    } else if (result.mustResetPassword) {
      router.push('reset-password?mustReset=true')
    }
  }

  return (
    <div className="min-h-[calc(100vh-68px)] grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[hsl(var(--deep))] to-[hsl(var(--mid))] p-16 relative overflow-hidden">
        {/* subtle pattern overlay */}
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
          <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[hsl(var(--mid))] mb-4 before:content-[''] before:w-[18px] before:h-[2px] before:bg-[hsl(var(--mid))] before:rounded-full">
            {t('eyebrow')}
          </p>
          <h1 className="text-[30px] font-extrabold text-[hsl(var(--deep))] leading-tight mb-2">
            {t('loginTitle')}
          </h1>
          <p className="text-sm text-[hsl(var(--ink-mid))] leading-relaxed mb-8">
            {t('loginSubtitle')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-[11px] font-bold uppercase tracking-[0.7px] text-[hsl(var(--ink-mid))]"
              >
                {t('email')}
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="exemplo@email.com"
                autoComplete="email"
                required
                className={cn(
                  'h-12 rounded-xl border-[hsl(var(--swim-border))] bg-white px-4 text-sm',
                  'focus-visible:ring-2 focus-visible:ring-[hsl(var(--mid))] focus-visible:ring-offset-0 focus-visible:border-[hsl(var(--mid))]',
                )}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-[11px] font-bold uppercase tracking-[0.7px] text-[hsl(var(--ink-mid))]"
                >
                  {t('password')}
                </label>
                <Link
                  href="/reset-password"
                  className="text-xs font-semibold text-[hsl(var(--mid))] hover:underline"
                >
                  {t('forgotPassword')}
                </Link>
              </div>
              <PasswordInput
                id="password"
                name="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className={cn(
                  'h-12 rounded-xl border-[hsl(var(--swim-border))] bg-white px-4 text-sm',
                  'focus-visible:ring-2 focus-visible:ring-[hsl(var(--mid))] focus-visible:ring-offset-0 focus-visible:border-[hsl(var(--mid))]',
                )}
              />
            </div>

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
                  {t('loggingIn')}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {t('loginCta')}
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="flex items-center justify-center gap-1.5 text-[11px] text-[hsl(var(--ink-light))] mt-5">
            <Lock className="w-3 h-3" />
            {t('secureNote')}
          </p>

          <p className="text-center text-sm text-[hsl(var(--ink-mid))] mt-6">
            {t('dontHaveAccount')}{' '}
            <Link
              href={`/${registerUrl}`}
              className="font-semibold text-[hsl(var(--mid))] hover:underline"
            >
              {t('registerNow')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
