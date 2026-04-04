'use client'

import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PhoneInput } from '@/components/ui/phone-input'
import { FieldError, FieldGroup, FieldLabel } from './StepCard'
import { CmsField } from './useFormFields'

type Props = {
  name: string
  field: CmsField
  value: string | boolean
  error?: string
  onChange: (name: string, value: string | boolean) => void
}

/**
 * Renders a single extra CMS-configured field that isn't hardcoded in a step.
 * Supports: text, email, number, date, phone, select, checkbox.
 */
export function DynamicField({ name, field, value, error, onChange }: Props) {
  const blockType = (field as any).blockType as string | undefined

  if (blockType === 'checkbox') {
    return (
      <FieldGroup>
        <div className="flex items-center gap-2">
          <Checkbox
            id={name}
            checked={Boolean(value)}
            onCheckedChange={(v) => onChange(name, Boolean(v))}
          />
          <FieldLabel htmlFor={name} required={field.required}>
            {field.label}
          </FieldLabel>
        </div>
        <FieldError message={error} />
      </FieldGroup>
    )
  }

  if (blockType === 'select') {
    return (
      <FieldGroup>
        <FieldLabel required={field.required}>{field.label}</FieldLabel>
        <Select value={String(value ?? '')} onValueChange={(v) => onChange(name, v)}>
          <SelectTrigger className={error ? 'border-[#e85d4a]' : ''}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError message={error} />
      </FieldGroup>
    )
  }

  if (blockType === 'phone') {
    return (
      <FieldGroup>
        <FieldLabel required={field.required}>{field.label}</FieldLabel>
        <PhoneInput
          defaultCountry="PT"
          value={String(value ?? '')}
          onChange={(v) => onChange(name, v ?? '')}
          className={error ? '[&_input]:border-[#e85d4a]' : ''}
        />
        <FieldError message={error} />
      </FieldGroup>
    )
  }

  // text, email, number, date, country — all render as <Input>
  const inputType =
    blockType === 'email'
      ? 'email'
      : blockType === 'number'
        ? 'number'
        : blockType === 'datePicker'
          ? 'date'
          : 'text'

  return (
    <FieldGroup>
      <FieldLabel htmlFor={name} required={field.required}>
        {field.label}
      </FieldLabel>
      <Input
        id={name}
        type={inputType}
        value={String(value ?? '')}
        onChange={(e) => onChange(name, e.target.value)}
        className={error ? 'border-[#e85d4a]' : ''}
      />
      <FieldError message={error} />
    </FieldGroup>
  )
}
