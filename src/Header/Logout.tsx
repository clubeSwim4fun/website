'use client'

import { logout } from '@/actions/logout'
import { Button } from '@/components/ui/button'
import { LoaderCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

export default function LogoutButton() {
  const [isPending, setIsPending] = useState(false)
  const [, setError] = useState<string | null>(null)
  const router = useRouter()
  const t = useTranslations('Nav')

  async function handleLogout() {
    setIsPending(true)
    setError(null)
    const result = await logout()
    if (result.success) {
      router.push('/')
      setIsPending(false)
    } else {
      setError(result.error || 'Logout failed')
    }
  }

  return (
    <Button
      variant="link"
      size="clear"
      onClick={handleLogout}
      className="text-sm font-medium text-ink-mid px-3.5 py-2 rounded-lg hover:bg-foam hover:text-mid transition-colors duration-150"
    >
      {isPending ? <LoaderCircle size={16} className="animate-spin" /> : t('logout')}
    </Button>
  )
}
