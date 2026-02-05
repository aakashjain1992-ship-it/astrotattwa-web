'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// ============================================
// VALIDATION SCHEMA
// ============================================

const editFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  birthDate: z.string().min(1, 'Date is required'),
  birthHour: z.string().min(1, 'Hour is required'),
  birthMinute: z.string().min(1, 'Minute is required'),
  birthPeriod: z.enum(['AM', 'PM']),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().min(1, 'Timezone is required'),
});

type EditFormData = z.infer<typeof editFormSchema>;

// ============================================
// HELPERS
// ============================================

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

const COMMON_TIMEZONES = [
  'Asia/Kolkata',
  'Asia/Dubai',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Singapore',
  'Australia/Sydney',
];

/**
 * Parse localDateTime to form fields
 */
function parseDateTime(localDateTime: string): {
  date: string;
  hour: string;
  minute: string;
  period: 'AM' | 'PM';
} {
  try {
    const dateObj = new Date(localDateTime);
    if (!isNaN(dateObj.getTime())) {
      let hour = dateObj.getHours();
      const minute = dateObj.getMinutes();
      const period = hour >= 12 ? 'PM' : 'AM';
      
      if (hour === 0) hour = 12;
      else if (hour > 12) hour -= 12;
      
      return {
        date: `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`,
        hour: String(hour).padStart(2, '0'),
        minute: String(minute).padStart(2, '0'),
        period,
      };
    }
  } catch {
    // Fall through
  }
  
  // Manual parse for "YYYY-MM-DD HH:mm"
  const parts = localDateTime.split(' ');
  if (parts.length >= 2) {
    const [hourNum, minuteNum] = parts[1].split(':').map(Number);
    let hour = hourNum;
    const period = hour >= 12 ? 'PM' : 'AM';
    if (hour === 0) hour = 12;
    else if (hour > 12) hour -= 12;
    
    return {
      date: parts[0],
      hour: String(hour).padStart(2, '0'),
      minute: String(minuteNum).padStart(2, '0'),
      period,
    };
  }
  
  return { date: '', hour: '12', minute: '00', period: 'PM' };
}

// ============================================
// COMPONENT
// ============================================

interface EditBirthDetailsFormProps {
  /** Whether form is visible */
  isOpen: boolean;
  /** Current birth data */
  currentData: {
    name: string;
    localDateTime: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  /** Callback when form is submitted */
  onSubmit: (data: {
    name: string;
    birthDate: string;
    birthTime: string;
    timePeriod: 'AM' | 'PM';
    latitude: number;
    longitude: number;
    timezone: string;
  }) => Promise<void>;
  /** Callback to close the form */
  onCancel: () => void;
  /** Additional className */
  className?: string;
}

/**
 * EditBirthDetailsForm - Collapsible form for editing birth details
 * 
 * Features:
 * - Pre-filled with current values
 * - Validates input
 * - Submits to recalculate chart
 * - Loading state during submission
 */
export function EditBirthDetailsForm({
  isOpen,
  currentData,
  onSubmit,
  onCancel,
  className,
}: EditBirthDetailsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Parse current datetime
  const parsedDateTime = parseDateTime(currentData.localDateTime);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      name: currentData.name,
      birthDate: parsedDateTime.date,
      birthHour: parsedDateTime.hour,
      birthMinute: parsedDateTime.minute,
      birthPeriod: parsedDateTime.period,
      latitude: currentData.latitude,
      longitude: currentData.longitude,
      timezone: currentData.timezone,
    },
  });

  // Watch values for controlled selects
  const birthHour = watch('birthHour');
  const birthMinute = watch('birthMinute');
  const birthPeriod = watch('birthPeriod');
  const timezone = watch('timezone');

  const handleFormSubmit = async (data: EditFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: data.name,
        birthDate: data.birthDate,
        birthTime: `${data.birthHour}:${data.birthMinute}`,
        timePeriod: data.birthPeriod,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={cn(
      'rounded-lg border border-border bg-card p-4 md:p-6',
      'animate-slide-up',
      className
    )}>
      <h3 className="text-lg font-medium mb-4">Edit Birth Details</h3>
      
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="edit-name">Name</Label>
          <Input
            id="edit-name"
            {...register('name')}
            placeholder="Enter name"
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Date and Time Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Birth Date */}
          <div className="space-y-2">
            <Label htmlFor="edit-date">Birth Date</Label>
            <Input
              id="edit-date"
              type="date"
              {...register('birthDate')}
              className={errors.birthDate ? 'border-destructive' : ''}
            />
            {errors.birthDate && (
              <p className="text-sm text-destructive">{errors.birthDate.message}</p>
            )}
          </div>

          {/* Birth Time */}
          <div className="space-y-2">
            <Label>Birth Time</Label>
            <div className="grid grid-cols-3 gap-2">
              {/* Hour */}
              <Select
                value={birthHour}
                onValueChange={(val) => setValue('birthHour', val)}
              >
                <SelectTrigger className={errors.birthHour ? 'border-destructive' : ''}>
                  <SelectValue placeholder="HH" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {HOURS.map((h) => (
                    <SelectItem key={h} value={h}>{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Minute */}
              <Select
                value={birthMinute}
                onValueChange={(val) => setValue('birthMinute', val)}
              >
                <SelectTrigger className={errors.birthMinute ? 'border-destructive' : ''}>
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {MINUTES.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* AM/PM */}
              <Select
                value={birthPeriod}
                onValueChange={(val) => setValue('birthPeriod', val as 'AM' | 'PM')}
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

        {/* Location Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Latitude */}
          <div className="space-y-2">
            <Label htmlFor="edit-lat">Latitude</Label>
            <Input
              id="edit-lat"
              type="number"
              step="0.0001"
              {...register('latitude', { valueAsNumber: true })}
              placeholder="28.6139"
              className={errors.latitude ? 'border-destructive' : ''}
            />
            {errors.latitude && (
              <p className="text-sm text-destructive">{errors.latitude.message}</p>
            )}
          </div>

          {/* Longitude */}
          <div className="space-y-2">
            <Label htmlFor="edit-lng">Longitude</Label>
            <Input
              id="edit-lng"
              type="number"
              step="0.0001"
              {...register('longitude', { valueAsNumber: true })}
              placeholder="77.209"
              className={errors.longitude ? 'border-destructive' : ''}
            />
            {errors.longitude && (
              <p className="text-sm text-destructive">{errors.longitude.message}</p>
            )}
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select
              value={timezone}
              onValueChange={(val) => setValue('timezone', val)}
            >
              <SelectTrigger className={errors.timezone ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {COMMON_TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Recalculating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Recalculate Chart
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
