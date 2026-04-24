'use client'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format, addDays, subDays } from 'date-fns'
import { PanchangDatePicker } from './PanchangDatePicker'

interface DateNavigatorProps {
  currentDate: Date
  onDateChange: (date: Date) => void
}

export function DateNavigator({ currentDate, onDateChange }: DateNavigatorProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const isToday = currentDate.toDateString() === today.toDateString()

  return (
    <div className="flex items-center gap-1.5 w-full">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDateChange(subDays(currentDate, 1))}
        className="flex items-center gap-0.5 shrink-0 px-2 sm:px-3"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Prev</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onDateChange(today)}
        disabled={isToday}
        className="flex items-center gap-0.5 shrink-0 px-2 sm:px-3"
      >
        <CalendarDays className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Today</span>
      </Button>

      <div className="flex-1 min-w-0">
        <PanchangDatePicker
          value={currentDate}
          onChange={onDateChange}
          label={format(currentDate, 'dd MMM yyyy')}
        />
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onDateChange(addDays(currentDate, 1))}
        className="flex items-center gap-0.5 shrink-0 px-2 sm:px-3"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
