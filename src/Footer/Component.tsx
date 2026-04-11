import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'

import type { Footer } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { TypedLocale } from 'payload'
import { LanguageSwitch } from '@/components/LanguageSwitch'
import WhatsappIcon from '@/components/Icons/whatsapp'
import InstagramIcon from '@/components/Icons/instagram'
import XIcon from '@/components/Icons/x'
import FacebookIcon from '@/components/Icons/facebook'
import YoutubeIcon from '@/components/Icons/youtube'

const PhoneIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-3.5 h-3.5 flex-shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

const MailIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-3.5 h-3.5 flex-shrink-0"
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

  const { contact, company, socialMedia, navCol1, navCol2 } = footerData || {}
  const navItems = navCol1?.navItems || []
  const navItems2 = navCol2?.navItems || []

  const socialLinks = [
    {
      href: socialMedia?.instagram,
      icon: <InstagramIcon className="w-4 h-4" />,
      label: 'Instagram',
    },
    { href: socialMedia?.x, icon: <XIcon className="w-4 h-4" />, label: 'X' },
    { href: socialMedia?.facebook, icon: <FacebookIcon className="w-4 h-4" />, label: 'Facebook' },
    { href: socialMedia?.youtube, icon: <YoutubeIcon className="w-4 h-4" />, label: 'YouTube' },
  ].filter((s) => !!s.href)

  return (
    <footer className="bg-ink text-white mt-auto mb-[57px] md:mb-0">
      <div className="max-w-[86rem] mx-auto px-6 md:px-12 pt-14 pb-8">
        {/* ── Top grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-12">
          {/* Brand column */}
          <div>
            <div className="font-syne font-extrabold text-xl text-white mb-3.5">
              Swim<span className="text-light">4</span>fun
            </div>
            <p className="text-[13px] text-white/55 leading-relaxed max-w-[280px] mb-6">
              Descubra a paixão pela natação em águas abertas com o Clube Swim4Fun. Competimos
              juntos, crescemos juntos.
            </p>
            {socialLinks.length > 0 && (
              <div className="flex gap-2.5">
                {socialLinks.map(({ href, icon, label }) => (
                  <a
                    key={label}
                    href={href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded-lg border border-white/15 flex items-center justify-center hover:bg-white/10 hover:border-white/30 transition-colors"
                  >
                    {icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Nav column 1 */}
          {navItems.length > 0 && (
            <div>
              <p className="font-syne text-[11px] font-bold uppercase tracking-[0.8px] text-white/40 mb-4">
                {navCol1?.label}
              </p>
              <div className="flex flex-col gap-2.5">
                {navItems.map(({ link }, i) => (
                  <CMSLink
                    key={i}
                    {...link}
                    className="text-[13px] text-white/65 hover:text-white transition-colors no-underline"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Nav column 2 */}
          {navItems2.length > 0 && (
            <div>
              <p className="font-syne text-[11px] font-bold uppercase tracking-[0.8px] text-white/40 mb-4">
                {navCol2?.label}
              </p>
              <div className="flex flex-col gap-2.5">
                {navItems2.map(({ link }, i) => (
                  <CMSLink
                    key={i}
                    {...link}
                    className="text-[13px] text-white/65 hover:text-white transition-colors no-underline"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Contact column */}
          {contact && (contact.phone || contact.whatsapp || contact.email) && (
            <div>
              <p className="font-syne text-[11px] font-bold uppercase tracking-[0.8px] text-white/40 mb-4">
                {contact.label}
              </p>
              <div className="flex flex-col gap-2.5">
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-2 text-[13px] text-white/65 hover:text-white transition-colors no-underline"
                  >
                    <PhoneIcon />
                    {contact.phone}
                  </a>
                )}
                {contact.whatsapp && (
                  <a
                    href={`https://api.whatsapp.com/send?phone=${contact.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[13px] text-white/65 hover:text-white transition-colors no-underline"
                  >
                    <WhatsappIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    WhatsApp
                  </a>
                )}
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-2 text-[13px] text-white/65 hover:text-white transition-colors no-underline"
                  >
                    <MailIcon />
                    {contact.email}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-white/[0.08] pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-[12px] text-white/35">
            {company?.copyright ||
              `© ${new Date().getFullYear()} Clube Swim4Fun. Todos os direitos reservados.`}
          </p>
          <LanguageSwitch />
        </div>
      </div>
    </footer>
  )
}
