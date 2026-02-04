"use client"

import * as React from "react"
import { format as formatDate } from "date-fns"
import { CalendarIcon, Clock } from "lucide-react"

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
  hour?: string // "01".."12"
  minute?: string // "00".."59"
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
}: {
  labelDate?: string
  labelTime?: string
  value: DateTimeValue
  onChange: (next: DateTimeValue) => void
  disabledFuture?: boolean
  fromYear?: number
}) {
  const today = new Date()
  const toYear = today.getFullYear()

  // Popover control for auto-close
  const [open, setOpen] = React.useState(false)

  // Default open month/year = Jan 2000 if no date selected
  const initialMonth = value.date ? new Date(value.date.getFullYear(), value.date.getMonth(), 1) : new Date(2000, 0, 1)
  const [month, setMonth] = React.useState<Date>(initialMonth)

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

  return (
    <div className="space-y-4">
      {/* Date */}
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

          <PopoverContent
		className="w-[340px] p-3 bg-white text-black shadow-md border inline-block"
                align="start">
            {/* Month/Year controls */}
            <div className="flex justify-around gap-2 mb-2">
              <Select value={String(monthIndex)} onValueChange={setMonthIndex}>
                <SelectTrigger className="h-8 w-[140px] border border-black bg-white text-black">
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
                <SelectTrigger className="h-8 w-[110px] border border-black bg-white text-black">
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
            </div>

            <Calendar
              mode="single"
              month={month}
              onMonthChange={(m) => setMonth(new Date(m.getFullYear(), m.getMonth(), 1))}
              selected={value.date}
              onSelect={(d) => {
                onChange({ ...value, date: d ?? undefined })
                if (d) setOpen(false) // ✅ auto-close on select
              }}
              disabled={isDateDisabled}
              showOutsideDays
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Time */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {labelTime}
        </Label>

        <div className="grid grid-cols-3 gap-2">
          <Select value={value.hour ?? ""} onValueChange={(hour) => onChange({ ...value, hour })}>
            <SelectTrigger>
              <SelectValue placeholder="HH" />
            </SelectTrigger>
            <SelectContent className="max-h-[260px] overflow-auto">
              {hours.map((h) => (
                <SelectItem key={h} value={h}>{h}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={value.minute ?? ""} onValueChange={(minute) => onChange({ ...value, minute })}>
            <SelectTrigger>
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
          >
            <SelectTrigger>
              <SelectValue placeholder="AM/PM" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AM">AM</SelectItem>
              <SelectItem value="PM">PM</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
