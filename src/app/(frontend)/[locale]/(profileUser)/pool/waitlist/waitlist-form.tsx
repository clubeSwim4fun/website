'use client'

import { useState } from 'react'
import { joinPoolWaitlist } from '@/actions/pool-subscription'
import { useToast } from '@/hooks/use-toast'
import { PoolCycle, User } from '@/payload-types'
import { useRouter } from '@/i18n/routing'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

type Args = {
  cycle: PoolCycle
  user: User
  expectedPosition: number
}

export const WaitlistForm: React.FC<Args> = ({ cycle, user: _user, expectedPosition }) => {
  const t = useTranslations('PoolSubscription')
  const locale = useLocale()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleJoin = async () => {
    setLoading(true)
    try {
      const result = await joinPoolWaitlist(cycle.id)

      if (!result.success) {
        toast({
          variant: 'destructive',
          description: result.message || t('cycleNotFound'),
        })
        return
      }

      router.push(`/pool/confirmation`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <p className="text-lg font-medium">{t('waitlistPosition', { position: expectedPosition })}</p>
      <p className="text-sm text-muted-foreground">
        {t('waitlistConfirmation', { position: expectedPosition })}
      </p>
      <Button onClick={handleJoin} disabled={loading}>
        {loading ? t('joinWaitlistButton') + '...' : t('joinWaitlistButton')}
      </Button>
    </div>
  )
}
