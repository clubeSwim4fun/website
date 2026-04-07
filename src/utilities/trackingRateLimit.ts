/**
 * Lightweight in-process rate limiter for tracking endpoints.
 * No external dependency — uses a Map with TTL-based eviction.
 * Limits: max MAX_HITS per token within WINDOW_MS.
 */

const WINDOW_MS = 60_000 // 1 minute
const MAX_HITS = 10

interface Entry {
  count: number
  resetAt: number
}

const store = new Map<string, Entry>()

// Evict stale entries periodically to avoid unbounded memory growth
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key)
  }
}, 5 * 60_000).unref?.()

export function isRateLimited(token: string): boolean {
  const now = Date.now()
  const entry = store.get(token)

  if (!entry || entry.resetAt < now) {
    store.set(token, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }

  if (entry.count >= MAX_HITS) return true

  entry.count++
  return false
}
