import COUNTRY_LIST from '@/utilities/countryList'

export const getCountryCode = (countryName?: string): string | undefined => {
  return COUNTRY_LIST.find((c) => c.name.toLowerCase() === countryName?.toLowerCase())?.code || 'PT'
}
