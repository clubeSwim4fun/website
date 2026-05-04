'use client'
import React, { useRef, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { submitStory } from '@/actions/submitStory'
import { useToast } from '@/hooks/use-toast'
import { X, ImagePlus, Loader2 } from 'lucide-react'

interface SubmitStoryDialogProps {
  triggerClassName?: string
  triggerLabel: string
}

export const SubmitStoryDialog: React.FC<SubmitStoryDialogProps> = ({
  triggerClassName,
  triggerLabel,
}) => {
  const t = useTranslations('Posts')
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 2 - images.length)
    const newImages = [...images, ...files].slice(0, 2)
    setImages(newImages)
    setPreviews(newImages.map((f) => URL.createObjectURL(f)))
  }

  const removeImage = (index: number) => {
    const next = images.filter((_, i) => i !== index)
    setImages(next)
    setPreviews(next.map((f) => URL.createObjectURL(f)))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(formRef.current!)
    images.forEach((img) => fd.append('images', img))

    startTransition(async () => {
      const result = await submitStory(fd)
      if (result.success) {
        toast({ title: result.message })
        setOpen(false)
        formRef.current?.reset()
        setImages([])
        setPreviews([])
      } else {
        toast({ title: result.message, variant: 'destructive' })
      }
    })
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className={triggerClassName}>
        {triggerLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--swim-border))]">
              <h2 className="font-outfit text-base font-bold text-[hsl(var(--deep))]">
                {t('shareYourStory')}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[hsl(var(--foam))] transition-colors"
              >
                <X className="w-4 h-4 stroke-[hsl(var(--ink-mid))]" />
              </button>
            </div>

            {/* Form */}
            <form ref={formRef} onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[hsl(var(--ink-mid))] uppercase tracking-wider">
                  {t('storyTitle')}
                </label>
                <input
                  name="title"
                  required
                  maxLength={120}
                  placeholder={t('storyTitlePlaceholder')}
                  className="border-1.5 border-[hsl(var(--swim-border))] rounded-lg px-3.5 py-2.5 text-sm text-[hsl(var(--deep))] outline-none focus:border-[hsl(var(--mid))] transition-colors"
                />
              </div>

              {/* Images */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[hsl(var(--ink-mid))] uppercase tracking-wider">
                  {t('storyImages')} <span className="font-normal opacity-60">(máx. 2)</span>
                </label>
                <div className="flex gap-2.5 flex-wrap">
                  {previews.map((src, i) => (
                    <div
                      key={i}
                      className="relative w-20 h-20 rounded-lg overflow-hidden border-1.5 border-[hsl(var(--swim-border))]"
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
                      >
                        <X className="w-2.5 h-2.5 stroke-white" />
                      </button>
                    </div>
                  ))}
                  {images.length < 2 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 rounded-lg border-1.5 border-dashed border-[hsl(var(--swim-border))] flex flex-col items-center justify-center gap-1 text-[hsl(var(--ink-light))] hover:border-[hsl(var(--mid))] hover:text-[hsl(var(--mid))] transition-colors"
                    >
                      <ImagePlus className="w-5 h-5" strokeWidth={1.5} />
                      <span className="text-[10px] font-semibold">Adicionar</span>
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              {/* Text */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[hsl(var(--ink-mid))] uppercase tracking-wider">
                  {t('storyText')}
                </label>
                <textarea
                  name="text"
                  required
                  rows={6}
                  placeholder={t('storyTextPlaceholder')}
                  className="border-1.5 border-[hsl(var(--swim-border))] rounded-lg px-3.5 py-2.5 text-sm text-[hsl(var(--deep))] outline-none focus:border-[hsl(var(--mid))] transition-colors resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isPending}
                className="bg-gradient-to-br from-[hsl(var(--deep))] to-[hsl(var(--mid))] text-white rounded-lg py-2.75 font-outfit text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {t('sendStory')}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
