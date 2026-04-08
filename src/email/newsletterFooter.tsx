import React from 'react'
import { getCachedGlobal } from '@/utilities/getGlobals'
import type { Footer, GeneralConfig } from '@/payload-types'

type Props = {
  trackingToken: string
}

export async function NewsletterFooter({ trackingToken }: Props) {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? ''

  const [footer, generalConfigs] = await Promise.all([
    getCachedGlobal('footer', 0, 'pt')() as Promise<Footer>,
    getCachedGlobal('generalConfigs', 0, 'pt')() as Promise<GeneralConfig>,
  ])

  const { instagram, x, facebook, youtube } = footer?.socialMedia ?? {}

  const socialLinks = [
    {
      url: instagram,
      label: 'Instagram',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/240px-Instagram_icon.png',
    },
    {
      url: x,
      label: 'X (Twitter)',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/X_logo_2023_%28white%29.png/240px-X_logo_2023_%28white%29.png',
      iconBg: '#000',
    },
    {
      url: facebook,
      label: 'Facebook',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/240px-Facebook_Logo_%282019%29.png',
    },
    {
      url: youtube,
      label: 'YouTube',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/240px-YouTube_full-color_icon_%282017%29.svg.png',
    },
  ].filter((s) => !!s.url)
  const contactEmail = generalConfigs?.newsletter?.footerEmail ?? footer?.contact?.email
  const signoff = generalConfigs?.newsletter?.footerSignoff
  const unsubscribeLabel = generalConfigs?.newsletter?.unsubscribeLabel ?? 'Cancelar subscrição'
  const manageLabel = generalConfigs?.newsletter?.manageLabel ?? 'Gerir a sua subscrição'

  const isPreview = trackingToken === 'preview'
  const unsubscribeUrl = isPreview
    ? '#'
    : `${baseUrl}/api/newsletter/unsubscribe?token=${trackingToken}`
  const manageUrl = `${baseUrl}/pt/my-profile#communications`

  return (
    <div style={{ marginTop: '32px' }}>
      {signoff && (
        <p
          style={{ fontSize: '15px', color: '#333', marginBottom: '24px' }}
          dangerouslySetInnerHTML={{ __html: signoff }}
        />
      )}

      {/* Logo reused from header */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <img
          src="cid:logo"
          alt="Logo"
          style={{ maxWidth: '120px', height: 'auto', display: 'inline-block' }}
        />
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #ccc', margin: '20px 0' }} />

      {/* Social icons */}
      {socialLinks.length > 0 && (
        <div style={{ textAlign: 'center', margin: '16px 0' }}>
          {socialLinks.map((s) => (
            <a
              key={s.label}
              href={s.url!}
              style={{ textDecoration: 'none', display: 'inline-block', margin: '0 6px' }}
            >
              <img
                src={s.icon}
                alt={s.label}
                width="32"
                height="32"
                style={{
                  display: 'inline-block',
                  borderRadius: '8px',
                  background: s.iconBg ?? 'transparent',
                }}
              />
            </a>
          ))}
        </div>
      )}

      <hr style={{ border: 'none', borderTop: '1px solid #ccc', margin: '20px 0' }} />

      {/* Unsubscribe + manage links */}
      <div style={{ textAlign: 'center', fontSize: '13px', color: '#888', marginBottom: '8px' }}>
        <a href={unsubscribeUrl} style={{ color: '#2D6CB3', textDecoration: 'none' }}>
          {unsubscribeLabel}
        </a>
        {' | '}
        <a href={manageUrl} style={{ color: '#2D6CB3', textDecoration: 'none' }}>
          {manageLabel}
        </a>
      </div>

      {contactEmail && (
        <div style={{ textAlign: 'center', fontSize: '13px', color: '#888' }}>
          <a href={`mailto:${contactEmail}`} style={{ color: '#888', textDecoration: 'none' }}>
            {contactEmail}
          </a>
        </div>
      )}
    </div>
  )
}
