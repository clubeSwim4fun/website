import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'

import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
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
import { Cart } from '@/components/Cart'

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
  if (!routing.locales.includes(locale as any)) {
    notFound()
  }
  setRequestLocale(locale)

  const messages = await getMessages()

  return (
    <html
      className={cn(GeistSans.variable, GeistMono.variable)}
      lang={locale}
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Toaster />
          <Providers>
            {isEditorOrAdmin && (
              <AdminBar
                adminBarProps={{
                  preview: isEnabled,
                }}
              />
            )}
            <Header />
            {children}
            <div className="fixed bottom-2 right-4 z-50 bg-white rounded-full p-4 md:hidden dark:bg-slate-800 shadow-xl border border-slate-300">
              <Cart />
            </div>
            <Footer />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@payloadcms',
  },
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}
