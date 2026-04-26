import type { Metadata } from 'next'
import Script from 'next/script'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'

import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { Syne, DM_Sans } from 'next/font/google'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'
import { getMeUser } from '@/utilities/getMeUser'
import { Toaster } from '@/components/ui/toaster'
import { TypedLocale } from 'payload'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { isEnabled } = await draftMode()
  const userObject = await getMeUser()
  const isEditorOrAdmin =
    userObject?.user?.role?.includes('editor') || userObject.user?.role?.includes('admin')

  const { locale } = await params
  if (!routing.locales.includes(locale as string)) {
    notFound()
  }
  setRequestLocale(locale)

  const messages = await getMessages()

  return (
    <html
      className={cn(syne.variable, dmSans.variable, GeistMono.variable)}
      lang={locale}
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" type="image/png" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <link href="/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />
        <Script
          src="https://www.termsfeed.com/public/cookie-consent/4.2.0/cookie-consent.js"
          strategy="afterInteractive"
          charSet="UTF-8"
        />
        <Script id="cookie-consent-init" strategy="afterInteractive" charSet="UTF-8">
          {`document.addEventListener('DOMContentLoaded', function () {
            cookieconsent.run({
              "notice_banner_type": "headline",
              "consent_type": "express",
              "palette": "light",
              "language": "pt",
              "page_load_consent_levels": ["strictly-necessary"],
              "notice_banner_reject_button_hide": false,
              "preferences_center_close_button_hide": false,
              "page_refresh_confirmation_buttons": false,
              "website_name": "Clube Swim4Fun"
            });
          });`}
        </Script>
      </head>
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages} locale={locale} timeZone="Europe/Lisbon">
          <Toaster />
          <Providers>
            {isEditorOrAdmin && (
              <AdminBar
                adminBarProps={{
                  preview: isEnabled,
                }}
              />
            )}
            <Header locale={locale as unknown as TypedLocale} />
            <div className="pt-[52px] md:pt-[68px] [padding-top:calc(52px+env(safe-area-inset-top))] md:[padding-top:calc(68px+env(safe-area-inset-top))]">
              {children}
            </div>
            <Footer locale={locale as unknown as TypedLocale} />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}
