'use client'

import React from 'react'
import { useField, useTranslation } from '@payloadcms/ui'

const ValidationButtons: React.FC<{ path: string }> = () => {
  const { setValue } = useField<string>({ path: 'status' })
  const { value: fieldsToUpdate } = useField<string>({ path: 'fieldsToUpdate' })
  const { value: profilePicture, setValue: setProfilePictureValue } = useField<string>({
    path: 'profilePicture',
  })
  const { value: identityFiles, setValue: setIdentityFile } = useField<string>({
    path: 'identityFile',
  })

  const updateStatus = async (newStatus: 'pendingPayment' | 'pendingUpdate') => {
    if (fieldsToUpdate && fieldsToUpdate.length > 0) {
      if (fieldsToUpdate.includes('profilePicture')) {
        const response = await fetch(`/api/user-media/${profilePicture}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        setProfilePictureValue(null)
      }

      if (fieldsToUpdate.includes('identityCardFile')) {
        for (const file of identityFiles) {
          await fetch(`/api/user-media/${file}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          })
        }

        setIdentityFile(null)
      }
    }

    setValue(newStatus)
  }

  const labels = {
    en: { approve: 'Approve', reject: 'Reject' },
    pt: { approve: 'Aprovar', reject: 'Reprovar' },
  }
  const trans = useTranslation()
  const lang = trans.i18n.language as unknown as 'pt' | 'en'

  const t = labels[lang] || labels.en

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
      <button
        type="button"
        onClick={() => updateStatus('pendingPayment')}
        style={{ backgroundColor: '#4CAF50', color: 'white', padding: '0.5rem', cursor: 'pointer' }}
      >
        {t.approve}
      </button>
      <button
        type="button"
        onClick={() => updateStatus('pendingUpdate')}
        style={{ backgroundColor: '#f44336', color: 'white', padding: '0.5rem', cursor: 'pointer' }}
      >
        {t.reject}
      </button>
    </div>
  )
}

export default ValidationButtons
