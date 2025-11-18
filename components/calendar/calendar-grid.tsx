"use client"

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CalendarDay } from './calendar-day'
import type { SongOfTheDay } from '@/types'

interface CalendarGridProps {
  songs: Record<string, SongOfTheDay>
  onDayClick: (date: string) => void
  'aria-label'?: string
}

export function CalendarGrid({ songs, onDayClick, 'aria-label': ariaLabel }: CalendarGridProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const startingDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const canGoNext = () => {
    const today = new Date()
    return year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth())
  }

  const days = []
  
  // Empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} aria-hidden="true" />)
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const song = songs[dateStr]
    const date = new Date(year, month, day)
    const today = new Date()
    const isFuture = date > today
    const isToday = date.toDateString() === today.toDateString()

    days.push(
      <CalendarDay
        key={dateStr}
        date={dateStr}
        day={day}
        song={song}
        isFuture={isFuture}
        isToday={isToday}
        onClick={() => !isFuture && onDayClick(dateStr)}
      />
    )
  }

  return (
    <nav className="space-y-4" aria-label={ariaLabel || 'Music calendar'}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold" id="calendar-month-label">
          {monthNames[month]} {year}
        </h2>
        <div className="flex gap-2" role="group" aria-label="Calendar navigation">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={previousMonth}
            aria-label={`Go to ${monthNames[month - 1] || monthNames[11]} ${month === 0 ? year - 1 : year}`}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
            disabled={!canGoNext()}
            aria-label={`Go to ${monthNames[month + 1] || monthNames[0]} ${month === 11 ? year + 1 : year}`}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div 
        className="grid grid-cols-7 gap-2 text-sm font-medium text-foreground-secondary"
        role="row"
      >
        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, idx) => (
          <div 
            key={day} 
            className="text-center py-2" 
            role="columnheader"
            abbr={day}
          >
            <span className="hidden sm:inline">{day.slice(0, 3)}</span>
            <span className="sm:hidden">{day.slice(0, 1)}</span>
          </div>
        ))}
      </div>

      <div 
        className="grid grid-cols-7 gap-2" 
        role="grid" 
        aria-labelledby="calendar-month-label"
      >
        {days}
      </div>
    </nav>
  )
}
