'use client'

import * as React from 'react'
import { format, parse, isValid } from 'date-fns'
import { pt, enUS } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { useLocale } from 'next-intl'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { cn } from '@/utilities/ui'

type Props = {
  id?: string
  /** ISO string yyyy-MM-dd */
  value: string
  onChange: (iso: string) => void
  className?: string
  placeholder?: string
}

export function DatePickerInput({ id, value, onChange, className, placeholder }: Props) {
  const locale = useLocale()
  const dateFnsLocale = locale === 'pt' ? pt : enUS

  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(() =>
    value && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? format(new Date(value + 'T00:00:00'), 'dd/MM/yyyy')
      : '',
  )

  // Keep input display in sync when value changes externally
  React.useEffect(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      setInputValue(format(new Date(value + 'T00:00:00'), 'dd/MM/yyyy'))
    } else if (!value) {
      setInputValue('')
    }
  }, [value])

  const selectedDate = React.useMemo(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const d = new Date(value + 'T00:00:00')
      return isValid(d) ? d : undefined
    }
    return undefined
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Apply dd/mm/yyyy mask
    const digits = e.target.value.replace(/\D/g, '').slice(0, 8)
    let masked = digits
    if (digits.length > 4)
      masked = digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4)
    else if (digits.length > 2) masked = digits.slice(0, 2) + '/' + digits.slice(2)
    setInputValue(masked)

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(masked)) {
      const parsed = parse(masked, 'dd/MM/yyyy', new Date())
      if (isValid(parsed)) {
        onChange(format(parsed, 'yyyy-MM-dd'))
      }
    } else {
      onChange('')
    }
  }

  const handleDaySelect = (day: Date | undefined) => {
    if (day) {
      onChange(format(day, 'yyyy-MM-dd'))
      setInputValue(format(day, 'dd/MM/yyyy'))
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative">
        <Input
          id={id}
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder ?? 'dd/mm/aaaa'}
          inputMode="numeric"
          className={cn('pr-10', className)}
          onFocus={() => setOpen(false)}
        />
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Abrir calendário"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            <CalendarIcon className="h-4 w-4" />
          </button>
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDaySelect}
          defaultMonth={selectedDate ?? new Date(new Date().getFullYear() - 25, 0)}
          endMonth={new Date()}
          locale={dateFnsLocale}
        />
      </PopoverContent>
    </Popover>
  )
}
