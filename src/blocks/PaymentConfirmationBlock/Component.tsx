import React from 'react'
import type { PaymentConfirmationBlock as Props } from '@/payload-types'
import { CheckCircle2 } from 'lucide-react'
import RichText from '@/components/RichText'
import { CtaButton } from '@/components/CtaButton'

export const PaymentConfirmationBlockComponent: React.FC<Props> = ({ title, message, links }) => (
  <div className="bg-white rounded-2xl border border-swim-border shadow-sm overflow-hidden border-t-4 border-t-mid">
    <div className="flex flex-col items-center text-center px-8 py-12">
      {/* Icon */}
      <div className="w-18 h-18 rounded-full bg-pale flex items-center justify-center mb-6">
        <CheckCircle2 size={40} className="text-mid" strokeWidth={1.5} />
      </div>

      {/* Title */}
      {title && <h2 className="font-syne font-extrabold text-deep text-2xl mb-3">{title}</h2>}

      {/* Message */}
      {message && (
        <div className="text-ink-mid max-w-md">
          <RichText data={message} enableGutter={false} enableProse />
        </div>
      )}

      {/* Links */}
      {!!links?.length && (
        <div className="flex flex-col sm:flex-row gap-3 mt-8 w-full max-w-sm">
          {links.map((item, i) => (
            <CtaButton
              key={item.id ?? i}
              link={item.link}
              context="light"
              className="flex-1 justify-center"
            />
          ))}
        </div>
      )}
    </div>
  </div>
)
