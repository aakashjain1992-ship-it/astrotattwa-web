"use client"

import * as React from "react"
import { format as formatDate, isValid } from "date-fns"
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

// ---------------------------------------------------------------------------
// GenderField — pill toggle, keyboard-accessible
// ---------------------------------------------------------------------------
export function GenderField({
  value,
  onChange,
  error,
  label = "Gender",
}: {
  value: "Male" | "Female" | ""
  onChange: (v: "Male" | "Female") => void
  error?: string
  label?: string
}) {
  const maleRef = React.useRef<HTMLButtonElement>(null)
  const femaleRef = React.useRef<HTMLButtonElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "m" || e.key === "M" || e.key === "ArrowLeft") {
      e.preventDefault()
      onChange("Male")
      maleRef.current?.focus()
    } else if (e.key === "f" || e.key === "F" || e.key === "ArrowRight") {
      e.preventDefault()
      onChange("Female")
      femaleRef.current?.focus()
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        role="radiogroup"
        aria-label="Gender"
        className="flex rounded-md border overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        <button
          ref={maleRef}
          type="button"
          role="radio"
          aria-checked={value === "Male"}
          tabIndex={value === "Female" ? -1 : 0}
          onClick={() => onChange("Male")}
          className={cn(
            "flex-1 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            value === "Male"
              ? "bg-primary text-primary-foreground"
              : "bg-background text-muted-foreground hover:bg-muted"
          )}
        >
          ♂ Male
        </button>
        <button
          ref={femaleRef}
          type="button"
          role="radio"
          aria-checked={value === "Female"}
          tabIndex={value === "Female" ? 0 : -1}
          onClick={() => {
            onChange("Female")
            femaleRef.current?.focus()
          }}
          className={cn(
            "flex-1 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 border-l",
            value === "Female"
              ? "bg-primary text-primary-foreground"
              : "bg-background text-muted-foreground hover:bg-muted"
          )}
        >
          ♀ Female
        </button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// DateTimeField — keyboard-friendly date input + time inputs
// ---------------------------------------------------------------------------
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

  // ── Calendar popover ──────────────────────────────────────────────────────
  const [calOpen, setCalOpen] = React.useState(false)
  const initialMonth = value.date
    ? new Date(value.date.getFullYear(), value.date.getMonth(), 1)
    : new Date(2000, 0, 1)
  const [month, setMonth] = React.useState<Date>(initialMonth)

  React.useEffect(() => {
    if (value.date) setMonth(new Date(value.date.getFullYear(), value.date.getMonth(), 1))
  }, [value.date])

  // ── Date text input ───────────────────────────────────────────────────────
  const [dateInput, setDateInput] = React.useState(
    value.date ? formatDate(value.date, "dd/MM/yyyy") : ""
  )
  const [dateError, setDateError] = React.useState("")

  // Sync external date → text input (e.g. calendar pick)
  React.useEffect(() => {
    if (value.date) {
      setDateInput(formatDate(value.date, "dd/MM/yyyy"))
      setDateError("")
    }
  }, [value.date])

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 8)

    let formatted = digits
    if (digits.length > 4) formatted = digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4)
    else if (digits.length > 2) formatted = digits.slice(0, 2) + "/" + digits.slice(2)

    setDateInput(formatted)

    if (digits.length === 8) {
      const dd   = Number(digits.slice(0, 2))
      const mm   = Number(digits.slice(2, 4))
      const yyyy = Number(digits.slice(4, 8))
      const parsed = new Date(yyyy, mm - 1, dd)

      if (
        isValid(parsed) &&
        parsed.getDate() === dd &&
        parsed.getMonth() === mm - 1 &&
        parsed.getFullYear() === yyyy
      ) {
        if (disabledFuture && parsed > today) {
          setDateError("Date cannot be in the future")
        } else if (yyyy < fromYear) {
          setDateError(`Year must be ${fromYear} or later`)
        } else {
          setDateError("")
          onChange({ ...value, date: parsed })
          setMonth(new Date(yyyy, mm - 1, 1))
        }
      } else {
        setDateError("Invalid date")
      }
    } else {
      setDateError("")
    }
  }

  const handleDateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowed = ["Backspace","Delete","ArrowLeft","ArrowRight","Tab","Home","End"]
    if (allowed.includes(e.key)) return
    if (!/^\d$/.test(e.key)) e.preventDefault()
  }

  // ── Time refs for auto-advance ────────────────────────────────────────────
  const hourRef   = React.useRef<HTMLInputElement>(null)
  const minuteRef = React.useRef<HTMLInputElement>(null)
  const amRef     = React.useRef<HTMLButtonElement>(null)
  const pmRef     = React.useRef<HTMLButtonElement>(null)

  const [hourDisplay,   setHourDisplay]   = React.useState(value.hour   ?? "")
  const [minuteDisplay, setMinuteDisplay] = React.useState(value.minute ?? "")

  React.useEffect(() => { setHourDisplay(value.hour   ?? "") }, [value.hour])
  React.useEffect(() => { setMinuteDisplay(value.minute ?? "") }, [value.minute])

  // ── Hour ──────────────────────────────────────────────────────────────────
  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 2)
    const num = Number(raw)
    if (raw === "") { setHourDisplay(""); onChange({ ...value, hour: "" }); return }
    if (num < 1 || num > 12) return
    setHourDisplay(raw)
    onChange({ ...value, hour: raw.padStart(2, "0") })
    // auto-advance: 2 digits, or single digit ≥ 2 (impossible to be valid 2-digit starting with that)
    if (raw.length === 2 || (raw.length === 1 && num >= 2)) {
      minuteRef.current?.focus()
      minuteRef.current?.select()
    }
  }

  const handleHourBlur = () => {
    const num = Number(hourDisplay)
    if (hourDisplay && num >= 1 && num <= 12) {
      const padded = String(num).padStart(2, "0")
      setHourDisplay(padded)
      onChange({ ...value, hour: padded })
    } else if (hourDisplay) {
      setHourDisplay(""); onChange({ ...value, hour: "" })
    }
  }

  const handleHourKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault()
      const next = (Number(hourDisplay) || 0) >= 12 ? 1 : (Number(hourDisplay) || 0) + 1
      const padded = String(next).padStart(2, "0")
      setHourDisplay(padded); onChange({ ...value, hour: padded })
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      const next = (Number(hourDisplay) || 13) <= 1 ? 12 : (Number(hourDisplay) || 13) - 1
      const padded = String(next).padStart(2, "0")
      setHourDisplay(padded); onChange({ ...value, hour: padded })
    }
  }

  // ── Minute ────────────────────────────────────────────────────────────────
  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 2)
    const num = Number(raw)
    if (raw === "") { setMinuteDisplay(""); onChange({ ...value, minute: "" }); return }
    if (num > 59) return
    setMinuteDisplay(raw)
    onChange({ ...value, minute: raw.padStart(2, "0") })
    if (raw.length === 2) { amRef.current?.focus() }
  }

  const handleMinuteBlur = () => {
    const num = Number(minuteDisplay)
    if (minuteDisplay !== "" && num >= 0 && num <= 59) {
      const padded = String(num).padStart(2, "0")
      setMinuteDisplay(padded); onChange({ ...value, minute: padded })
    } else if (minuteDisplay) {
      setMinuteDisplay(""); onChange({ ...value, minute: "" })
    }
  }

  const handleMinuteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault()
      const next = (Number(minuteDisplay) || 0) >= 59 ? 0 : (Number(minuteDisplay) || 0) + 1
      const padded = String(next).padStart(2, "0")
      setMinuteDisplay(padded); onChange({ ...value, minute: padded })
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      const next = (Number(minuteDisplay) || 0) <= 0 ? 59 : (Number(minuteDisplay) || 0) - 1
      const padded = String(next).padStart(2, "0")
      setMinuteDisplay(padded); onChange({ ...value, minute: padded })
    }
  }

  // ── AM/PM ─────────────────────────────────────────────────────────────────
  const setPeriod = (p: TimePeriod) => onChange({ ...value, period: p })

  const handleAmPmKeyDown = (e: React.KeyboardEvent, current: TimePeriod) => {
    if (e.key === "a" || e.key === "A") { e.preventDefault(); setPeriod("AM"); amRef.current?.focus() }
    if (e.key === "p" || e.key === "P") { e.preventDefault(); setPeriod("PM"); pmRef.current?.focus() }
    if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === " ") {
      e.preventDefault()
      const next: TimePeriod = current === "AM" ? "PM" : "AM"
      setPeriod(next)
      if (next === "AM") amRef.current?.focus(); else pmRef.current?.focus()
    }
  }

  // ── Calendar nav ──────────────────────────────────────────────────────────
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
  const yearValue  = month.getFullYear()

  const goToPrevMonth = () => {
    const prev = new Date(yearValue, monthIndex - 1, 1)
    if (prev.getFullYear() >= fromYear) setMonth(prev)
  }
  const goToNextMonth = () => {
    const next = new Date(yearValue, monthIndex + 1, 1)
    if (!disabledFuture || next <= new Date(today.getFullYear(), today.getMonth(), 1)) setMonth(next)
  }

  const isPrevDisabled = yearValue <= fromYear && monthIndex === 0
  const isNextDisabled = disabledFuture && yearValue >= today.getFullYear() && monthIndex >= today.getMonth()

  const combinedDateError = dateError || errorDate

  const inputClass =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 placeholder:text-muted-foreground"

  return (
    <div className="space-y-4">

      {/* ── DATE ───────────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          {labelDate}
        </Label>

        <div className="flex gap-2">
          <input
            className={cn(inputClass, "flex-1", combinedDateError && "border-destructive")}
            placeholder="DD/MM/YYYY"
            value={dateInput}
            onChange={handleDateInputChange}
            onKeyDown={handleDateKeyDown}
            maxLength={10}
            inputMode="numeric"
            aria-label="Birth date"
          />

          <Popover open={calOpen} onOpenChange={setCalOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                aria-label="Open calendar"
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-4 bg-white shadow-lg border rounded-lg" align="end">
              <div className="flex items-center justify-between gap-1 mb-3">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 p-0 hover:bg-gray-100"
                  onClick={goToPrevMonth} disabled={isPrevDisabled}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Select value={String(monthIndex)} onValueChange={(v) => setMonth(new Date(yearValue, Number(v), 1))}>
                  <SelectTrigger className="h-8 w-[110px] border bg-white text-black text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black max-h-[260px] overflow-auto">
                    {MONTHS.map((m, i) => <SelectItem key={m} value={String(i)}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={String(yearValue)} onValueChange={(v) => setMonth(new Date(Number(v), monthIndex, 1))}>
                  <SelectTrigger className="h-8 w-[85px] border bg-white text-black text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black max-h-[260px] overflow-auto">
                    {years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 p-0 hover:bg-gray-100"
                  onClick={goToNextMonth} disabled={isNextDisabled}>
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
                  if (d) setCalOpen(false)
                }}
                disabled={isDateDisabled}
                showOutsideDays
              />
            </PopoverContent>
          </Popover>
        </div>

        {combinedDateError && <p className="text-sm text-destructive">{combinedDateError}</p>}
        <p className="text-xs text-muted-foreground">Type DD/MM/YYYY or tap the calendar icon</p>
      </div>

      {/* ── TIME ───────────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {labelTime}
        </Label>

        <div className="flex items-center gap-2">

          {/* Hour */}
          <input
            ref={hourRef}
            className={cn(inputClass, "flex-1 text-center", errorTime && "border-destructive")}
            placeholder="HH"
            value={hourDisplay}
            onChange={handleHourChange}
            onBlur={handleHourBlur}
            onKeyDown={handleHourKeyDown}
            onFocus={(e) => e.target.select()}
            inputMode="numeric"
            maxLength={2}
            aria-label="Hour (1–12)"
          />

          <span className="text-muted-foreground font-semibold text-lg select-none">:</span>

          {/* Minute */}
          <input
            ref={minuteRef}
            className={cn(inputClass, "flex-1 text-center", errorTime && "border-destructive")}
            placeholder="MM"
            value={minuteDisplay}
            onChange={handleMinuteChange}
            onBlur={handleMinuteBlur}
            onKeyDown={handleMinuteKeyDown}
            onFocus={(e) => e.target.select()}
            inputMode="numeric"
            maxLength={2}
            aria-label="Minute (00–59)"
          />

          {/* AM / PM */}
          <div className="flex rounded-md border overflow-hidden shrink-0" role="group" aria-label="AM or PM">
            <button
              ref={amRef}
              type="button"
              onClick={() => setPeriod("AM")}
              onKeyDown={(e) => handleAmPmKeyDown(e, "AM")}
              aria-pressed={value.period === "AM"}
              tabIndex={value.period === "PM" ? -1 : 0}
              className={cn(
                "px-3 h-10 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                value.period === "AM"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted"
              )}
            >
              AM
            </button>
            <button
              ref={pmRef}
              type="button"
              onClick={() => setPeriod("PM")}
              onKeyDown={(e) => handleAmPmKeyDown(e, "PM")}
              aria-pressed={value.period === "PM"}
              tabIndex={value.period === "PM" ? 0 : -1}
              className={cn(
                "px-3 h-10 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring border-l",
                value.period === "PM"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted"
              )}
            >
              PM
            </button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Type hour → auto-advances to minute → press A/P or ↑↓ arrows to adjust
        </p>
        {errorTime && <p className="text-sm text-destructive">{errorTime}</p>}
      </div>
    </div>
  )
}
