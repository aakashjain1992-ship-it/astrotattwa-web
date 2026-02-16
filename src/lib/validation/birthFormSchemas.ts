import { z } from 'zod'

export const baseBirthSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  gender: z.enum(['Male', 'Female'], { required_error: 'Gender is required' }),
  birthDate: z.string().min(1, 'Birth date is required'),
  birthTime: z.string().min(1, 'Birth time is required'),
  timePeriod: z.enum(['AM', 'PM'], { required_error: 'AM/PM is required' }),
  cityName: z.string().min(1, 'Birth place is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().min(1, 'Timezone is required'),
})

export type BaseBirthData = z.infer<typeof baseBirthSchema>
