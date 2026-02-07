'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Loader2, RefreshCw, Calendar as CalendarIcon } from 'lucide-react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CitySearch } from '@/components/forms/CitySearch';
import { cn } from '@/lib/utils';

// ============================================
// VALIDATION SCHEMA
// ============================================

const editFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  gender: z.enum(['male', 'female'], {
    required_error: 'Please select gender',
  }),
  birthDate: z.date({ required_error: 'Date is required' }),
  birthHour: z.string().min(1, 'Hour is required'),
  birthMinute: z.string().min(1, 'Minute is required'),
  birthPeriod: z.enum(['AM', 'PM']),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().min(1, 'Timezone is required'),
  cityName: z.string().optional(),
});

type EditFormData = z.infer<typeof editFormSchema>;

// ============================================
// HELPERS
// ============================================

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

// Generate years from 1900 to current year
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => 1900 + i).reverse();

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Convert 12-hour time to 24-hour format
 */
function convertTo24Hour(hour: string, minute: string, period: 'AM' | 'PM'): string {
  let hours = parseInt(hour, 10);
  
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return `${String(hours).padStart(2, '0')}:${minute}`;
}

/**
 * Parse localDateTime to form fields
 */
function parseDateTime(localDateTime: string): {
  date: Date | undefined;
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
        date: dateObj,
        hour: String(hour).padStart(2, '0'),
        minute: String(minute).padStart(2, '0'),
        period,
      };
    }
  } catch {
    // Fall through
  }
  
  // Manual parse for "YYYY-MM-DD HH:mm" or "YYYY-MM-DDTHH:mm"
  const dateStr = localDateTime.split('T')[0] || localDateTime.split(' ')[0];
  const timeStr = localDateTime.includes('T') 
    ? localDateTime.split('T')[1] 
    : localDateTime.split(' ')[1];
  
  if (dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    let hour = 12;
    let minute = 0;
    let period: 'AM' | 'PM' = 'PM';
    
    if (timeStr) {
      const [h, m] = timeStr.split(':').map(Number);
      hour = h;
      minute = m || 0;
      period = hour >= 12 ? 'PM' : 'AM';
      if (hour === 0) hour = 12;
      else if (hour > 12) hour -= 12;
    }
    
    return {
      date,
      hour: String(hour).padStart(2, '0'),
      minute: String(minute).padStart(2, '0'),
      period,
    };
  }
  
  return { date: undefined, hour: '12', minute: '00', period: 'PM' };
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
    gender?: 'male' | 'female';
    localDateTime: string;
    latitude: number;
    longitude: number;
    timezone: string;
    cityName?: string;
  };
  /** Callback when form is submitted */
  onSubmit: (data: {
    name: string;
    gender: 'male' | 'female';
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
 * Matches the home page form style with calendar picker and city search
 */
export function EditBirthDetailsForm({
  isOpen,
  currentData,
  onSubmit,
  onCancel,
  className,
}: EditBirthDetailsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  
  // Parse current datetime
  const parsedDateTime = parseDateTime(currentData.localDateTime);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      name: currentData.name,
      gender: currentData.gender || 'male',
      birthDate: parsedDateTime.date,
      birthHour: parsedDateTime.hour,
      birthMinute: parsedDateTime.minute,
      birthPeriod: parsedDateTime.period,
      latitude: currentData.latitude,
      longitude: currentData.longitude,
      timezone: currentData.timezone,
      cityName: currentData.cityName || '',
    },
  });

  // Watch values for controlled inputs (only those needed for UI logic)
  const birthDate = watch('birthDate');
  const latitude = watch('latitude');
  const longitude = watch('longitude');

  // Update calendar month when date changes
  useEffect(() => {
    if (birthDate) {
      setCalendarMonth(birthDate);
    }
  }, [birthDate]);

  // Handle city selection
  const handleCitySelect = (city: { 
    name: string; 
    latitude: number; 
    longitude: number; 
    timezone: string;
  }) => {
    setValue('latitude', city.latitude);
    setValue('longitude', city.longitude);
    setValue('timezone', city.timezone);
    setValue('cityName', city.name);
  };

  // Handle month/year dropdown changes
  const handleMonthChange = (month: string) => {
    const newDate = new Date(calendarMonth);
    newDate.setMonth(parseInt(month));
    setCalendarMonth(newDate);
  };

  const handleYearChange = (year: string) => {
    const newDate = new Date(calendarMonth);
    newDate.setFullYear(parseInt(year));
    setCalendarMonth(newDate);
  };

  const handleFormSubmit = async (data: EditFormData) => {
    setIsSubmitting(true);
    
    // DEBUG: Log form data to see what React Hook Form captured
    console.log('🔍 EditBirthDetailsForm - Form data from React Hook Form:', {
      gender: data.gender,
      birthHour: data.birthHour,
      birthMinute: data.birthMinute,
      birthPeriod: data.birthPeriod,
      allData: data,
    });
    
    try {
      // Format date as YYYY-MM-DD
      const dateStr = format(data.birthDate, 'yyyy-MM-dd');
      
      const birthTime12 = `${String(data.birthHour).padStart(2, '0')}:${String(data.birthMinute).padStart(2, '0')}`;
      
      const submitData = {
        name: data.name,
        gender: data.gender,
        birthDate: dateStr,
        birthTime: birthTime12,
        timePeriod: data.birthPeriod,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
      };
      
      // DEBUG: Log what we're sending to parent
      console.log('🔍 EditBirthDetailsForm - Submitting to parent:', submitData);
        
      await onSubmit(submitData);
    } catch (error) {
      console.error('EditBirthDetailsForm - Submit error:', error);
      throw error;
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
        {/* Name and Gender Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Gender */}
          <div className="space-y-2">
            <Label>Gender</Label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className={errors.gender ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.gender && (
              <p className="text-sm text-destructive">{errors.gender.message}</p>
            )}
          </div>
        </div>

        {/* Date and Time Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Birth Date - Calendar Picker */}
          <div className="space-y-2">
            <Label>Birth Date</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !birthDate && 'text-muted-foreground',
                    errors.birthDate && 'border-destructive'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {birthDate ? format(birthDate, 'dd MMM yyyy') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                {/* Month/Year Dropdowns */}
                <div className="flex items-center justify-between gap-2 p-3 border-b">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => {
                      const newDate = new Date(calendarMonth);
                      newDate.setMonth(newDate.getMonth() - 1);
                      setCalendarMonth(newDate);
                    }}
                  >
                    &lt;
                  </Button>
                  
                  <div className="flex gap-2">
                    <Select
                      value={String(calendarMonth.getMonth())}
                      onValueChange={handleMonthChange}
                    >
                      <SelectTrigger className="h-8 w-[110px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {MONTHS.map((month, i) => (
                          <SelectItem key={month} value={String(i)}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={String(calendarMonth.getFullYear())}
                      onValueChange={handleYearChange}
                    >
                      <SelectTrigger className="h-8 w-[80px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {YEARS.map((year) => (
                          <SelectItem key={year} value={String(year)}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => {
                      const newDate = new Date(calendarMonth);
                      newDate.setMonth(newDate.getMonth() + 1);
                      setCalendarMonth(newDate);
                    }}
                  >
                    &gt;
                  </Button>
                </div>
                
                <Calendar
                  mode="single"
                  selected={birthDate}
                  onSelect={(date) => {
                    if (date) {
                      setValue('birthDate', date);
                      setCalendarOpen(false);
                    }
                  }}
                  month={calendarMonth}
                  onMonthChange={setCalendarMonth}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.birthDate && (
              <p className="text-sm text-destructive">{errors.birthDate.message}</p>
            )}
          </div>

          {/* Birth Time */}
          <div className="space-y-2">
            <Label>Birth Time</Label>
            <div className="grid grid-cols-3 gap-2">
              {/* Hour */}
              <Controller
                name="birthHour"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={errors.birthHour ? 'border-destructive' : ''}>
                      <SelectValue placeholder="HH" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {HOURS.map((h) => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />

              {/* Minute */}
              <Controller
                name="birthMinute"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={errors.birthMinute ? 'border-destructive' : ''}>
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {MINUTES.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />

              {/* AM/PM */}
              <Controller
                name="birthPeriod"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="AM/PM" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </div>

        {/* Birth Place - City Search */}
        <div className="space-y-2">
          <Label>Birth Place</Label>
          <CitySearch
            onSelect={handleCitySelect}
            defaultValue={currentData.cityName}
          />
          {/* Show current coordinates */}
          {latitude && longitude && (
            <p className="text-xs text-muted-foreground">
              Coordinates: {latitude.toFixed(4)}°{latitude >= 0 ? 'N' : 'S'}, {longitude.toFixed(4)}°{longitude >= 0 ? 'E' : 'W'}
            </p>
          )}
        </div>

        {/* Hidden fields for lat/lng/tz - populated by CitySearch */}
        <input type="hidden" {...register('latitude', { valueAsNumber: true })} />
        <input type="hidden" {...register('longitude', { valueAsNumber: true })} />
        <input type="hidden" {...register('timezone')} />

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
