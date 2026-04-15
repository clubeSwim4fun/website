'use client'

import React from 'react'
import type { NumberFieldClientProps } from 'payload'
import { useField, useFormFields } from '@payloadcms/ui'

export const StepSelectField: React.FC<NumberFieldClientProps> = ({ field, path }) => {
  const fieldPath = path ?? field.name
  const { value, setValue } = useField<number>({ path: fieldPath })

  // Derive the navigation prefix from the current field path.
  // fieldPath is e.g. "layout.2.mainContent.0.step"
  // We need "layout.2.navigation.steps"
  const navPrefix = fieldPath.replace(/\.mainContent\..+$/, '.navigation.steps')

  const stepCount = useFormFields(([fields]) => {
    let count = 0
    while (`${navPrefix}.${count}.label` in fields) count++
    return count
  })

  const stepLabels = useFormFields(([fields]) => {
    const labels: string[] = []
    let i = 0
    while (`${navPrefix}.${i}.label` in fields) {
      labels.push((fields[`${navPrefix}.${i}.label`]?.value as string) ?? '')
      i++
    }
    return labels
  })

  const options =
    stepCount > 0
      ? Array.from({ length: stepCount }, (_, i) => ({
          value: i + 1,
          label: stepLabels[i] ? `${i + 1} — ${stepLabels[i]}` : `Step ${i + 1}`,
        }))
      : [{ value: 1, label: 'Step 1' }]

  return (
    <div className="field-type number">
      {field.label && (
        <label
          htmlFor={fieldPath}
          style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600 }}
        >
          {typeof field.label === 'string'
            ? field.label
            : ((field.label as any)?.en ?? 'Navigation Step')}
          {field.required && (
            <span style={{ color: 'var(--theme-error-500)', marginLeft: '2px' }}>*</span>
          )}
        </label>
      )}
      <select
        value={value ?? ''}
        onChange={(e) => setValue(Number(e.target.value))}
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: '4px',
          border: '1px solid var(--theme-elevation-150)',
          background: 'var(--theme-elevation-0)',
          color: 'var(--theme-text)',
          fontSize: '14px',
          cursor: 'pointer',
        }}
      >
        <option value="" disabled>
          — select step —
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
