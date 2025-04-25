import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import type { User } from '../payload-types'
import { getClientSideURL } from './getURL'

let cachedUser: { user: User; token: string; timestamp: number } | null = null
const CACHE_EXPIRATION_MS = 5 * 60 * 1000 // Cache expires in 5 minutes

export const getMeUser = async (args?: {
  nullUserRedirect?: string
  validUserRedirect?: string
  invalidateCache?: boolean
}): Promise<{
  token?: string
  user?: User
  error?: string
}> => {
  const { nullUserRedirect, validUserRedirect, invalidateCache } = args || {}
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  // Handle logout: clear cache if token is null
  if (!token) {
    cachedUser = null
    if (nullUserRedirect) {
      redirect(nullUserRedirect)
    }
    return { error: 'User is logged out' }
  }

  // Check if the cached user is still valid
  if (
    !invalidateCache &&
    cachedUser &&
    cachedUser.token === token &&
    Date.now() - cachedUser.timestamp < CACHE_EXPIRATION_MS
  ) {
    return {
      token: cachedUser.token,
      user: cachedUser.user,
    }
  }

  try {
    const meUserReq = await fetch(`${getClientSideURL()}/api/users/me`, {
      headers: {
        Authorization: `JWT ${token}`,
      },
    })

    const {
      user,
    }: {
      user: User
    } = await meUserReq.json()

    if (validUserRedirect && meUserReq.ok && user) {
      redirect(validUserRedirect)
    }

    if (nullUserRedirect && (!meUserReq.ok || !user)) {
      redirect(nullUserRedirect)
    }

    // Cache the user and token
    cachedUser = {
      user,
      token: token!,
      timestamp: Date.now(),
    }

    return {
      token: token!,
      user,
    }
  } catch (error) {
    // Clear the cache on error
    cachedUser = null

    return {
      error: JSON.stringify(error),
    }
  }
}
