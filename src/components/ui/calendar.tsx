"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-white text-black", className)}
      classNames={{
        // hide built-in caption/nav (we use our own month/year dropdowns)
        caption: "hidden",
        caption_label: "hidden",
        nav: "hidden",

        months: "flex flex-col space-y-4",
        month: "space-y-4",

        // IMPORTANT: use flex rows (stable) — NOT grid/table hacks
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-black w-9 font-semibold text-[0.85rem] flex items-center justify-center",
        row: "flex w-full mt-2",
        cell:
          "h-9 w-9 text-center p-0 relative [&:has([aria-selected])]:bg-gray-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
        day: cn(
          "h-9 w-9 p-0 font-medium flex items-center justify-center rounded-md hover:bg-gray-100",
          "aria-disabled:text-gray-300 aria-disabled:cursor-not-allowed aria-disabled:hover:bg-transparent"
        ),

        day_selected:
          "bg-black text-white hover:bg-black hover:text-white focus:bg-black focus:text-white",
        day_today: "border border-black",
        day_outside: "text-gray-300 opacity-100",
        day_disabled: "text-gray-300 opacity-100 cursor-not-allowed",
        day_range_middle: "aria-selected:bg-gray-100 aria-selected:text-black",

        ...classNames,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
