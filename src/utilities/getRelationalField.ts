import { GeneralConfig } from '@/payload-types'
import { FormFieldBlock } from '@payloadcms/plugin-form-builder/types'

export type CustomFormFieldBlock = FormFieldBlock & {
  name?: string
  size?: 'full' | 'half' | 'one-third'
  relatesTo?: string
  generalConfigData?: GeneralConfig
}
export const getRelationalField = ({
  fields,
  name,
}: {
  fields: CustomFormFieldBlock[]
  name: string
}): string => {
  return (
    fields.find((field) => field.name === name)?.relatesTo ||
    fields.find((field) => field.name === name)?.name ||
    name
  )
}
