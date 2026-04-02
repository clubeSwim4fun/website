'use client'

import { useRowLabel } from '@payloadcms/ui'

export const PoolSubscriptionSlotRowLabel: React.FC = () => {
  const { data, rowNumber } = useRowLabel<{ day?: string; time?: string }>()

  if (data?.day && data?.time) {
    return (
      <span>
        {data.day} — {data.time}
      </span>
    )
  }

  return <span>Slot {(rowNumber ?? 0) + 1}</span>
}
