'use client'

import { cn } from '@/utilities/ui'

type Props = {
  ref?: React.Ref<HTMLDivElement>
  icon: React.ReactNode
  title: string
  subtitle: string
  children: React.ReactNode
}

export function StepCard({ ref, icon, title, subtitle, children }: Props) {
  return (
    <div ref={ref} className="bg-white rounded-xl border border-border shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-5 border-b border-border">
        <div className="w-10 h-10 rounded-full bg-[#e0f5fb] flex items-center justify-center shrink-0 text-[hsl(var(--blue-swim))]">
          {icon}
        </div>
        <div>
          <p
            className="font-bold text-base text-foreground"
            style={{ fontFamily: 'var(--font-syne, sans-serif)' }}
          >
            {title}
          </p>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {/* Body */}
      <div className="p-6">{children}</div>
    </div>
  )
}

type FieldRowProps = { children: React.ReactNode; className?: string }
export function FieldRow({ children, className }: FieldRowProps) {
  return <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', className)}>{children}</div>
}

type FieldGroupProps = { children: React.ReactNode; className?: string }
export function FieldGroup({ children, className }: FieldGroupProps) {
  return <div className={cn('flex flex-col gap-1.5', className)}>{children}</div>
}

type FieldLabelProps = { htmlFor?: string; required?: boolean; children: React.ReactNode }
export function FieldLabel({ htmlFor, required, children }: FieldLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[11px] font-semibold uppercase tracking-wider text-foreground/70"
    >
      {children}
      {required && <span className="text-[#e85d4a] ml-0.5">*</span>}
    </label>
  )
}

type FieldErrorProps = { message?: string }
export function FieldError({ message }: FieldErrorProps) {
  if (!message) return null
  return <p className="text-xs text-[#e85d4a] mt-0.5">{message}</p>
}

type HintProps = { children: React.ReactNode }
export function Hint({ children }: HintProps) {
  return <p className="text-xs text-muted-foreground mt-0.5">{children}</p>
}
