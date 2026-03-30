import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Footer } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { TypedLocale } from 'payload'
import { LanguageSwitch } from '@/components/LanguageSwitch'
import WhatsappIcon from '@/components/Icons/whatsapp'
import InstagramIcon from '@/components/Icons/instagram'
import XIcon from '@/components/Icons/x'
import FacebookIcon from '@/components/Icons/facebook'
import YoutubeIcon from '@/components/Icons/youtube'

// Phone SVG icon (inline, minimal)
const PhoneIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

// Email SVG icon (inline, minimal)
const MailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

export async function Footer({ locale }: { locale: TypedLocale }) {
  const footerData: Footer = (await getCachedGlobal('footer', 1, locale)()) as Footer

  const { contact, company, socialMedia } = footerData || {}
  const showContactSection =
    contact?.label && (contact?.email || contact?.phone || contact?.whatsapp)
  const showSocialMedia =
    socialMedia?.label &&
    (socialMedia.instagram || socialMedia.x || socialMedia.facebook || socialMedia.youtube)

  const navItems = company?.navItems || []

  const socialLinks = [
    {
      href: socialMedia?.instagram,
      icon: <InstagramIcon className="w-6 h-6" />,
      label: 'Instagram',
    },
    {
      href: socialMedia?.x,
      icon: <XIcon className="w-6 h-6" />,
      label: 'X (Twitter)',
    },
    {
      href: socialMedia?.facebook,
      icon: <FacebookIcon className="w-6 h-6" />,
      label: 'Facebook',
    },
    {
      href: socialMedia?.youtube,
      icon: <YoutubeIcon className="w-6 h-6" />,
      label: 'YouTube',
    },
  ].filter((s) => !!s.href)

  return (
    <footer className="mt-auto border-t border-border bg-black text-white">
      {/* Main footer content */}
      <div className="container py-10">
        <div className="flex flex-col md:flex-row md:justify-between gap-10">
          {/* Left: Logo + Contact */}
          <div className="flex flex-col gap-6">
            <Link href="/">
              <Logo />
            </Link>

            {showContactSection && (
              <div>
                <h2 className="mb-4 font-bold text-lg uppercase tracking-wide">{contact?.label}</h2>
                <div className="flex flex-col sm:flex-row gap-8">
                  {contact?.phone && (
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-400 text-sm">{contact.phoneLabel}</span>
                      <a
                        href={`tel:${contact.phone}`}
                        className="flex items-center gap-2 text-blueSwim hover:opacity-80 transition-opacity"
                      >
                        <PhoneIcon />
                        <span>{contact.phone}</span>
                      </a>
                    </div>
                  )}

                  {contact?.whatsapp && (
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-400 text-sm">{contact.whatsappLabel}</span>
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://api.whatsapp.com/send?phone=${contact.whatsapp}`}
                        className="flex items-center gap-2 text-blueSwim hover:opacity-80 transition-opacity"
                      >
                        <WhatsappIcon className="w-6 h-6" />
                        <span>{contact.whatsapp}</span>
                      </a>
                    </div>
                  )}

                  {contact?.email && (
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-400 text-sm">{contact.emailLabel}</span>
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex items-center gap-2 text-blueSwim hover:opacity-80 transition-opacity"
                      >
                        <MailIcon />
                        <span>{contact.email}</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Social Media */}
          {showSocialMedia && (
            <div className="flex flex-col gap-4">
              <h2 className="font-bold text-lg uppercase tracking-wide">{socialMedia?.label}</h2>
              <div className="flex flex-row gap-3">
                {socialLinks.map(({ href, icon, label }) => (
                  <a
                    key={label}
                    href={href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            {navItems.map(({ link }, i) => (
              <CMSLink
                className="text-white text-sm hover:opacity-80 transition-opacity"
                key={i}
                {...link}
              />
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {company?.copyright && (
              <span className="text-gray-400 text-sm">{company.copyright}</span>
            )}
            <LanguageSwitch />
          </div>
        </div>
      </div>
    </footer>
  )
}
