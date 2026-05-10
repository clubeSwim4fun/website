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
  hasPaymentSelectorRef: React.MutableRefObject<boolean>
  registerPaymentSelector: (defaultOption?: PaymentOption) => void
  registerFormValidation: (fn: () => Promise<boolean>) => void
  triggerFormValidation: () => Promise<boolean>
  /** Live form validity — false when a co-located FormBlock has invalid fields */
  formIsValid: boolean
  setFormIsValid: (valid: boolean) => void
  /** Form ID registered by a form-variant CardBlock on a previous step */
  stepFormIdRef: React.MutableRefObject<string | null>
  setStepFormId: (id: string) => void
}

const StepPaymentContext = createContext<StepPaymentContextType | null>(null)

export const useStepPayment = () => useContext(StepPaymentContext)

export const StepPaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const submitRef = useRef<(() => Promise<{ error?: string }>) | null>(null)
  const formValidatorRef = useRef<(() => Promise<boolean>) | null>(null)
  const hasPaymentSelectorRef = useRef(false)
  const [status, setStatus] = useState<PaymentStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [hasStripe, setHasStripe] = useState(false)
  const [isReady, setReady] = useState(false)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<PaymentOption | null>(null)
  // true by default — only false when a FormBlock explicitly registers and reports invalid
  const [formIsValid, setFormIsValid] = useState(true)
  const stepFormIdRef = useRef<string | null>(null)
  const setStepFormId = React.useCallback((id: string) => {
    stepFormIdRef.current = id
  }, [])

  const registerPaymentSelector = (defaultOption?: PaymentOption) => {
    hasPaymentSelectorRef.current = true
    if (defaultOption) {
      setSelectedPaymentOption(defaultOption)
    }
  }

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
        hasPaymentSelectorRef,
        registerPaymentSelector,
        registerFormValidation,
        triggerFormValidation,
        formIsValid,
        setFormIsValid,
        stepFormIdRef,
        setStepFormId,
      }}
    >
      {children}
    </StepPaymentContext.Provider>
  )
}
