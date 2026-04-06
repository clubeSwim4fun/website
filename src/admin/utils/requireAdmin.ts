'use client'
import { useAuth } from '@payloadcms/ui'

export function useRequireAdmin() {
  const { user } = useAuth()
  const isAdmin = (user as any)?.role === 'admin'
  return { user, isAdmin }
}
