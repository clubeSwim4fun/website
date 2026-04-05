'use client'

import { cn } from '@/utilities/ui'
import { Upload } from 'lucide-react'
import { useRef, useState } from 'react'

type Props = {
  label: string
  value: File[]
  onChange: (files: File[]) => void
  error?: string
  hint?: string
}

export function UploadZone({ label, value, onChange, error, hint }: Props) {
  const [hover, setHover] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const file = value?.[0]

  return (
    <div className="flex flex-col gap-1.5">
      <div
        onClick={() => inputRef.current?.click()}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 cursor-pointer transition-all',
          hover ? 'border-[#3bb8d8] bg-[#e0f5fb]' : 'border-border bg-[#f0f8fc]',
          error && 'border-[#e85d4a]',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*,application/pdf"
          capture={undefined}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (!f) return
            // Normalise missing MIME type (common on Android camera captures)
            const mime =
              f.type ||
              (f.name.match(/\.(jpe?g)$/i)
                ? 'image/jpeg'
                : f.name.match(/\.png$/i)
                  ? 'image/png'
                  : f.name.match(/\.pdf$/i)
                    ? 'application/pdf'
                    : 'application/octet-stream')
            const normalised = mime === f.type ? f : new File([f], f.name, { type: mime })
            onChange([normalised])
          }}
        />
        <Upload className="w-6 h-6 text-[hsl(var(--blue-swim))]" />
        <p className="font-semibold text-sm text-center text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{hint ?? 'PDF or image · up to 2 MB'}</p>
        {file && <p className="text-xs text-[#2ecc71] font-medium">✓ {file.name}</p>}
      </div>
      {error && <p className="text-xs text-[#e85d4a]">{error}</p>}
    </div>
  )
}
