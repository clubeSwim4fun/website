'use client'

import React, { useRef, useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import type { TeamBlock as TeamBlockProps } from '@/payload-types'
import { Media } from '@/components/Media'
import RichTextColor from '@/components/RichText/RichTextColor'

// ── Social icons ─────────────────────────────────────────────────────────────
const SocialIcon = ({ platform }: { platform: string }) => {
  const props = {
    viewBox: '0 0 24 24',
    width: 13,
    height: 13,
    stroke: 'currentColor',
    fill: 'none',
    strokeWidth: 2,
  }
  switch (platform) {
    case 'instagram':
      return (
        <svg {...props}>
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg {...props}>
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      )
    case 'twitter':
      return (
        <svg {...props}>
          <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
        </svg>
      )
    case 'facebook':
      return (
        <svg {...props}>
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      )
    case 'youtube':
      return (
        <svg {...props}>
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
          <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
        </svg>
      )
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      )
  }
}

// ── Member card ───────────────────────────────────────────────────────────────
type Member = NonNullable<NonNullable<TeamBlockProps['sections']>[number]['members']>[number]

// Collapsed height = 3 lines × 1.6 line-height × 13px font = ~62px
const COLLAPSED_HEIGHT = 62

const MemberCard: React.FC<{ member: Member }> = ({ member }) => {
  const [expanded, setExpanded] = useState(false)
  const [fullHeight, setFullHeight] = useState(0)
  const innerRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('TeamBlock')

  const hasPhoto = member.photo && typeof member.photo === 'object'
  const hasSocials = member.socialLinks && member.socialLinks.length > 0
  const hasRichText = member.richText && (member.richText as any)?.root?.children?.length > 0

  useEffect(() => {
    if (innerRef.current) setFullHeight(innerRef.current.scrollHeight)
  }, [member.richText])

  const needsToggle = hasRichText && fullHeight > COLLAPSED_HEIGHT

  return (
    <div className="bg-white border-2 border-swim-border rounded-[14px] overflow-hidden transition-all duration-200 hover:border-light hover:shadow-[0_12px_40px_rgba(10,74,110,.18)] hover:-translate-y-0.5">
      {/* Photo */}
      <div className="h-[220px] overflow-hidden relative bg-pale">
        {hasPhoto ? (
          <Media
            resource={member.photo as any}
            imgClassName="w-full h-full object-cover object-top"
            htmlElement={null}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-pale">
            <svg
              viewBox="0 0 24 24"
              width="48"
              height="48"
              stroke="#8aaabb"
              fill="none"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>
        )}
        {member.badge && (
          <div className="absolute top-3.5 left-3.5 bg-deep/85 text-white rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.6px] uppercase backdrop-blur-sm">
            {member.badge}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-[18px]">
        <p className="font-syne text-[15px] font-bold text-deep mb-3 leading-snug">{member.name}</p>

        {/* Rich text with animated height */}
        {hasRichText && (
          <div
            style={{
              maxHeight: expanded || !needsToggle ? fullHeight || 9999 : COLLAPSED_HEIGHT,
              overflow: 'hidden',
              transition: 'max-height 0.35s ease',
            }}
          >
            {/*
              .team-card-bio scopes font overrides to this card only,
              without touching RichTextColor styles used elsewhere.
            */}
            <div ref={innerRef} className="team-card-bio">
              <RichTextColor data={member.richText as any} enableGutter={false} />
            </div>
          </div>
        )}

        {/* Read more/less */}
        {needsToggle && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-mid text-[12px] font-semibold mt-2 bg-transparent border-none cursor-pointer p-0 transition-[gap] duration-150 hover:gap-1.5"
          >
            {expanded ? t('readLess') : t('readMore')}
            <svg
              viewBox="0 0 24 24"
              width="12"
              height="12"
              stroke="currentColor"
              fill="none"
              strokeWidth="2.5"
              className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}

        {/* Socials */}
        {hasSocials && (
          <div className="flex gap-2 mt-3.5 pt-3.5 border-t border-swim-border">
            {member.socialLinks!.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.platform}
                className="w-[30px] h-[30px] rounded-[7px] border-[1.5px] border-swim-border flex items-center justify-center text-ink-mid transition-all duration-150 hover:border-light hover:bg-pale hover:text-mid"
              >
                <SocialIcon platform={link.platform} />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Scoped richText overrides — only affects .team-card-bio descendants */}
      <style>{`
        .team-card-bio p,
        .team-card-bio li,
        .team-card-bio span {
          font-size: 13px !important;
          color: #3d5a70 !important;
          line-height: 1.6 !important;
          font-family: 'DM Sans', sans-serif !important;
        }
        .team-card-bio p { margin-bottom: 0.6em; }
        .team-card-bio p:last-child { margin-bottom: 0; }
        .team-card-bio h1, .team-card-bio h2,
        .team-card-bio h3, .team-card-bio h4 {
          font-family: 'Syne', sans-serif !important;
          color: #0a4a6e !important;
          font-size: 14px !important;
          font-weight: 700 !important;
          margin-bottom: 0.4em;
        }
        .team-card-bio a { color: #0e7ea8 !important; }
      `}</style>
    </div>
  )
}

// ── Block ─────────────────────────────────────────────────────────────────────
export const TeamBlockComponent: React.FC<TeamBlockProps> = ({ subtitle, richText, sections }) => {
  return (
    <div className="container">
      {(subtitle || richText) && (
        <div className="mb-12">
          {subtitle && (
            <div className="inline-flex items-center gap-[7px] text-[11px] font-bold uppercase tracking-[1.2px] text-mid mb-3.5 before:content-[''] before:w-6 before:h-0.5 before:bg-mid before:rounded-full">
              {subtitle}
            </div>
          )}
          {richText && <RichTextColor data={richText as any} enableGutter={false} enableProse />}
        </div>
      )}

      {sections?.map((section, si) => (
        <div key={si} className="mb-12 last:mb-0">
          <div className="flex items-center gap-2.5 font-syne text-[12px] font-bold uppercase tracking-[1px] text-ink-light mb-5 pb-2.5 border-b-[1.5px] border-swim-border">
            {section.title}
            <span className="flex-1 h-px bg-swim-border" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
            {section.members?.map((member, mi) => <MemberCard key={mi} member={member} />)}
          </div>
        </div>
      ))}
    </div>
  )
}
