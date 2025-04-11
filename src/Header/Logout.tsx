'use client'

import { logout } from '@/actions/logout'
import { Button } from '@/components/ui/button'
import { LoaderCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LogoutButton() {
  const [isPending, setIsPending] = useState(false)
  const [, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleLogout() {
    setIsPending(true)
    setError(null)

    const result = await logout()

    if (result.success) {
      // Redirect to home page after successful logout
      router.push('/')
      setIsPending(false)
    } else {
      // Display error message
      // TODO - Add toast error
      setError(result.error || 'Logout failed')
    }
  }

  return (
    <Button
      variant={'link'}
      size={'clear'}
      onClick={handleLogout}
      className="text-black dark:text-white group flex flex-col items-center"
    >
      {/* TODO - Add label  */}

      {/* Add label */}
      {isPending ? <LoaderCircle className="animate-spin" /> : 'Logout'}
    </Button>
  )
}
