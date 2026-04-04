import type { Form } from '@payloadcms/plugin-form-builder/types'

export type CmsField = {
  label: string
  required: boolean
  blockType?: string
  options?: { label: string; value: string }[]
  // password-specific
  hasConfirmPassword?: boolean
  confirmLabel?: string
  // select-specific
  type?: string
  globalConfigCollection?: string
  // address-specific
  address?: {
    streetLabel?: string | null
    numberLabel?: string | null
    stateLabel?: string | null
    zipcodeLabel?: string | null
    streetRequired?: boolean | null
    numberRequired?: boolean | null
    stateRequired?: boolean | null
    zipRequired?: boolean | null
  }
  // which wizard step this field belongs to (1–4)
  wizardStep?: '1' | '2' | '3' | '4'
}

/**
 * Builds a name → CmsField lookup from the Payload form-builder form object.
 * Falls back gracefully if a field is missing.
 */
export function buildFieldMap(form: Form | undefined): Record<string, CmsField> {
  const map: Record<string, CmsField> = {}
  if (!form?.fields) return map

  for (const field of form.fields as any[]) {
    const name: string = field.name
    if (!name) continue
    map[name] = {
      label: field.label ?? name,
      required: Boolean(field.required),
      blockType: field.blockType,
      options: field.options ?? undefined,
      hasConfirmPassword: field.hasConfirmPassword,
      confirmLabel: field.confirmLabel,
      type: field.type,
      globalConfigCollection: field.globalConfigCollection,
      address: field.address,
      wizardStep: field.wizardStep ?? '1',
    }
  }
  return map
}

/** Returns the label for a field, falling back to the provided default. */
export function label(map: Record<string, CmsField>, name: string, fallback: string): string {
  return map[name]?.label ?? fallback
}

/** Returns whether a field is required per CMS config, falling back to the provided default. */
export function required(map: Record<string, CmsField>, name: string, fallback = true): boolean {
  return map[name] !== undefined ? map[name]!.required : fallback
}

/** Returns the options array for a select field. */
export function options(
  map: Record<string, CmsField>,
  name: string,
): { label: string; value: string }[] {
  return map[name]?.options ?? []
}

/**
 * The set of field names that are hardcoded in the wizard steps.
 * Extra fields added by the admin (not in this set) will be rendered dynamically.
 */
const HARDCODED_FIELDS = new Set([
  'nome',
  'surname',
  'email',
  'password',
  'phone',
  'gender',
  'birthDate',
  'nationality',
  'tshirtSize',
  'address',
  'emergencyContact',
  'emergencyPhone',
  'identity',
  'nif',
  'identityFile',
  'profilePicture',
  'disability',
  'sportInsurance',
  'emailNotifications',
  'whatsappNotifications',
  'heardAboutClub',
  'wantsInvoiceWithNif',
  'consent',
])

/**
 * Returns extra CMS fields (not hardcoded) assigned to a given wizard step.
 * These are fields the admin added beyond the built-in ones.
 */
export function extraFieldsForStep(
  map: Record<string, CmsField>,
  step: '1' | '2' | '3' | '4',
): Array<{ name: string } & CmsField> {
  return Object.entries(map)
    .filter(([name, field]) => !HARDCODED_FIELDS.has(name) && field.wizardStep === step)
    .map(([name, field]) => ({ name, ...field }))
}
