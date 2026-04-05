'use client'

import { cn } from '@/utilities/ui'
import { Upload, Loader2 } from 'lucide-react'
import { useRef, useState } from 'react'

type Props = {
  label: string
  value: File[]
  onChange: (files: File[]) => void
  error?: string
  hint?: string
}

/**
 * Eagerly reads the file into memory as soon as it's selected.
 * This is critical on mobile where cloud files (Drive, iCloud) may become
 * inaccessible after the file picker closes, causing arrayBuffer() to fail later.
 */
async function materializeFile(raw: File): Promise<File> {
  // Normalise missing MIME type — common on Android camera captures
  const mime =
    raw.type ||
    (raw.name.match(/\.(jpe?g)$/i)
      ? 'image/jpeg'
      : raw.name.match(/\.png$/i)
        ? 'image/png'
        : raw.name.match(/\.pdf$/i)
          ? 'application/pdf'
          : 'application/octet-stream')

  // Read the full bytes now, while the file handle is still valid
  const buffer = await raw.arrayBuffer()
  return new File([buffer], raw.name, { type: mime })
}

export function UploadZone({ label, value, onChange, error, hint }: Props) {
  const [hover, setHover] = useState(false)
  const [loading, setLoading] = useState(false)
  const [readError, setReadError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const file = value?.[0]

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.files?.[0]
    if (!raw) return

    setLoading(true)
    setReadError(null)
    try {
      const materialised = await materializeFile(raw)
      if (materialised.size === 0) {
        setReadError('Could not read the file. Please try selecting it again.')
        return
      }
      onChange([materialised])
    } catch {
      setReadError('Failed to load the file. Try downloading it locally first, then upload.')
    } finally {
      setLoading(false)
      // Reset input so the same file can be re-selected if needed
      e.target.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div
        onClick={() => !loading && inputRef.current?.click()}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 cursor-pointer transition-all',
          hover && !loading ? 'border-[#3bb8d8] bg-[#e0f5fb]' : 'border-border bg-[#f0f8fc]',
          error && 'border-[#e85d4a]',
          loading && 'opacity-60 cursor-wait',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*,application/pdf"
          onChange={handleChange}
        />
        {loading ? (
          <Loader2 className="w-6 h-6 text-[hsl(var(--blue-swim))] animate-spin" />
        ) : (
          <Upload className="w-6 h-6 text-[hsl(var(--blue-swim))]" />
        )}
        <p className="font-semibold text-sm text-center text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{hint ?? 'PDF or image · up to 2 MB'}</p>
        {loading && <p className="text-xs text-muted-foreground">Reading file…</p>}
        {file && !loading && <p className="text-xs text-[#2ecc71] font-medium">✓ {file.name}</p>}
      </div>
      {(error || readError) && <p className="text-xs text-[#e85d4a]">{readError ?? error}</p>}
    </div>
  )
}
