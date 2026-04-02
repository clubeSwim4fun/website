'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { useToast } from '@/hooks/use-toast'
import { cancelPoolSubscription } from '@/actions/pool-subscription'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

type Props = {
  subscriptionId: string
}

export const CancelButton: React.FC<Props> = ({ subscriptionId }) => {
  const t = useTranslations('PoolSubscription')
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hideButton] = useState(true) // Hidden button for now as it's not required

  const handleConfirm = async () => {
    setLoading(true)
    try {
      const result = await cancelPoolSubscription(subscriptionId)

      if (!result.success) {
        toast({
          variant: 'destructive',
          description: result.message,
        })
        return
      }

      router.push(`/pool`)
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return hideButton ? (
    <></>
  ) : (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        {t('cancelButton')}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('cancelConfirmTitle')}</DialogTitle>
            <DialogDescription>{t('cancelConfirmDescription')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              {t('cancelButton')}
            </Button>
            <Button variant="destructive" onClick={handleConfirm} disabled={loading}>
              {loading ? '...' : t('confirmCancelButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
