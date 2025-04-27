import { getLogo } from '@/helpers/emailHelper'
import React from 'react'

type Args = {
  title: string
  children?: React.ReactNode
  hideLogo?: boolean
}

export async function TemplateEmail({ children, title, hideLogo }: Args) {
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
          <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#2D6CB3' }}>{title}</h1>
          {!hideLogo && (
            <img
              src={'cid:logo'}
              alt={typeof logo === 'string' ? logo : logo?.alt || ''}
              style={{ display: 'block', marginLeft: 'auto', width: '60px', height: '60px' }}
            />
          )}
        </div>
        {typeof children === 'string' ? (
          <main dangerouslySetInnerHTML={{ __html: children }} />
        ) : (
          children
        )}
      </div>
    </div>
  )
}
