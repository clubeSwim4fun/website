import type { FieldHook } from 'payload'

export const formatSlug = (val: string): string =>
  val
    .replace(/ /g, '-')
    .replace(/[áàâãäå]/gi, 'a')
    .replace(/[éèêë]/gi, 'e')
    .replace(/[íìîï]/gi, 'i')
    .replace(/[óòôõö]/gi, 'o')
    .replace(/[úùûü]/gi, 'u')
    .replace(/[ç]/gi, 'c')
    .replace(/[^\w-]+/g, '')
    .toLowerCase()

export const formatSlugHook =
  (fallback: string): FieldHook =>
  ({ data, operation, value, originalDoc }) => {
    if (typeof value === 'string') {
      return formatSlug(value)
    }

    if (operation === 'create' || !data?.slug) {
      const fallbackData = data?.[fallback]

      // Handle localized fields (object with locale keys like { pt: '...', en: '...' })
      const resolvedFallback =
        typeof fallbackData === 'string'
          ? fallbackData
          : fallbackData && typeof fallbackData === 'object'
            ? (Object.values(fallbackData).find((v) => typeof v === 'string') as string | undefined)
            : undefined

      if (resolvedFallback) {
        return formatSlug(resolvedFallback)
      }
    }

    return value ? formatSlug(value) : originalDoc?.slug
  }
