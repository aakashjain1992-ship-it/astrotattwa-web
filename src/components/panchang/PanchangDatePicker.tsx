'use client'
// Thin date-only wrapper around the DateTimeField calendar popover.
// Extracted directly from DateTimeField — same UI, no time inputs.
import * as React from 'react'
import { format as formatDate } from 'date-fns'
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

interface PanchangDatePickerProps {
  value: Date | undefined
  onChange: (date: Date) => void
  fromYear?: number
  toYear?: number
  label?: string
}

export function PanchangDatePicker({
  value,
  onChange,
  fromYear = 1900,
  toYear = new Date().getFullYear() + 5,
  label = 'Select Date',
}: PanchangDatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const initialMonth = value
    ? new Date(value.getFullYear(), value.getMonth(), 1)
    : new Date()
  const [month, setMonth] = React.useState<Date>(initialMonth)

  const years = React.useMemo(() => {
    const arr: number[] = []
    for (let y = fromYear; y <= toYear; y++) arr.push(y)
    return arr
  }, [fromYear, toYear])

  const monthIndex = month.getMonth()
  const yearValue = month.getFullYear()

  React.useEffect(() => {
    if (value) setMonth(new Date(value.getFullYear(), value.getMonth(), 1))
  }, [value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'h-10 w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {value ? formatDate(value, 'dd MMM yyyy') : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 bg-white shadow-lg border rounded-lg" align="start">
        {/* Nav header */}
        <div className="flex items-center justify-between gap-1 mb-3">
          <Button
            type="button" variant="ghost" size="icon" className="h-8 w-8 p-0"
            onClick={() => setMonth(new Date(yearValue, monthIndex - 1, 1))}
            disabled={yearValue <= fromYear && monthIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Select value={String(monthIndex)} onValueChange={v => setMonth(new Date(yearValue, Number(v), 1))}>
            <SelectTrigger className="h-8 w-[110px] border bg-white text-black text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white text-black max-h-[260px] overflow-auto">
              {MONTHS.map((m, i) => (
                <SelectItem key={m} value={String(i)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={String(yearValue)} onValueChange={v => setMonth(new Date(Number(v), monthIndex, 1))}>
            <SelectTrigger className="h-8 w-[85px] border bg-white text-black text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white text-black max-h-[260px] overflow-auto">
              {years.map(y => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button" variant="ghost" size="icon" className="h-8 w-8 p-0"
            onClick={() => setMonth(new Date(yearValue, monthIndex + 1, 1))}
            disabled={yearValue >= toYear && monthIndex >= 11}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Calendar
          mode="single"
          month={month}
          onMonthChange={m => setMonth(new Date(m.getFullYear(), m.getMonth(), 1))}
          selected={value}
          onSelect={d => {
            if (d) { onChange(d); setOpen(false) }
          }}
          showOutsideDays
        />
      </PopoverContent>
    </Popover>
  )
}
