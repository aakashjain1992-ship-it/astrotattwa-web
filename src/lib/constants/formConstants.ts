/**
 * Shared constants for birth data forms.
 * Used by BirthDataForm and EditBirthDetailsForm.
 */

export const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))

export const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const CURRENT_YEAR = new Date().getFullYear()
export const YEARS = Array.from(
  { length: CURRENT_YEAR - 1900 + 1 },
  (_, i) => 1900 + i,
).reverse()
