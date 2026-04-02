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
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDateChange(subDays(currentDate, 1))}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Prev
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onDateChange(today)}
        disabled={isToday}
        className="flex items-center gap-1"
      >
        <CalendarDays className="h-3.5 w-3.5" />
        Today
      </Button>

      <PanchangDatePicker
        value={currentDate}
        onChange={onDateChange}
        label={format(currentDate, 'dd MMM yyyy')}
      />

      <Button
        variant="outline"
        size="sm"
        onClick={() => onDateChange(addDays(currentDate, 1))}
        className="flex items-center gap-1"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
