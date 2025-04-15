import { getLogo } from '@/helpers/emailHelper'
import React from 'react'

type Args = {
  children: React.ReactNode
}

export async function TemplateEmail({ children }: Args) {
  const logo = await getLogo()

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.6',
        fontSize: '16px',
        color: '#333',
      }}
    >
      <div
        style={{
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <h1 style={{ fontSize: '20px', color: '#4caf50' }}>Order Confirmation</h1>
          <img
            src={typeof logo === 'string' ? logo : logo?.thumbnailURL || ''}
            alt={typeof logo === 'string' ? logo : logo?.alt || ''}
            style={{ display: 'block', marginLeft: 'auto', width: '60px', height: '60px' }}
          />
        </div>
        {children}
      </div>
    </div>
  )
}
