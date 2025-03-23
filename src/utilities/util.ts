// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isObjectNotEmpty = (obj: any): boolean => {
  return Object.values(obj).some((value) => value !== '' && value !== null && value !== undefined)
}

export const convertMtoKm = (meters: number): string => {
  return `${meters / 1000} km`
}
