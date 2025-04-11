'use client'

import React from 'react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ToastAction } from '@/components/ui/toast'
import { useEvents } from './events-context'
import { useTranslations } from 'next-intl'

interface EventDeleteFormProps {
  id?: string
  title?: string
}

export function EventDeleteForm({ id, title }: EventDeleteFormProps) {
  const { deleteEvent } = useEvents()
  const { eventDeleteOpen, setEventDeleteOpen, setEventViewOpen } = useEvents()
  const t = useTranslations()

  const { toast } = useToast()

  async function onSubmit() {
    deleteEvent(id!)
    setEventDeleteOpen(false)
    setEventViewOpen(false)
    toast({
      title: t('Calendar.eventDeleted'),
      action: (
        <ToastAction altText={t('Calendar.dismissNotification')}>{t('Common.close')}</ToastAction>
      ),
    })
  }

  return (
    <AlertDialog open={eventDeleteOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" onClick={() => setEventDeleteOpen(true)}>
          {t('Calendar.deleteEvent')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex flex-row justify-between items-center">
            <h1>
              {t('Common.delete')} {title}
            </h1>
          </AlertDialogTitle>
          {t('Calendar.deleteQuestion')}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setEventDeleteOpen(false)}>
            {t('Common.cancel')}
          </AlertDialogCancel>
          <Button variant="destructive" onClick={() => onSubmit()}>
            {t('Common.delete')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
