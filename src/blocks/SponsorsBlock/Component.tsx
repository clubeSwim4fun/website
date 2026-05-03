'use client'

import React, { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { CMSLink } from '@/components/Link'
import type { SponsorsBlock } from '@/payload-types'

type SponsorItem = {
  id: string
  name: string
  url: string
  logo: { url: string; alt?: string } | null
}

export const SponsorsBlockComponent: React.FC<SponsorsBlock> = ({ ctaLink }) => {
  const locale = useLocale()
  const [sponsors, setSponsors] = useState<SponsorItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/sponsors?limit=100&depth=1')
      .then((r) => r.json())
      .then((data) => {
        const docs: SponsorItem[] = (data?.docs ?? []).map((doc: any) => ({
          id: doc.id,
          name: doc.name,
          url: doc.url,
          logo:
            doc.logo && typeof doc.logo === 'object'
              ? { url: doc.logo.url, alt: doc.logo.alt }
              : null,
        }))
        setSponsors(docs)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  if (!loaded || sponsors.length === 0) return null

  const isStatic = sponsors.length < 2
  // Each card is 220px + 20px gap = 240px. One "set" must exceed the widest viewport (2560px).
  // We fill one set with enough repetitions, then duplicate it for the seamless loop.
  const CARD_WIDTH = 240 // 220px card + 20px gap
  const MIN_SET_WIDTH = 2600
  const repsPerSet = isStatic ? 1 : Math.ceil(MIN_SET_WIDTH / (sponsors.length * CARD_WIDTH))
  const oneSet = Array.from({ length: repsPerSet }, () => sponsors).flat()
  // Render two identical sets side by side; animate translateX(-50%) to loop seamlessly
  const repeated = isStatic ? sponsors : [...oneSet, ...oneSet]

  const labelText = locale === 'en' ? 'Partners' : 'Parceiros'
  const titleText = locale === 'en' ? 'Our sponsors' : 'Os nossos patrocinadores'
  const ctaLabel = locale === 'en' ? 'Become a sponsor' : 'Tornar-se patrocinador'

  const hasCta = ctaLink?.type && (ctaLink.url || ctaLink.reference || ctaLink.subscriptionGroup)

  return (
    <section style={styles.section}>
      <div style={styles.header}>
        <div style={styles.label} className="sp-label">
          {labelText}
        </div>
        <div style={styles.title}>{titleText}</div>
      </div>

      <div style={styles.marqueeWrap} className="sp-marquee-wrap">
        <div
          style={isStatic ? styles.staticTrack : styles.marqueeTrack}
          className={isStatic ? undefined : 'sp-marquee-track'}
        >
          {repeated.map((sponsor, i) => (
            <SponsorCard key={`${sponsor.id}-${i}`} sponsor={sponsor} />
          ))}
        </div>
      </div>

      {hasCta && (
        <div style={styles.footer}>
          <CMSLink
            {...ctaLink}
            appearance="inline"
            className="sp-cta-link"
            label={ctaLink.label || ctaLabel}
          >
            <svg
              viewBox="0 0 24 24"
              width="13"
              height="13"
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
              style={{ flexShrink: 0 }}
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </CMSLink>
        </div>
      )}

      <style>{`
        @keyframes sp-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .sp-marquee-track {
          animation: sp-marquee 45s linear infinite;
        }
        .sp-marquee-wrap:hover .sp-marquee-track {
          animation-play-state: paused;
        }
        .sp-marquee-wrap::before,
        .sp-marquee-wrap::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          width: 120px;
          z-index: 2;
          pointer-events: none;
        }
        .sp-marquee-wrap::before {
          left: 0;
          background: linear-gradient(to right, #ffffff, transparent);
        }
        .sp-marquee-wrap::after {
          right: 0;
          background: linear-gradient(to left, #ffffff, transparent);
        }
        .sp-card {
          width: 220px;
          height: 120px;
          background: #fdf8f3;
          border: 2px solid #d4eaf2;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          cursor: pointer;
          text-decoration: none;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
          transition: border-color .25s, transform .25s;
        }
        .sp-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: #e0f5fb;
          opacity: 0;
          transition: opacity .25s;
          border-radius: 14px;
        }
        .sp-card:hover { border-color: #0e7ea8; transform: translateY(-4px); }
        .sp-card:hover::after { opacity: 1; }
        .sp-card:hover .sp-logo { filter: grayscale(0%); opacity: 1; }
        .sp-card:hover .sp-arrow { opacity: 1; transform: translate(0, 0); }
        .sp-logo {
          max-width: 150px; max-height: 64px;
          object-fit: contain;
          filter: grayscale(15%);
          opacity: .82;
          transition: filter .25s, opacity .25s;
          position: relative; z-index: 1;
        }
        .sp-arrow {
          position: absolute; bottom: 10px; right: 12px;
          opacity: 0;
          transform: translate(4px, 4px);
          transition: opacity .25s, transform .25s;
          z-index: 2;
        }
        .sp-cta-link {
          display: inline-flex !important;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 500;
          color: #8aaabb !important;
          text-decoration: none !important;
          font-family: 'Outfit', sans-serif;
          border: 1.5px solid #d4eaf2;
          border-radius: 99px;
          padding: 8px 18px;
          background: #f0fafd;
          transition: all .2s;
        }
        .sp-cta-link:hover {
          border-color: #0e7ea8 !important;
          color: #0e7ea8 !important;
          background: #e0f5fb !important;
        }
        .sp-label::before,
        .sp-label::after {
          content: '';
          width: 28px; height: 2px;
          background: #0e7ea8;
          border-radius: 99px;
          display: inline-block;
        }
      `}</style>
    </section>
  )
}

function SponsorCard({ sponsor }: { sponsor: SponsorItem }) {
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <a
      href={sponsor.url}
      target="_blank"
      rel="noopener noreferrer"
      title={sponsor.name}
      aria-label={sponsor.name}
      className="sp-card"
    >
      {sponsor.logo?.url && !imgFailed ? (
        <img
          src={sponsor.logo.url}
          alt={sponsor.logo.alt ?? sponsor.name}
          className="sp-logo"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span style={styles.fallbackText}>{sponsor.name}</span>
      )}
      <div className="sp-arrow">
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          stroke="#0e7ea8"
          fill="none"
          strokeWidth="2.5"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </div>
    </a>
  )
}

const styles: Record<string, React.CSSProperties> = {
  section: {
    background: '#ffffff',
    padding: '56px 0',
    overflow: 'hidden',
  },
  header: {
    textAlign: 'center',
    marginBottom: 40,
    padding: '0 48px',
  },
  label: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '1.4px',
    color: '#0e7ea8',
    marginBottom: 10,
    fontFamily: "'Outfit', sans-serif",
  },
  title: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 'clamp(20px, 5vw, 28px)',
    fontWeight: 800,
    color: '#0a4a6e',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
  },
  marqueeWrap: {
    position: 'relative',
    padding: '8px 0',
  },
  marqueeTrack: {
    display: 'flex',
    gap: 20,
    width: 'max-content',
  },
  staticTrack: {
    display: 'flex',
    gap: 20,
    justifyContent: 'center',
    flexWrap: 'wrap',
    padding: '0 48px',
  },
  footer: {
    textAlign: 'center',
    marginTop: 36,
    padding: '0 48px',
  },
  fallbackText: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 800,
    fontSize: 16,
    color: '#0a4a6e',
    position: 'relative',
    zIndex: 1,
  },
}
