import type { Control, FieldErrorsImpl } from 'react-hook-form'

import { Label } from '@/components/ui/label'

import React from 'react'
import { Controller } from 'react-hook-form'

import { Error } from '../Error'
import { Width } from '../Width'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { DateField } from '@/payload-types'
import { pt } from 'react-day-picker/locale'

export const DatePicker: React.FC<
  DateField & {
    control: Control
    errors: Partial<FieldErrorsImpl>
    disabled: boolean
  }
> = ({ name, control, errors, label, required, placeholder, disabled }) => {
  return (
    <Width width={'100%'}>
      <Label className="" htmlFor={name}>
        {label}

        {required && (
          <span className="required">
            * <span className="sr-only">(required)</span>
          </span>
        )}
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field: { value, onChange } }) => (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                disabled={disabled}
                variant={'outline'}
                className={cn(
                  'w-[240px] pl-3 text-left font-normal',
                  !value && 'text-muted-foreground',
                )}
              >
                {value ? (
                  format(value, 'PPP', {
                    locale: pt,
                  })
                ) : (
                  <span>{placeholder}</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value}
                onSelect={onChange}
                endMonth={new Date(new Date().getFullYear(), new Date().getMonth())}
                disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                locale={pt}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        )}
      />
      {errors[name] && <Error />}
    </Width>
  )
}
