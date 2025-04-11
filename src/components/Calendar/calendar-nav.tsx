'use client'

import { months } from './calendar-types' // TODO - Replace to get from constants or general translations
import { Button } from '@/components/ui/button'
import {
  calendarRef,
  generateDaysInMonth,
  goNext,
  goPrev,
  goToday,
  handleDayChange,
  handleMonthChange,
  handleYearChange,
  setView,
} from '@/utilities/calendar-utils'
import { Dispatch, SetStateAction, useState } from 'react'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  GalleryVertical,
  List,
  Table,
  Tally3,
} from 'lucide-react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/utilities/ui'
import { useLocale, useTranslations } from 'next-intl'

interface CalendarNavProps {
  calendarRef: calendarRef
  start: Date
  end: Date
  viewedDate: Date
  currentView: string
  setCurrentView: Dispatch<SetStateAction<string>>
  defaultTab: string
}

export default function CalendarNav({
  calendarRef,
  start,
  end,
  viewedDate,
  currentView,
  setCurrentView,
  defaultTab,
}: CalendarNavProps) {
  const selectedMonth = viewedDate.getMonth() + 1
  const selectedDay = viewedDate.getDate()
  const selectedYear = viewedDate.getFullYear()
  const t = useTranslations('Calendar')
  const locale = useLocale() as 'en' | 'pt'

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate()
  const dayOptions = generateDaysInMonth(daysInMonth)

  const [daySelectOpen, setDaySelectOpen] = useState(false)
  const [monthSelectOpen, setMonthSelectOpen] = useState(false)

  return (
    <div className="flex flex-wrap min-w-full justify-center gap-3 px-10 ">
      <div className="flex flex-row space-x-1">
        {/* Navigate to previous date interval */}
        <Button
          variant="ghost"
          size={'icon'}
          onClick={() => {
            goPrev(calendarRef)
          }}
        >
          <ChevronLeft className="md:h-5 md:w-5 h-3 w-3" />
        </Button>

        {/* Day Lookup */}

        {currentView == 'timeGridDay' && (
          <Popover open={daySelectOpen} onOpenChange={setDaySelectOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-20 justify-between text-xs font-semibold"
              >
                {selectedDay
                  ? dayOptions.find((day) => day.value === String(selectedDay))?.label
                  : 'Select day...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder={t('searchDay')} />
                <CommandList>
                  <CommandEmpty>{t('noDayFound')}</CommandEmpty>
                  <CommandGroup>
                    {dayOptions.map((day) => (
                      <CommandItem
                        key={day.value}
                        value={day.value}
                        onSelect={(currentValue) => {
                          handleDayChange(calendarRef, viewedDate, currentValue)
                          //   setValue(currentValue === selectedMonth ? "" : currentValue);
                          setDaySelectOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            String(selectedDay) === day.value ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        {day.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}

        {/* Month Lookup */}

        <Popover open={monthSelectOpen} onOpenChange={setMonthSelectOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="flex w-[105px] justify-between overflow-hidden p-2 text-xs font-semibold md:text-sm md:w-[120px]"
            >
              {selectedMonth
                ? months.find((month) => month.value === String(selectedMonth))?.[locale]?.label
                : t('selectMonth')}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder={t('searchMonth')} />
              <CommandList>
                <CommandEmpty>{t('noMonthFound')}</CommandEmpty>
                <CommandGroup>
                  {months.map((month) => (
                    <CommandItem
                      key={month.value}
                      value={month.value}
                      onSelect={(currentValue) => {
                        handleMonthChange(calendarRef, viewedDate, currentValue)
                        //   setValue(currentValue === selectedMonth ? "" : currentValue);
                        setMonthSelectOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          String(selectedMonth) === month.value ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      {month[locale].label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Year Lookup */}

        <Input
          className="w-[75px] md:w-[85px] text-xs md:text-sm font-semibold"
          type="number"
          value={selectedYear}
          onChange={(value) => handleYearChange(calendarRef, viewedDate, value)}
        />

        {/* Navigate to next date interval */}

        <Button
          variant="ghost"
          size={'icon'}
          onClick={() => {
            goNext(calendarRef)
          }}
        >
          <ChevronRight className="md:h-5 md:w-5 h-3 w-3" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        {/* Button to go to current date */}

        <Button
          className="w-[90px] text-xs md:text-sm"
          variant="outline"
          onClick={() => {
            goToday(calendarRef)
          }}
        >
          {currentView === 'timeGridDay'
            ? t('today')
            : currentView === 'timeGridWeek'
              ? t('thisWeek')
              : currentView === 'dayGridMonth' || currentView === 'listMonth'
                ? t('thisMonth')
                : null}
        </Button>

        {/* Change view with tabs */}

        <Tabs defaultValue={defaultTab}>
          <TabsList className="flex w-44 md:w-64">
            <TabsTrigger
              value="timeGridDay"
              onClick={() => setView(calendarRef, 'timeGridDay', setCurrentView)}
              className={`space-x-1 group ${currentView === 'timeGridDay' ? 'w-1/2' : 'w-1/4'}`}
            >
              <GalleryVertical className="h-5 w-5" />
              <p
                className={`text-xs md:text-sm group-hover:block duration-1000 transition-all opacity-0 group-hover:opacity-100 ${currentView === 'timeGridDay' ? 'block opacity-100' : 'hidden'}`}
              >
                {t('day')}
              </p>
            </TabsTrigger>
            <TabsTrigger
              value="timeGridWeek"
              onClick={() => setView(calendarRef, 'timeGridWeek', setCurrentView)}
              className={`space-x-1 group ${currentView === 'timeGridWeek' ? 'w-1/2' : 'w-1/4'}`}
            >
              <Tally3 className="h-5 w-5" />
              <p
                className={`text-xs md:text-sm group-hover:block duration-1000 transition-all opacity-0 group-hover:opacity-100 ${currentView === 'timeGridWeek' ? 'block opacity-100' : 'hidden'}`}
              >
                {t('week')}
              </p>
            </TabsTrigger>
            <TabsTrigger
              value="dayGridMonth"
              onClick={() => setView(calendarRef, 'dayGridMonth', setCurrentView)}
              className={`space-x-1 group ${currentView === 'dayGridMonth' ? 'w-1/2' : 'w-1/4'}`}
            >
              <Table className="h-5 w-5 rotate-90" />
              <p
                className={`text-xs md:text-sm group-hover:block duration-1000 transition-all opacity-0 group-hover:opacity-100 ${currentView === 'dayGridMonth' ? 'block opacity-100' : 'hidden'}`}
              >
                {t('month')}
              </p>
            </TabsTrigger>
            <TabsTrigger
              value="listMonth"
              onClick={() => setView(calendarRef, 'listMonth', setCurrentView)}
              className={`space-x-1 group ${currentView === 'listMonth' ? 'w-1/2' : 'w-1/4'}`}
            >
              <List className="h-5 w-5" />
              <p
                className={`text-xs md:text-sm group-hover:block duration-1000 transition-all opacity-0 group-hover:opacity-100 ${currentView === 'listMonth' ? 'block opacity-100' : 'hidden'}`}
              >
                {t('list')}
              </p>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Add event button  */}
        {/* <EventAddForm start={start} end={end} /> */}
      </div>
    </div>
  )
}
