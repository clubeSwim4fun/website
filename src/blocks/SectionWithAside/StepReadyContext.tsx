'use client'

import React, { createContext, useCallback, useContext, useRef, useState } from 'react'

type StepReadyContextType = {
  register: (id: string) => void
  unregister: (id: string) => void
  isBlocked: boolean
}

const StepReadyContext = createContext<StepReadyContextType | null>(null)

export const useStepReady = () => useContext(StepReadyContext)

export const StepReadyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const blockersRef = useRef<Set<string>>(new Set())
  const [isBlocked, setIsBlocked] = useState(false)

  const register = useCallback((id: string) => {
    blockersRef.current.add(id)
    setIsBlocked(true)
  }, [])

  const unregister = useCallback((id: string) => {
    blockersRef.current.delete(id)
    setIsBlocked(blockersRef.current.size > 0)
  }, [])

  return (
    <StepReadyContext.Provider value={{ register, unregister, isBlocked }}>
      {children}
    </StepReadyContext.Provider>
  )
}

/**
 * Hook for components that need to block the step's next button while loading.
 * Call register() when loading starts, unregister() when done.
 * Safe to call even when not inside a StepReadyProvider (no-ops).
 */
export function useStepBlocker(id: string) {
  const ctx = useStepReady()
  const registeredRef = useRef(false)

  const block = useCallback(() => {
    if (!ctx || registeredRef.current) return
    registeredRef.current = true
    ctx.register(id)
  }, [ctx, id])

  const unblock = useCallback(() => {
    if (!ctx || !registeredRef.current) return
    registeredRef.current = false
    ctx.unregister(id)
  }, [ctx, id])

  return { block, unblock }
}
