'use client';

import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Globe, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BirthInput {
  localDateTime: string;  // ISO string or "YYYY-MM-DD HH:mm"
  latitude: number;
  longitude: number;
  timezone: string;
}

interface UserDetailsCardProps {
  /** User's name */
  name: string;
  /** Gender (optional) */
  gender?: 'male' | 'female' | string;
  /** Birth input data */
  input: BirthInput;
  /** City name to display e.g. "Baghpat, Uttar Pradesh, IN" */
  birthPlace?: string;
  /** Whether edit form is expanded */
  isEditing?: boolean;
  /** Toggle edit mode */
  onEditToggle?: () => void;
  /** Additional className */
  className?: string;
}

/**
 * Format coordinates to display format (e.g., "28.61°N, 77.21°E")
 */
function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}°${latDir}, ${Math.abs(lng).toFixed(2)}°${lngDir}`;
}

/**
 * Parse and format the birth date/time from various input formats
 */
function parseBirthDateTime(localDateTime: string): { date: string; time: string } {
  try {
    // Try ISO format first
    const dateObj = new Date(localDateTime);
    if (!isNaN(dateObj.getTime())) {
      return {
        date: format(dateObj, 'dd MMM yyyy'),
        time: format(dateObj, 'hh:mm a'),
      };
    }
  } catch {
    // Fall through to manual parsing
  }

  // Manual parsing for "YYYY-MM-DD HH:mm" format
  const parts = localDateTime.split(' ');
  if (parts.length >= 2) {
    const datePart = parts[0];
    const timePart = parts[1];
    
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    
    const dateObj = new Date(year, month - 1, day, hour, minute);
    return {
      date: format(dateObj, 'dd MMM yyyy'),
      time: format(dateObj, 'hh:mm a'),
    };
  }

  return { date: localDateTime, time: '' };
}

/**
 * UserDetailsCard - Displays birth details with edit functionality
 * 
 * Shows:
 * - Name
 * - Birth Date
 * - Birth Time
 * - Location (coordinates)
 * - Timezone
 * - Edit button to expand/collapse form
 */
export function UserDetailsCard({
  name,
  gender,
  input,
  birthPlace,
  isEditing = false,
  onEditToggle,
  className,
}: UserDetailsCardProps) {
  const { date, time } = parseBirthDateTime(input.localDateTime);
  // Show city name if available, fall back to coordinates
  const locationDisplay = birthPlace || formatCoordinates(input.latitude, input.longitude);

  return (
    <div className={cn(
      'rounded-lg border border-border bg-card p-4 md:p-6',
      'transition-all duration-200',
      className
    )}>
      {/* Header Row */}
      <div className="flex items-start justify-between gap-4">
        {/* Name and Details */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground truncate">
            Birth Chart for {name}
          </h2>
          
          {/* Details Grid */}
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {/* Date */}
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>{date}</span>
            </div>
            
            {/* Time */}
            {time && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>{time}</span>
              </div>
            )}
            
            {/* Location */}
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>{locationDisplay}</span>
            </div>
            
            {/* Timezone */}
            <div className="flex items-center gap-1.5">
              <Globe className="h-4 w-4 flex-shrink-0" />
              <span>{input.timezone}</span>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        {onEditToggle && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEditToggle}
            className="flex-shrink-0 gap-1.5"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Edit</span>
            {isEditing ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
