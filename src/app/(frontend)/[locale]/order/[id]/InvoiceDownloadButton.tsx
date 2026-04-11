'use client'

import { useState } from 'react'
import { FileDown, Loader } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { fetchReceiptForPaymentIntent } from '@/actions/invoice'
import { useToast } from '@/hooks/use-toast'

export function InvoiceDownloadButton({ paymentIntentId }: { paymentIntentId: string }) {
  const [loading, setLoading] = useState(false)
  const t = useTranslations('User.Subscriptions')
  const { toast } = useToast()

  const handleClick = async () => {
    setLoading(true)
    const result = await fetchReceiptForPaymentIntent(paymentIntentId)
    setLoading(false)
    if (result.error || !result.receipt) {
      toast({ variant: 'destructive', description: t('invoiceNotAvailable') })
      return
    }
    if (result.receipt.permalink) {
      window.open(result.receipt.permalink, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-2 border-2 border-[#d4eaf2] text-[#0e7ea8] font-medium text-sm rounded-xl px-5 py-3 hover:bg-[#f0fafd] transition-colors disabled:opacity-50"
    >
      {loading ? <Loader className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
      {t('downloadInvoice')}
    </button>
  )
}
