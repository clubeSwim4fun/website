'use client'

import { selectPoolSlots } from '@/actions/pool-subscription'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { PoolCycle } from '@/payload-types'
import { useRouter } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

type Slot = NonNullable<PoolCycle['availableSlots']>[number] & { index: number; available: number }

type Props = {
  subscriptionId: string
  slots: Slot[]
  initialSelected: number[]
}

export const SlotSelector: React.FC<Props> = ({ subscriptionId, slots, initialSelected }) => {
  const t = useTranslations('PoolSubscription')
  const { toast } = useToast()
  const router = useRouter()
  const [selected, setSelected] = useState<number[]>(initialSelected)
  const [saving, setSaving] = useState(false)

  const toggle = (idx: number) => {
    setSelected((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]))
  }

  const handleSave = async () => {
    setSaving(true)
    const result = await selectPoolSlots(subscriptionId, selected)
    setSaving(false)
    if (!result.success) {
      toast({ variant: 'destructive', description: result.message || t('cycleNotFound') })
      setSelected(initialSelected)
    } else {
      toast({ description: t('slotsSaved') })
    }
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="font-medium">{t('selectSlotsLabel')}</p>
      <ul className="flex flex-col gap-2">
        {slots.map((slot) => {
          const isFull = slot.available <= 0 && !selected.includes(slot.index)
          return (
            <li key={slot.index} className="flex items-center gap-3">
              <Checkbox
                id={`slot-${slot.index}`}
                checked={selected.includes(slot.index)}
                onCheckedChange={() => toggle(slot.index)}
                disabled={isFull}
              />
              <Label
                htmlFor={`slot-${slot.index}`}
                className={isFull ? 'text-muted-foreground' : ''}
              >
                {slot.day} — {slot.time}
                {isFull
                  ? ` (${t('slotFullError')})`
                  : ` (${t('slotAvailable', { count: slot.available })})`}
              </Label>
            </li>
          )
        })}
      </ul>
      <Button onClick={handleSave} disabled={saving} className="w-fit">
        {saving ? '...' : t('saveSlotsButton')}
      </Button>
    </div>
  )
}
