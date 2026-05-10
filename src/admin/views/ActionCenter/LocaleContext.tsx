'use client'
import React, { createContext, useContext } from 'react'
import { AC_TRANSLATIONS, type ACTranslations } from './i18n'

const LocaleContext = createContext<ACTranslations>(AC_TRANSLATIONS.en as ACTranslations)

export function ACLocaleProvider({ lang, children }: { lang: string; children: React.ReactNode }) {
  const t = (AC_TRANSLATIONS[lang as keyof typeof AC_TRANSLATIONS] ??
    AC_TRANSLATIONS.en) as ACTranslations
  return <LocaleContext.Provider value={t}>{children}</LocaleContext.Provider>
}

export function useACT(): ACTranslations {
  return useContext(LocaleContext)
}
