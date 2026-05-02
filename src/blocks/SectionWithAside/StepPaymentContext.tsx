'use client'

import React, { createContext, useContext, useRef, useState } from 'react'

type PaymentStatus = 'idle' | 'processing' | 'success' | 'error'

type StepPaymentContextType = {
  registerSubmit: (fn: () => Promise<{ error?: string }>) => void
  triggerSubmit: () => Promise<{ error?: string }>
  status: PaymentStatus
  setStatus: (s: PaymentStatus) => void
  errorMessage: string | null
  setErrorMessage: (m: string | null) => void
  hasStripe: boolean
  isReady: boolean
  setReady: (ready: boolean) => void
  paymentIntentId: string | null
  setPaymentIntentId: (id: string) => void
}

const StepPaymentContext = createContext<StepPaymentContextType | null>(null)

export const useStepPayment = () => useContext(StepPaymentContext)

export const StepPaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const submitRef = useRef<(() => Promise<{ error?: string }>) | null>(null)
  const [status, setStatus] = useState<PaymentStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [hasStripe, setHasStripe] = useState(false)
  const [isReady, setReady] = useState(false)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)

  const registerSubmit = (fn: () => Promise<{ error?: string }>) => {
    submitRef.current = fn
    setHasStripe(true)
  }

  const triggerSubmit = async () => {
    if (!submitRef.current) return {}
    return submitRef.current()
  }

  return (
    <StepPaymentContext.Provider
      value={{
        registerSubmit,
        triggerSubmit,
        status,
        setStatus,
        errorMessage,
        setErrorMessage,
        hasStripe,
        isReady,
        setReady,
        paymentIntentId,
        setPaymentIntentId,
      }}
    >
      {children}
    </StepPaymentContext.Provider>
  )
}
