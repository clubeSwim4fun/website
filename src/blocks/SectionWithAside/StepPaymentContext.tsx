'use client'

import React, { createContext, useContext, useRef, useState } from 'react'

type PaymentStatus = 'idle' | 'processing' | 'success' | 'error'

export type PaymentOption = { amount: number; label: string }

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
  /** Set by a form select field marked as payment selector */
  selectedPaymentOption: PaymentOption | null
  setSelectedPaymentOption: (opt: PaymentOption | null) => void
  /**
   * Form validity gate — when a FormBlock is on the same stripe step it registers
   * its RHF trigger here. The pay button calls this before submitting so invalid
   * fields are highlighted and the payment is blocked.
   */
  registerFormValidation: (fn: () => Promise<boolean>) => void
  triggerFormValidation: () => Promise<boolean>
  /** Live form validity — false when a co-located FormBlock has invalid fields */
  formIsValid: boolean
  setFormIsValid: (valid: boolean) => void
}

const StepPaymentContext = createContext<StepPaymentContextType | null>(null)

export const useStepPayment = () => useContext(StepPaymentContext)

export const StepPaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const submitRef = useRef<(() => Promise<{ error?: string }>) | null>(null)
  const formValidatorRef = useRef<(() => Promise<boolean>) | null>(null)
  const [status, setStatus] = useState<PaymentStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [hasStripe, setHasStripe] = useState(false)
  const [isReady, setReady] = useState(false)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<PaymentOption | null>(null)
  // true by default — only false when a FormBlock explicitly registers and reports invalid
  const [formIsValid, setFormIsValid] = useState(true)

  const registerSubmit = (fn: () => Promise<{ error?: string }>) => {
    submitRef.current = fn
    setHasStripe(true)
  }

  const triggerSubmit = async () => {
    if (!submitRef.current) return {}
    return submitRef.current()
  }

  const registerFormValidation = (fn: () => Promise<boolean>) => {
    formValidatorRef.current = fn
  }

  const triggerFormValidation = async (): Promise<boolean> => {
    if (!formValidatorRef.current) return true
    return formValidatorRef.current()
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
        selectedPaymentOption,
        setSelectedPaymentOption,
        registerFormValidation,
        triggerFormValidation,
        formIsValid,
        setFormIsValid,
      }}
    >
      {children}
    </StepPaymentContext.Provider>
  )
}
