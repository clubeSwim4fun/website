'use client'
import { Header } from '@/payload-types'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const RowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<NonNullable<Header['navItems']>[number]>()

  // Nav item row (has link.label) vs children page row (has label directly)
  const navLabel = (data?.data as any)?.link?.label
  const childLabel = (data?.data as any)?.label

  const label = navLabel
    ? `Nav item ${data.rowNumber !== undefined ? data.rowNumber + 1 : ''}: ${navLabel}`
    : childLabel
      ? `Row ${data.rowNumber !== undefined ? data.rowNumber + 1 : ''}: ${childLabel}`
      : 'Row'

  return <div>{label}</div>
}
