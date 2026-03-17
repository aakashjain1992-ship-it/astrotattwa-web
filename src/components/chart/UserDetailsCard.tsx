'use client';

import type React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Globe, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BirthInput {
  localDateTime: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

interface UserDetailsCardProps {
  name: string;
  gender?: 'male' | 'female' | string;
  input: BirthInput;
  birthPlace?: string;
  isEditing?: boolean;
  onEditToggle?: () => void;
  rightContent?: React.ReactNode;
  className?: string;
}

function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}°${latDir}, ${Math.abs(lng).toFixed(2)}°${lngDir}`;
}

function parseBirthDateTime(localDateTime: string): { date: string; time: string } {
  try {
    const dateObj = new Date(localDateTime);
    if (!isNaN(dateObj.getTime())) {
      return {
        date: format(dateObj, 'dd MMM yyyy'),
        time: format(dateObj, 'hh:mm a'),
      };
    }
  } catch {
    // fall through
  }
  const parts = localDateTime.split(' ');
  if (parts.length >= 2) {
    const [year, month, day] = parts[0].split('-').map(Number);
    const [hour, minute]     = parts[1].split(':').map(Number);
    const dateObj = new Date(year, month - 1, day, hour, minute);
    return {
      date: format(dateObj, 'dd MMM yyyy'),
      time: format(dateObj, 'hh:mm a'),
    };
  }
  return { date: localDateTime, time: '' };
}

export function UserDetailsCard({
  name,
  gender,
  input,
  birthPlace,
  isEditing = false,
  onEditToggle,
  rightContent,
  className,
}: UserDetailsCardProps) {
  const { date, time } = parseBirthDateTime(input.localDateTime);
  const locationDisplay = birthPlace || formatCoordinates(input.latitude, input.longitude);

  return (
    <div className={cn('rounded-lg border border-border bg-card p-4 md:p-6 transition-all duration-200', className)}>

      {/* ── Row 1: Name + Edit button ── */}
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xl md:text-2xl font-semibold text-foreground leading-tight">
          Birth Chart for {name}
        </h2>

        {onEditToggle && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEditToggle}
            className="flex-shrink-0 gap-1.5 h-8 px-2.5"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-sm">Edit</span>
            {isEditing
              ? <ChevronUp className="h-3.5 w-3.5" />
              : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        )}
      </div>

      {/* ── Row 2: Birth details — horizontal single line on desktop, 2-col grid on mobile ── */}
      <div className="mt-2.5 grid grid-cols-2 sm:flex sm:flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5 min-w-0">
          <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{date}</span>
        </div>
        {time && (
          <div className="flex items-center gap-1.5 min-w-0">
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{time}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 min-w-0 col-span-2 sm:col-span-1">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{locationDisplay}</span>
        </div>
        <div className="flex items-center gap-1.5 min-w-0">
          <Globe className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{input.timezone}</span>
        </div>
      </div>

      {/* ── Row 3: Saved chart select — full width on mobile, auto on desktop ── */}
      {rightContent && (
        <div className="mt-3 w-full sm:w-auto [&>*]:w-full sm:[&>*]:w-[220px]">
          {rightContent}
        </div>
      )}
    </div>
  );
}
