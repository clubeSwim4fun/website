/**
 * Validates a Portuguese NIF (Número de Identificação Fiscal).
 * Uses the official modulo-11 checksum algorithm.
 */
export function validateNif(nif: string): boolean {
  if (!/^\d{9}$/.test(nif)) return false

  const validFirstDigits = ['1', '2', '3', '5', '6', '8', '9']
  if (!validFirstDigits.includes(nif[0]!)) return false

  const checkDigit = Number(nif[8])
  let sum = 0
  for (let i = 0; i < 8; i++) {
    sum += Number(nif[i]) * (9 - i)
  }
  const remainder = sum % 11
  const expected = remainder < 2 ? 0 : 11 - remainder

  return checkDigit === expected
}
