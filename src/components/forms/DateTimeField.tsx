"use client"

import * as React from "react"
import { format as formatDate } from "date-fns"
import { CalendarIcon, Clock, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

type TimePeriod = "AM" | "PM"

export type DateTimeValue = {
  date?: Date
  hour?: string
  minute?: string
  period?: TimePeriod
}

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
]

// ============================================
// DATE PARSING FUNCTIONS
// ============================================

function parseDateInput(input: string, fromYear: number, toYear: number, disabledFuture: boolean): Date | null {
  const cleaned = input.trim()
  
  // Try DD/MM/YYYY format (25/03/1992)
  const ddmmyyyyMatch = cleaned.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/)
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    if (isValidDate(date, fromYear, toYear, disabledFuture)) return date
  }
  
  // Try DDMMYYYY format (25031992)
  const compactMatch = cleaned.match(/^(\d{2})(\d{2})(\d{4})$/)
  if (compactMatch) {
    const [, day, month, year] = compactMatch
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    if (isValidDate(date, fromYear, toYear, disabledFuture)) return date
  }
  
  // Try YYYY-MM-DD format (1992-03-25)
  const isoMatch = cleaned.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/)
  if (isoMatch) {
    const [, year, month, day] = isoMatch
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    if (isValidDate(date, fromYear, toYear, disabledFuture)) return date
  }
  
  return null
}

function isValidDate(date: Date, fromYear: number, toYear: number, disabledFuture: boolean): boolean {
  if (isNaN(date.getTime())) return false
  
  // Check year range
  const year = date.getFullYear()
  if (year < fromYear || year > toYear) return false
  
  // Check against disabled dates
  if (disabledFuture) {
    const today = new Date()
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
    if (date.getTime() > endOfToday.getTime()) return false
  }
  
  // Check if date is actually valid (e.g., not Feb 30)
  const testDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  if (testDate.getDate() !== date.getDate()) return false
  
  return true
}

// ============================================
// MAIN COMPONENT
// ============================================

export function DateTimeField({
  labelDate = "Birth Date",
  labelTime = "Birth Time",
  value,
  onChange,
  disabledFuture = true,
  fromYear = 1900,
  errorDate,
  errorTime,
}: {
  labelDate?: string
  labelTime?: string
  value: DateTimeValue
  onChange: (next: DateTimeValue) => void
  disabledFuture?: boolean
  fromYear?: number
  errorDate?: string
  errorTime?: string
}) {
  const today = new Date()
  const toYear = today.getFullYear()

  const [open, setOpen] = React.useState(false)

  const initialMonth = value.date ? new Date(value.date.getFullYear(), value.date.getMonth(), 1) : new Date(2000, 0, 1)
  const [month, setMonth] = React.useState<Date>(initialMonth)

  // Track display text separately from parsed date
  const [dateText, setDateText] = React.useState(() => 
    value.date ? formatDate(value.date, "dd/MM/yyyy") : ""
  )

  // Track open state per Select so we only intercept keys when closed
  const [isHourOpen,   setIsHourOpen]   = React.useState(false)
  const [isMinOpen,    setIsMinOpen]    = React.useState(false)
  const [isPeriodOpen, setIsPeriodOpen] = React.useState(false)

  // Digit buffers for time inputs
  const hourBuf = React.useRef("")
  const minBuf  = React.useRef("")

  // Sync dateText when value.date changes externally
  React.useEffect(() => {
    if (value.date) {
      setDateText(formatDate(value.date, "dd/MM/yyyy"))
    } else {
      setDateText("")
    }
  }, [value.date])

  // Handle date input from keyboard
  const handleDateInput = (input: string) => {
    setDateText(input)
    
    // Try to parse the input
    const parsed = parseDateInput(input, fromYear, toYear, disabledFuture)
    if (parsed) {
      onChange({ ...value, date: parsed })
      setMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1))
    }
  }

  // Handle keyboard input for hour
  const handleHourKey = (e: React.KeyboardEvent) => {
    if (isHourOpen || !/^\d$/.test(e.key)) return
    e.preventDefault()
    const key = e.key

    if (hourBuf.current === "1") {
      if (key === "0" || key === "1" || key === "2") {
        onChange({ ...value, hour: "1" + key })
        hourBuf.current = ""
      } else if (key === "1") {
        onChange({ ...value, hour: "01" })
        hourBuf.current = "1"
      } else {
        onChange({ ...value, hour: "0" + key })
        hourBuf.current = ""
      }
    } else {
      if (key === "1") {
        hourBuf.current = "1"
        onChange({ ...value, hour: "01" })
      } else {
        const num = Number(key)
        if (num >= 2 && num <= 9) onChange({ ...value, hour: "0" + key })
        hourBuf.current = ""
      }
    }
  }

  // Handle keyboard input for minute
  const handleMinKey = (e: React.KeyboardEvent) => {
    if (isMinOpen || !/^\d$/.test(e.key)) return
    e.preventDefault()
    const key = e.key

    if (minBuf.current !== "") {
      const combined = minBuf.current + key
      const num = Number(combined)
      if (num <= 59) {
        onChange({ ...value, minute: combined })
        minBuf.current = ""
      } else {
        minBuf.current = key
        onChange({ ...value, minute: "0" + key })
      }
    } else {
      const num = Number(key)
      if (num >= 6) {
        onChange({ ...value, minute: "0" + key })
        minBuf.current = ""
      } else {
        minBuf.current = key
        onChange({ ...value, minute: "0" + key })
      }
    }
  }

  // Handle keyboard input for period
  const handlePeriodKey = (e: React.KeyboardEvent) => {
    if (isPeriodOpen) return
    if (e.key === "a" || e.key === "A") { e.preventDefault(); onChange({ ...value, period: "AM" }) }
    if (e.key === "p" || e.key === "P") { e.preventDefault(); onChange({ ...value, period: "PM" }) }
  }

  React.useEffect(() => {
    if (value.date) setMonth(new Date(value.date.getFullYear(), value.date.getMonth(), 1))
  }, [value.date])

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"))
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"))

  const years = React.useMemo(() => {
    const arr: number[] = []
    for (let y = fromYear; y <= toYear; y++) arr.push(y)
    return arr
  }, [fromYear, toYear])

  const isDateDisabled = (d: Date) => {
    if (!disabledFuture) return false
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
    return d.getTime() > endOfToday.getTime()
  }

  const monthIndex = month.getMonth()
  const yearValue = month.getFullYear()

  const setMonthIndex = (idxStr: string) => {
    const idx = Number(idxStr)
    setMonth(new Date(yearValue, idx, 1))
  }

  const setYear = (yStr: string) => {
    const y = Number(yStr)
    setMonth(new Date(y, monthIndex, 1))
  }

  const goToPrevMonth = () => {
    const prevMonth = new Date(yearValue, monthIndex - 1, 1)
    if (prevMonth.getFullYear() >= fromYear) {
      setMonth(prevMonth)
    }
  }

  const goToNextMonth = () => {
    const nextMonth = new Date(yearValue, monthIndex + 1, 1)
    if (!disabledFuture || nextMonth <= new Date(today.getFullYear(), today.getMonth(), 1)) {
      setMonth(nextMonth)
    }
  }

  const isPrevDisabled = yearValue <= fromYear && monthIndex === 0
  const isNextDisabled = disabledFuture && yearValue >= today.getFullYear() && monthIndex >= today.getMonth()

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          {labelDate}
        </Label>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <input
              type="text"
              value={dateText}
              onChange={(e) => handleDateInput(e.target.value)}
              onFocus={(e) => e.target.select()}
              placeholder="DD/MM/YYYY"
              className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-input",
                "bg-white px-3 py-2 text-sm ring-offset-background",
                "placeholder:text-muted-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "cursor-pointer",
                !value.date && "text-muted-foreground"
              )}
            />
          </PopoverTrigger>

          <PopoverContent className="w-auto p-4 bg-white shadow-lg border rounded-lg" align="start">
            {/* Navigation Header */}
            <div className="flex items-center justify-between gap-1 mb-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 hover:bg-gray-100"
                onClick={goToPrevMonth}
                disabled={isPrevDisabled}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Select value={String(monthIndex)} onValueChange={setMonthIndex}>
                <SelectTrigger className="h-8 w-[110px] border bg-white text-black text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white text-black max-h-[260px] overflow-auto">
                  {MONTHS.map((m, i) => (
                    <SelectItem key={m} value={String(i)}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={String(yearValue)} onValueChange={setYear}>
                <SelectTrigger className="h-8 w-[85px] border bg-white text-black text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white text-black max-h-[260px] overflow-auto">
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 hover:bg-gray-100"
                onClick={goToNextMonth}
                disabled={isNextDisabled}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Calendar
              mode="single"
              month={month}
              onMonthChange={(m) => setMonth(new Date(m.getFullYear(), m.getMonth(), 1))}
              selected={value.date}
              onSelect={(d) => {
                onChange({ ...value, date: d ?? undefined })
                if (d) setOpen(false)
              }}
              disabled={isDateDisabled}
              showOutsideDays
            />
          </PopoverContent>
        </Popover>
        {errorDate && <p className="text-sm text-destructive">{errorDate}</p>}
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {labelTime}
        </Label>

        <div className="grid grid-cols-3 gap-2">
          <Select value={value.hour ?? ""} onValueChange={(hour) => onChange({ ...value, hour })}
            open={isHourOpen} onOpenChange={setIsHourOpen}>
            <SelectTrigger onKeyDown={handleHourKey}>
              <SelectValue placeholder="HH" />
            </SelectTrigger>
            <SelectContent className="max-h-[260px] overflow-auto">
              {hours.map((h) => (
                <SelectItem key={h} value={h}>{h}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={value.minute ?? ""} onValueChange={(minute) => onChange({ ...value, minute })}
            open={isMinOpen} onOpenChange={setIsMinOpen}>
            <SelectTrigger onKeyDown={handleMinKey}>
              <SelectValue placeholder="MM" />
            </SelectTrigger>
            <SelectContent className="max-h-[260px] overflow-auto">
              {minutes.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={value.period ?? ""}
            onValueChange={(period) => onChange({ ...value, period: period as TimePeriod })}
            open={isPeriodOpen} onOpenChange={setIsPeriodOpen}
          >
            <SelectTrigger onKeyDown={handlePeriodKey}>
              <SelectValue placeholder="AM/PM" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AM">AM</SelectItem>
              <SelectItem value="PM">PM</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {errorTime && <p className="text-sm text-destructive">{errorTime}</p>}
      </div>
    </div>
  )
}
