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

  // Track open state per Select so we only intercept keys when closed
  // (when open, Radix handles keyboard natively)
  const [isHourOpen,   setIsHourOpen]   = React.useState(false)
  const [isMinOpen,    setIsMinOpen]    = React.useState(false)
  const [isPeriodOpen, setIsPeriodOpen] = React.useState(false)

  // Digit buffers — no timers, purely key-sequence logic
  const hourBuf = React.useRef("")
  const minBuf  = React.useRef("")

  const handleHourKey = (e: React.KeyboardEvent) => {
    if (isHourOpen || !/^\d$/.test(e.key)) return
    e.preventDefault()
    const key = e.key

    if (hourBuf.current === "1") {
      // Waiting after "1" — only 0, 1, 2 can extend to a valid 2-digit hour (10, 11, 12)
      if (key === "0" || key === "1" || key === "2") {
        onChange({ ...value, hour: "1" + key })
        hourBuf.current = ""
      } else if (key === "1") {
        // Another "1": commit "01", restart wait with new "1"
        onChange({ ...value, hour: "01" })
        hourBuf.current = "1"
      } else {
        // 3–9: not a valid continuation — commit "01", set new hour 03–09
        onChange({ ...value, hour: "0" + key })
        hourBuf.current = ""
      }
    } else {
      if (key === "1") {
        // Could be 1, 10, 11, 12 — show "01" tentatively, wait for next key
        hourBuf.current = "1"
        onChange({ ...value, hour: "01" })
      } else {
        const num = Number(key)
        if (num >= 2 && num <= 9) onChange({ ...value, hour: "0" + key })
        // 0 alone is not a valid hour — ignore
        hourBuf.current = ""
      }
    }
  }

  const handleMinKey = (e: React.KeyboardEvent) => {
    if (isMinOpen || !/^\d$/.test(e.key)) return
    e.preventDefault()
    const key = e.key

    if (minBuf.current !== "") {
      // Have first digit — combine and commit
      const combined = minBuf.current + key
      const num = Number(combined)
      if (num <= 59) {
        onChange({ ...value, minute: combined })
        minBuf.current = ""
      } else {
        // e.g. "67" — invalid, treat second key as a fresh first digit
        minBuf.current = key
        onChange({ ...value, minute: "0" + key })
      }
    } else {
      const num = Number(key)
      if (num >= 6) {
        // 6–9 first: can only be 06–09 (no valid minute starts 60–99)
        onChange({ ...value, minute: "0" + key })
        minBuf.current = ""
      } else {
        // 0–5: show tentatively, wait for second digit
        minBuf.current = key
        onChange({ ...value, minute: "0" + key })
      }
    }
  }

  const handlePeriodKey = (e: React.KeyboardEvent) => {
    if (isPeriodOpen) return
    if (e.key === "a" || e.key === "A") { e.preventDefault(); onChange({ ...value, period: "AM" }) }
    if (e.key === "p" || e.key === "P") { e.preventDefault(); onChange({ ...value, period: "PM" }) }
  }

  React.useEffect(() => {
    if (value.date) setMonth(new Date(value.date.getFullYear(), value.date.getMonth(), 1))
  }, [value.date])

  const dateText = value.date ? formatDate(value.date, "dd/MM/yyyy") : "Select date"

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

 // Navigation: go to previous month
  const goToPrevMonth = () => {
    const prevMonth = new Date(yearValue, monthIndex - 1, 1)
    // Don't go before fromYear
    if (prevMonth.getFullYear() >= fromYear) {
      setMonth(prevMonth)
    }
  }
  // Navigation: go to next month
  const goToNextMonth = () => {
    const nextMonth = new Date(yearValue, monthIndex + 1, 1)
    // Don't go past current month if disabledFuture
    if (!disabledFuture || nextMonth <= new Date(today.getFullYear(), today.getMonth(), 1)) {
      setMonth(nextMonth)
    }
  }
  // Check if prev/next should be disabled
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
            <Button
              type="button"
              variant="outline"
              className={cn(
                "w-full justify-between font-normal bg-white",
                !value.date && "text-muted-foreground"
              )}
            >
              <span>{dateText}</span>
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-4 bg-white shadow-lg border rounded-lg"
            align="start"  >
         
            {/* Navigation Header */}

            <div className="flex items-center justify-between gap-1 mb-3">
              {/* Previous Month Button */}
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

              {/* Month Dropdown */}

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
	    {/* Next Month Button */}
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
