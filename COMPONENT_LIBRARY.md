# Component Library

**Version:** 3.1
**Last Updated:** April 25, 2026
**Total Components:** 103 component files + 6 hooks + 32 API routes

---

## Table of Contents

- [Overview](#overview)
- [UI Components](#ui-components)
- [Chart Components](#chart-components)
- [Form Components](#form-components)
- [Layout Components](#layout-components)
- [Landing Components](#landing-components)
- [Auth Components](#auth-components)
- [Page Components](#page-components)
- [Custom Hooks](#custom-hooks)
- [API Routes](#api-routes)
- [Unused Components (Dead Code)](#unused-components-dead-code)
- [Usage Guidelines](#usage-guidelines)

---

## Overview

This document catalogs all reusable components in the Astrotattwa codebase. Each component includes props documentation, usage examples, and active usage status.

### Component Categories
- **UI Components** - shadcn/ui primitives + custom (17 files: 15 shadcn/ui + 2 custom)
- **Chart Components** - Astrology visualization (15 files; 12 active, 3 unused)
- **Form Components** - Input and validation (5 components, all active)
- **Layout Components** - Page structure (3 components: Header, Footer, ThemeProvider)
- **Landing Components** - Landing page features (6 components; 5 active, 1 unused — ZodiacWheel unwired)
- **Auth Components** - Authentication (1 component + 5 auth page forms)
- **Panchang Components** - Daily panchang display (20 files; all active)
- **Horoscope Components** - Horoscope shell + supporting UI (8 files; 7 active, 1 unused — HistoryNavigator)
- **Numerology Components** - Numerology reports + compatibility (15 files; all active)
- **Custom Hooks** - Shared React hooks (6 hooks; 5 active, 1 unused)

### File Structure
```
src/components/
├── ui/              # shadcn/ui base components + custom UI
├── chart/           # Chart visualization
│   ├── diamond/     # North Indian diamond chart
│   ├── divisional/  # Divisional chart components
│   └── sadesati/    # Saturn transit analysis
├── forms/           # Form components
├── layout/          # Header, Footer
├── landing/         # Landing page components (Galaxy, Yantra, Particles, Glyphs, ZodiacWheel, NavagrahaSection)
├── panchang/        # Panchang display (DateNavigator, PanchangHeader, sections/ × 14)
├── horoscope/       # Horoscope shell + supporting UI (8 files)
├── numerology/      # Numerology reports + compatibility (15 files)
└── auth/            # Authentication components

src/app/
├── (auth)/          # Auth page forms (Login, Signup, etc.)
├── chart/           # Chart page + ChartClient orchestrator
└── api/             # 32 API route handlers
```

---

## UI Components (shadcn/ui)

### Base Components from shadcn/ui

#### Button
**File:** `src/components/ui/button.tsx`
**Purpose:** Reusable button with variants
**Used by:** 13 files (forms, auth, chart, admin)

```typescript
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}
```

**Usage:**
```tsx
import { Button } from '@/components/ui/button';

<Button variant="default">Click Me</Button>
<Button variant="outline" size="sm">Small Button</Button>
```

---

#### Input
**File:** `src/components/ui/input.tsx`
**Purpose:** Text input field
**Used by:** 9 files (forms, auth, admin)

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
```

**Usage:**
```tsx
import { Input } from '@/components/ui/input';

<Input type="text" placeholder="Enter text" />
<Input type="email" placeholder="Email" />
```

---

#### Select
**File:** `src/components/ui/select.tsx`
**Purpose:** Dropdown select component
**Used by:** 5 files (ChartClient, forms, ChartSelector)

**Usage:**
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

<Select onValueChange={handleChange}>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

---

#### Card
**File:** `src/components/ui/card.tsx`
**Purpose:** Container with border and padding
**Used by:** 8 files (chart components, admin)

```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
```

**Usage:**
```tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>
```

---

### Other Installed shadcn/ui Components

| Component | File | Used By | Import Count |
|-----------|------|---------|-------------|
| **Accordion** | `ui/accordion.tsx` | ChartEducation | 1 |
| **Alert** | `ui/alert.tsx` | DivisionalChartsTab | 1 |
| **Badge** | `ui/badge.tsx` | ChartEducation, DashaTimeline, ChartInsights, StatusBadges, admin | 5 |
| **Calendar** | `ui/calendar.tsx` | DateTimeField | 1 |
| **Collapsible** | `ui/collapsible.tsx` | ChartSelector | 1 |
| **Label** | `ui/label.tsx` | Forms, auth forms, admin | 9 |
| **Popover** | `ui/popover.tsx` | DateTimeField | 1 |
| **Progress** | `ui/progress.tsx` | admin/tests | 1 |
| **Toast** | `ui/toast.tsx` | Toaster, use-toast hook | 2 |
| **Toaster** | `ui/toaster.tsx` | Root layout | 1 |

> **Note:** `scroll-area.tsx` is installed but not imported anywhere. See [Unused Components](#unused-components-dead-code).

---

### Custom UI Components

#### ChartLoader
**File:** `src/components/ui/ChartLoader.tsx`
**Purpose:** Full-screen loading overlay for chart calculations
**Used by:** BirthDataFormWrapper

```typescript
interface ChartLoaderProps {
  visible: boolean;
}
```

**Usage:**
```tsx
import { ChartLoader } from '@/components/ui/ChartLoader';

<ChartLoader visible={isCalculating} />
```

**Features:**
- Full-screen frosted glass backdrop
- Animated spinning orbital rings
- Logo breathing and spinning animation
- Cycling text messages ("Consulting ephemeris...", "Calculating dashas...")
- Bouncing dots animation
- Portal-based rendering (mounted to document body)

---

#### Logo
**File:** `src/components/ui/Logo.tsx`
**Purpose:** App logo SVG component
**Used by:** 7 files (Header, auth forms, ChartLoader)

```typescript
interface LogoProps {
  className?: string;
  size?: number;
}
```

**Usage:**
```tsx
import { Logo } from '@/components/ui/Logo';

<Logo size={40} className="text-blue-600" />
```

**Features:**
- SVG-based scalable logo
- Respects currentColor
- Customizable size

---

## Chart Components

### Active Chart Components

#### DiamondChart
**File:** `src/components/chart/diamond/DiamondChart.tsx`
**Purpose:** Main North Indian diamond chart visualization
**Used by:** ChartFocusMode, DivisionalChartsTab

```typescript
interface DiamondChartProps {
  houses: HouseData[];
  width?: number;
  height?: number;
  showAscLabel?: boolean;       // toggles "Asc" annotation — used by ChartFocusMode and DivisionalChartsTab
  onPlanetClick?: (planetKey: string) => void;
}
```

**Usage:**
```tsx
import { DiamondChart } from '@/components/chart/diamond/DiamondChart';

<DiamondChart
  houses={chartData.houses}
  width={400}
  height={400}
  showAscendantMarker={true}
  onPlanetClick={(planet) => console.log(planet)}
/>
```

**Features:**
- SVG-based rendering
- Responsive sizing
- Interactive planet clicks
- Ascendant marker (triangle)
- Status flags (R, C, D, S)

---

#### DiamondGrid
**File:** `src/components/chart/diamond/DiamondGrid.tsx`
**Purpose:** Diamond shape grid with 12 houses
**Used by:** DiamondChart (internal dependency)

```typescript
interface DiamondGridProps {
  width: number;
  height: number;
  strokeColor?: string;
  strokeWidth?: number;
}
```

**Features:**
- Perfect diamond geometry
- 12 house divisions (4 triangles, 8 rectangles)
- Customizable stroke

---

#### PlanetaryTable
**File:** `src/components/chart/PlanetaryTable.tsx`
**Purpose:** Table of all planetary positions
**Used by:** ChartClient

```typescript
interface PlanetaryTableProps {
  planets: Record<string, PlanetData>;
  ascendant: AscendantData;
  showSubLord?: boolean;
  sortable?: boolean;
}
```

**Usage:**
```tsx
import { PlanetaryTable } from '@/components/chart/PlanetaryTable';

<PlanetaryTable
  planets={chartData.planets}
  ascendant={chartData.ascendant}
  showSubLord={true}
  sortable={true}
/>
```

**Features:**
- Sortable columns
- Sign names, Degrees
- Nakshatra & Pada
- Status flags
- Sub-lord (KP)

---

#### UserDetailsCard
**File:** `src/components/chart/UserDetailsCard.tsx`
**Purpose:** Display user's birth details with edit toggle
**Used by:** ChartClient

```typescript
interface UserDetailsCardProps {
  name: string;
  gender?: 'male' | 'female' | string;
  input: {
    localDateTime: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  birthPlace?: string;
  isEditing?: boolean;
  onEditToggle?: () => void;
  className?: string;
}
```

**Usage:**
```tsx
import { UserDetailsCard } from '@/components/chart/UserDetailsCard';

<UserDetailsCard
  name="John Doe"
  gender="male"
  input={birthInput}
  birthPlace="New Delhi, India"
  isEditing={isEditing}
  onEditToggle={() => setIsEditing(!isEditing)}
/>
```

**Features:**
- Formatted date and time display
- Coordinates display with N/S/E/W indicators
- Timezone display
- Edit toggle button
- Collapsible/expandable interface
- Mobile-responsive

---

#### StatusBadges
**File:** `src/components/chart/StatusBadges.tsx`
**Purpose:** Display planet status flags as badges
**Used by:** PlanetaryTable (internal dependency)

```typescript
interface StatusBadgesProps {
  retrograde?: boolean;
  combust?: boolean;
  exalted?: boolean;
  debilitated?: boolean;
  exhausted?: boolean;
}
```

**Usage:**
```tsx
import { StatusBadges } from '@/components/chart/StatusBadges';

<StatusBadges
  retrograde={true}
  combust={false}
  exalted={true}
/>
```

**Output:** Badges for R (retrograde), C (combust), E+ (exalted), D- (debilitated), Ex (exhausted)

**Features:**
- Color-coded badges (destructive for R, default for E+, etc.)
- Compact size
- Shows "—" when no statuses present

---

#### ChartLegend
**File:** `src/components/chart/ChartLegend.tsx`
**Purpose:** Display chart symbol legend and status flags explanation
**Used by:** ChartClient

```typescript
interface ChartLegendProps {
  variant?: 'sidebar' | 'accordion';
  className?: string;
}
```

**Usage:**
```tsx
import { ChartLegend } from '@/components/chart/ChartLegend';

<ChartLegend variant="sidebar" />
<ChartLegend variant="accordion" />  {/* Collapsible version */}
```

**Features:**
- Planet symbols and names
- Status flags explanation (R, C, D, S)
- Dignity indicators (Exalted, Debilitated, etc.)
- Two variants: sidebar (always visible) and accordion (collapsible)
- Dark mode support

---

#### AvakhadaTable
**File:** `src/components/chart/AvakhadaTable.tsx`
**Purpose:** Display Panchang details and matching information
**Used by:** ChartClient

```typescript
interface AvakhadaTableProps {
  data: AvakhadaData;
  variant?: 'full' | 'compact';
  className?: string;
}

interface AvakhadaData {
  rasiSign?: string;
  rasiLord?: string;
  nakshatraCharan?: string;
  nakshatraLord?: string;
  yoga?: string;
  karan?: string;
  gana?: string;
  yoni?: string;
  nadi?: string;
  varan?: string;
  vashya?: string;
  nameAlphabet?: string;
  sunSignWestern?: string;
  // ... additional fields
}
```

**Usage:**
```tsx
import { AvakhadaTable } from '@/components/chart/AvakhadaTable';

<AvakhadaTable
  data={avakhadaData}
  variant="full"
/>
```

**Features:**
- Organized sections: Core Info, Matching Info, Additional
- Full and compact layout variants
- Responsive grid layout
- Dark mode support

---

#### DashaNavigator
**File:** `src/components/chart/DashaNavigator.tsx`
**Purpose:** Interactive multi-level Vimshottari Dasha navigator
**Used by:** ChartClient

```typescript
interface DashaNavigatorProps {
  dashaData: DashaData;
  currentDate?: Date;
  onDashaSelect?: (dasha: DashaNode) => void;
}
```

**Usage:**
```tsx
import { DashaNavigator } from '@/components/chart/DashaNavigator';

<DashaNavigator
  dashaData={chartData.dashas}
  currentDate={new Date()}
  onDashaSelect={(dasha) => console.log(dasha)}
/>
```

**Features:**
- 4-level hierarchy (Maha > Antar > Pratyantar > Sookshma)
- Current dasha highlighting
- Expandable/collapsible
- Date ranges
- On-demand API loading of sub-periods

---

#### ChartFocusMode
**File:** `src/components/chart/ChartFocusMode.tsx`
**Purpose:** Interactive multi-chart viewer with focus/compare modes
**Used by:** ChartClient

```typescript
interface ChartFocusModeProps {
  isOpen: boolean;
  onClose: () => void;
  initialChart: DivisionalChartType;
  chartData: ChartData;
}
```

**Features:**
- Swipeable navigation (framer-motion)
- Multiple chart instances (D1, Moon, D9)
- Focus and compare modes
- Keyboard shortcuts

---

#### PlanetsTab
**File:** `src/components/chart/PlanetsTab.tsx`
**Purpose:** Planets tab view — wraps PlanetaryTable with additional context display
**Used by:** ChartClient

---

#### ChartLabelModal
**File:** `src/components/chart/ChartLabelModal.tsx`
**Purpose:** Save / rename a chart with label and is_favorite toggle
**Used by:** ChartClient

```typescript
interface ChartLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  chartId?: string;           // undefined = new save, string = edit existing
  currentLabel?: string;
  currentIsFavorite?: boolean;
  onSave: (label: string, isFavorite: boolean) => Promise<void>;
}
```

**Features:**
- Radix Dialog
- Label input + is_favorite checkbox ("Set as My Chart")
- Handles both create and edit flows

---

#### DeleteChartDialog
**File:** `src/components/chart/DeleteChartDialog.tsx`
**Purpose:** Confirm-delete modal for saved charts
**Used by:** ChartClient

```typescript
interface DeleteChartDialogProps {
  isOpen: boolean;
  onClose: () => void;
  chartLabel: string;
  onConfirm: () => Promise<void>;
}
```

**Features:**
- Radix AlertDialog
- Shows chart label in confirmation message

---

### Divisional Chart Components

#### DivisionalChartsTab
**File:** `src/components/chart/divisional/DivisionalChartsTab.tsx`
**Purpose:** Tab interface for all 16 divisional charts with responsive layout
**Used by:** ChartClient

```typescript
interface DivisionalChartsTabProps {
  chartData: ChartData;
  selectedChart?: DivisionalChartType;
  onChartChange?: (type: DivisionalChartType) => void;
}
```

**Usage:**
```tsx
import { DivisionalChartsTab } from '@/components/chart/divisional/DivisionalChartsTab';

<DivisionalChartsTab
  chartData={data}
  selectedChart="D9"
  onChartChange={(type) => console.log(type)}
/>
```

**Features:**
- Chart selector dropdown
- Educational content
- Rule-based insights
- Chart visualization via DiamondChart

---

#### ChartSelector
**File:** `src/components/chart/divisional/ChartSelector.tsx`
**Purpose:** Dropdown/horizontal selector for divisional charts
**Used by:** DivisionalChartsTab (internal dependency)

```typescript
interface ChartSelectorProps {
  selectedChart: DivisionalChartType;
  onChartChange: (type: DivisionalChartType) => void;
}
```

**Available Charts:**
- D1 (Lagna/Rashi) - Birth chart
- D2 (Hora) - Wealth
- D3 (Drekkana) - Siblings
- D4 (Chaturthamsa) - Property
- D5 (Panchamamsa) - Fame
- D6 (Shashtamsa) - Health
- D7 (Saptamsa) - Children
- D8 (Ashtamsa) - Longevity
- D9 (Navamsa) - Marriage
- D10 (Dasamsa) - Career
- D11 (Ekadasamsa) - Gains
- D12 (Dwadasamsa) - Parents
- D16 (Shodasamsa) - Vehicles
- D20 (Vimshamsa) - Spirituality
- D24 (Siddhamsa) - Education
- D27 (Bhamsa) - Strength
- D30 (Trimsamsa) - Evils
- D40 (Khavedamsa) - Auspiciousness
- D60 (Shashtiamsa) - All matters
- Moon Chart - Chandra Lagna

---

#### ChartEducation
**File:** `src/components/chart/divisional/ChartEducation.tsx`
**Purpose:** Educational content for each divisional chart
**Used by:** DivisionalChartsTab (internal dependency)

```typescript
interface ChartEducationProps {
  chartType: DivisionalChartType;
}
```

**Content Includes:**
- Chart purpose
- Key houses
- Important planets
- Usage examples

---

#### ChartInsights
**File:** `src/components/chart/divisional/ChartInsights.tsx`
**Purpose:** Rule-based insights for divisional charts
**Used by:** DivisionalChartsTab (internal dependency)

```typescript
interface ChartInsightsProps {
  chartType: DivisionalChartType;
  houses: HouseData[];
  planets: Record<string, PlanetData>;
}
```

---

### Sade Sati Components

#### SadeSatiTableView
**File:** `src/components/chart/sadesati/SadeSatiTableView.tsx`
**Purpose:** Saturn transit analysis (Sade Sati & Dhaiya periods) with timeline bar and tables
**Used by:** ChartClient

```typescript
interface SadeSatiTableViewProps {
  analysis: SaturnTransitAnalysis;
  birthDate: string;
  planets: Record<string, PlanetData>;
  ascendant: AscendantData;
  dashaInfo?: DashaData;
}
```

**Features:**
- Active/Clear status cards
- Visual timeline bar
- Collapsible Saturn cycles table
- Row click opens PeriodDetailView
- Responsive layout

---

#### PeriodDetailView
**File:** `src/components/chart/sadesati/PeriodDetailView.tsx`
**Purpose:** Deep analysis of a single Saturn transit period with recommendations
**Used by:** SadeSatiTableView (internal dependency)

```typescript
interface PeriodDetailViewProps {
  period: SelectedPeriod;
}
```

**Features:**
- Nested tables with period data
- Formatting helpers
- Recommendation display
- Imports shared utilities from `./shared`

---

#### Shared Utilities
**File:** `src/components/chart/sadesati/shared.tsx`
**Purpose:** Shared helper components and utilities for Sade Sati views
**Used by:** PeriodDetailView (internal dependency)

---

## Form Components

### BirthDataForm
**File:** `src/components/forms/BirthDataForm.tsx`
**Purpose:** Main form to create birth chart
**Used by:** BirthDataFormWrapper

```typescript
interface BirthDataFormProps {
  onSubmit: (data: ChartFormData) => void;
  initialData?: Partial<ChartFormData>;
  loading?: boolean;
}
```

**Usage:**
```tsx
import { BirthDataForm } from '@/components/forms/BirthDataForm';

<BirthDataForm
  onSubmit={(data) => calculateChart(data)}
  loading={isCalculating}
/>
```

**Features:**
- Name input
- DateTimeField (date + time)
- CitySearch (location)
- Validation (Zod)
- Error messages

---

### BirthDataFormWrapper
**File:** `src/components/forms/BirthDataFormWrapper.tsx`
**Purpose:** Wrapper component that handles form submission with loading state
**Used by:** Home page (`src/app/page.tsx`)

```typescript
interface ChartFormValues {
  name: string;
  gender?: string;
  birthDate: string;     // "YYYY-MM-DD"
  birthTime: string;     // "HH:MM"
  timePeriod: string;    // "AM/PM"
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: string;
}
```

**Usage:**
```tsx
import BirthDataFormWrapper from '@/components/forms/BirthDataFormWrapper';

<BirthDataFormWrapper />
```

**Features:**
- Wraps BirthDataForm
- Handles /api/calculate submission
- Shows ChartLoader during calculation
- Redirects to /chart on success
- Error handling and display
- Stores result in localStorage (temporary)

---

### EditBirthDetailsForm
**File:** `src/components/forms/EditBirthDetailsForm.tsx`
**Purpose:** Edit existing birth details
**Used by:** ChartClient
**Refactored:** February 14, 2026 — now uses `DateTimeField` (same as home form)

```typescript
interface EditBirthDetailsFormProps {
  isOpen: boolean;
  currentData: {
    name: string;
    gender?: 'male' | 'female';
    localDateTime: string;
    latitude: number;
    longitude: number;
    timezone: string;
    cityName?: string;
  };
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
  onCancel: () => void;
  className?: string;
}
```

**Usage:**
```tsx
import { EditBirthDetailsForm } from '@/components/forms/EditBirthDetailsForm';

<EditBirthDetailsForm
  isOpen={isEditing}
  currentData={existingData}
  onSubmit={handleUpdate}
  onCancel={handleCancel}
/>
```

**Features:**
- Uses `DateTimeField` (shared with home form)
- Pre-filled from `currentData.localDateTime` via `parseDateTime` utility
- `syncDateTimeToForm` pattern identical to BirthDataForm
- Collapsible (hidden when `isOpen` is false)

---

### DateTimeField
**File:** `src/components/forms/DateTimeField.tsx`
**Purpose:** Combined date + time picker (12-hour AM/PM)
**Used by:** BirthDataForm, EditBirthDetailsForm

```typescript
interface DateTimeFieldProps {
  date: Date;
  time: string; // "HH:MM AM/PM"
  onDateChange: (date: Date) => void;
  onTimeChange: (time: string) => void;
}
```

**Usage:**
```tsx
import { DateTimeField } from '@/components/forms/DateTimeField';

<DateTimeField
  date={birthDate}
  time="11:30 AM"
  onDateChange={setDate}
  onTimeChange={setTime}
/>
```

**Features:**
- Calendar popup (uses Popover + Calendar UI components)
- 12-hour format
- AM/PM toggle
- Validation

---

### CitySearch
**File:** `src/components/forms/CitySearch.tsx`
**Purpose:** City autocomplete with coordinates
**Used by:** BirthDataForm, EditBirthDetailsForm

```typescript
interface CitySearchProps {
  value: string;
  onChange: (city: CityData) => void;
  placeholder?: string;
}
```

**Usage:**
```tsx
import { CitySearch } from '@/components/forms/CitySearch';

<CitySearch
  value={selectedCity}
  onChange={(city) => {
    setCity(city.city_name);
    setCoordinates({ lat: city.latitude, lng: city.longitude });
  }}
/>
```

**Features:**
- Autocomplete search
- Debounced API calls
- Displays: City, State, Country
- Returns: Coordinates, timezone

---

### Form Utilities

#### parseDateTime
**File:** `src/lib/utils/parseDateTime.ts`
**Purpose:** Parse `localDateTime` string to `DateTimeValue` for use with `DateTimeField`

```typescript
import { parseDateTime } from '@/lib/utils/parseDateTime'

const dtValue = parseDateTime('1992-03-25T11:55:00')
// { date: Date, hour: '11', minute: '55', period: 'AM' }
```

**Handles:**
- ISO strings: `"1992-03-25T11:55:00"`
- Space-separated: `"1992-03-25 11:55"`
- Date-only: `"1992-03-25"` (defaults time to 12:00 PM)

---

#### formConstants
**File:** `src/lib/constants/formConstants.ts`
**Purpose:** Shared time/date arrays — single source of truth for all forms

```typescript
import { HOURS, MINUTES, MONTHS, YEARS } from '@/lib/constants/formConstants'
```

**Exports:** `HOURS` (01-12), `MINUTES` (00-59), `MONTHS` (January-December), `YEARS` (1900-current, descending)

---

## Layout Components

### Header
**File:** `src/components/layout/Header.tsx`
**Purpose:** Site header with navigation
**Used by:** 5 pages (Home, Chart, Privacy, Terms, Settings)

```typescript
interface HeaderProps {
  user?: User | null;
}
```

**Features:**
- Logo
- Navigation links
- Login/Signup buttons
- Theme toggle (inline, not a separate component)

---

### Footer
**File:** `src/components/layout/Footer.tsx`
**Purpose:** Site footer
**Used by:** 5 pages (Home, Chart, Privacy, Terms, Settings)

**Content:**
- Links (About, Privacy, Terms)
- Social media
- Copyright

---

### ThemeProvider
**File:** `src/components/theme-provider.tsx`
**Purpose:** Context provider for dark/light mode theme
**Used by:** Root layout (`src/app/layout.tsx`)

```typescript
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: 'light' | 'dark' | 'system';
  storageKey?: string;
}
```

**Usage:**
```tsx
import { ThemeProvider } from '@/components/theme-provider';

<ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
  {children}
</ThemeProvider>
```

**Features:**
- Custom ThemeProvider (NOT next-themes) — uses React context + MutationObserver on `<html>` for instant dark/light switch
- System preference detection
- Persistent theme storage (`localStorage` key: `theme`)
- Context for theme state (`useTheme` hook)

---

## Landing Components

### Galaxy
**File:** `src/components/landing/Galaxy.tsx`
**Purpose:** Full-viewport canvas star/nebula animation for the homepage hero
**Used by:** Home page

**Features:**
- `position: fixed` to escape hero `overflow: hidden`
- 654 stars across 3 layers (tiny, medium, bright) + milky way band
- Per-star twinkle + drift animation via `requestAnimationFrame`
- 5 nebulae rendered as radial gradients
- Pauses automatically when browser tab is hidden (`visibilitychange` API) — saves CPU
- `MutationObserver` on `<html>` for instant dark/light theme switch
- Uses `window.innerWidth/Height` not `offsetWidth` (avoids layout thrash)

---

### ZodiacWheel
**File:** `src/components/landing/ZodiacWheel.tsx`
**Purpose:** Rotating zodiac SVG wheel for the homepage hero
**Status:** UNUSED — added Apr 2026, not yet wired to any page (0 imports)

**Features:**
- SVG-based rotating zodiac ring
- 12 zodiac glyphs evenly spaced
- CSS animation via `animateTransform`

---

### NavagrahaSection
**File:** `src/components/landing/NavagrahaSection.tsx`
**Purpose:** Interactive section displaying 9 planetary deities
**Used by:** Home page

**Features:**
- Animated planet cards with Unicode symbols
- Detailed descriptions for each planet
- Key points and tags
- Smooth hover animations
- Dark mode support
- Mobile-responsive layout

---

### Yantra
**File:** `src/components/landing/Yantra.tsx`
**Purpose:** Animated sacred geometry visualization
**Used by:** Home page

**Features:**
- SVG-based yantra illustration
- Rotation and glow animations
- Uses framer-motion

---

### Particles
**File:** `src/components/landing/Particles.tsx`
**Purpose:** Animated particle background effect
**Used by:** Home page

**Features:**
- Canvas-based particle animation
- Floating particles with connections
- Performance optimized
- Responsive to viewport size

---

### Glyphs
**File:** `src/components/landing/Glyphs.tsx`
**Purpose:** Decorative astrological glyphs
**Used by:** Home page

**Features:**
- Zodiac and planetary symbols
- Animated appearance
- Decorative background elements

---

## Auth Components

### SessionWatcher
**File:** `src/components/auth/SessionWatcher.tsx`
**Purpose:** Monitor authentication state and handle session changes
**Status:** DEFINED BUT NOT MOUNTED - See [Unused Components](#unused-components-dead-code)

```typescript
// No props - automatically handles auth state
```

**Usage (intended):**
```tsx
import { SessionWatcher } from '@/components/auth/SessionWatcher';

// In protected pages or layouts
<SessionWatcher />
```

**Features:**
- Listens to Supabase auth state changes
- Redirects to login when session expires
- Tab synchronization
- Automatic cleanup on unmount

---

### Auth Page Forms

These forms live alongside their pages (co-located pattern):

| Form | File | Used By |
|------|------|---------|
| **LoginForm** | `src/app/(auth)/login/LoginForm.tsx` | Login page |
| **SignupForm** | `src/app/(auth)/signup/SignupForm.tsx` | Signup page |
| **ForgotPasswordForm** | `src/app/(auth)/forgot-password/ForgotPasswordForm.tsx` | Forgot password page |
| **ResetPasswordForm** | `src/app/(auth)/reset-password/ResetPasswordForm.tsx` | Reset password page |
| **VerifyEmailForm** | `src/app/(auth)/verify-email/VerifyEmailForm.tsx` | Verify email page |

All auth forms use: Button, Input, Label, Logo from `@/components/ui/`

---

## Page Components

### ChartClient
**File:** `src/app/chart/ChartClient.tsx`
**Purpose:** Main chart page orchestrator — the central hub that composes all chart components
**Used by:** `src/app/chart/page.tsx` (server component entry point)

**Imports these components:**
- Header, Footer (layout)
- EditBirthDetailsForm (forms)
- ChartFocusMode, PlanetaryTable, AvakhadaTable, UserDetailsCard, ChartLegend, DashaNavigator (chart)
- DivisionalChartsTab (chart/divisional)
- SadeSatiTableView (chart/sadesati)

**Imports these hooks:**
- useSavedCharts, useIdleLogout

**Tab structure:**
- `?tab=overview` — Planets + Avakahada tables + ChartFocusMode + ChartLegend
- `?tab=dasha` — DashaNavigator
- `?tab=divisional` — DivisionalChartsTab
- `?tab=sadesati` — SadeSatiTableView

---

## Panchang Components

All in `src/components/panchang/`. Entry point is `PanchangHeader` + `DateNavigator`; the 14 section components are rendered by the panchang page in order.

| Component | File | Purpose |
|-----------|------|---------|
| **DateNavigator** | `DateNavigator.tsx` | Prev/Next date navigation with calendar picker |
| **PanchangHeader** | `PanchangHeader.tsx` | Header bar showing current date + location |
| **PanchangDatePicker** | `PanchangDatePicker.tsx` | Calendar popup used by DateNavigator |
| **CollapsibleSection** | `CollapsibleSection.tsx` | Wrapper for collapsible panchang sections |
| **SpecialYogasPills** | `SpecialYogasPills.tsx` | Pill badges for special yoga combinations |
| **SunriseMoonrise** | `sections/SunriseMoonrise.tsx` | Sunrise, sunset, moonrise, moonset times |
| **RashiNakshatra** | `sections/RashiNakshatra.tsx` | Tithi, Nakshatra, Yoga, Karana, Vara |
| **LunarCalendar** | `sections/LunarCalendar.tsx` | Vikram Samvat, Shaka Samvat, Masa, Paksha |
| **AuspiciousTimings** | `sections/AuspiciousTimings.tsx` | Brahma, Abhijit, Vijaya muhurtas |
| **InauspiciousTimings** | `sections/InauspiciousTimings.tsx` | Rahu Kalam, Dur Muhurtam, Yamaghanta |
| **UdayaLagna** | `sections/UdayaLagna.tsx` | Rising ascendant slots + Panchaka type |
| **ChandraTara** | `sections/ChandraTara.tsx` | Chandrabalam + Tarabalam favorability |
| **AnandadiYoga** | `sections/AnandadiYoga.tsx` | Anandadi Yoga + Tamil 28-cycle |
| **NivasShool** | `sections/NivasShool.tsx` | Nivas + Shool direction |
| **MantriMandala** | `sections/MantriMandala.tsx` | Mantri Mandala for current Vikram Samvat year |
| **PanchaBhuja** | `sections/PanchaBhuja.tsx` | Pancha Bhuja calculations |
| **RituAyana** | `sections/RituAyana.tsx` | Ritu (season) + Ayana display |
| **OtherCalendars** | `sections/OtherCalendars.tsx` | Other calendar epochs |
| **FestivalsEvents** | `sections/FestivalsEvents.tsx` | Festivals from `festival_calendar` table |
| **SpecialYogas** | `sections/SpecialYogas.tsx` (via SpecialYogasPills) | Auspicious/inauspicious yoga detection |

---

## Horoscope Components

All in `src/components/horoscope/`. `HoroscopeShell` is the top-level orchestrator used by the SSR horoscope page.

| Component | File | Purpose |
|-----------|------|---------|
| **HoroscopeShell** | `HoroscopeShell.tsx` | Main orchestrator — language toggle, type tabs, rashi selector, history nav, content display |
| **HoroscopeContent** | `HoroscopeContent.tsx` | Renders the horoscope text (EN/HI) with section formatting |
| **HoroscopeLoading** | `HoroscopeLoading.tsx` | Skeleton loading state |
| **RashiSelector** | `RashiSelector.tsx` | 12-rashi grid selector |
| **HistoryNavigator** | `HistoryNavigator.tsx` | Prev/Next navigation through past horoscopes — **UNUSED** (0 imports; history nav is inline in HoroscopeShell) |
| **LanguageToggle** | `LanguageToggle.tsx` | EN ↔ HI toggle, preference persisted to `localStorage` (`horoscope_lang`) |
| **SignTypeToggle** | `SignTypeToggle.tsx` | Moon sign / Sun sign toggle (sun sign currently disabled) |
| **InsightChips** | `InsightChips.tsx` | Pill display for planet transit insights |

---

## Numerology Components

All in `src/components/numerology/`. `NumerologyReport` is embeddable — used both standalone and inside `CompatibilityReport`.

| Component | File | Purpose |
|-----------|------|---------|
| **NumerologyReport** | `NumerologyReport.tsx` | 6-tab report: Core Numbers, Lo Shu Grid, Chaldean, Planes, Arrows, Raj Yogas. Takes `NumerologyResult` prop. |
| **CompatibilityReport** | `CompatibilityReport.tsx` | 5-tab compatibility report — embeds `NumerologyReport` for each person in "Full Reports" tab |
| **LoShuGrid** | `LoShuGrid.tsx` | 3×3 Lo Shu grid with frequency-colored cells |
| **CoreNumbers** | `CoreNumbers.tsx` | Life Path, Destiny, Soul Urge, Personality display cards |
| **ChaldeanCard** | `ChaldeanCard.tsx` | Chaldean name number breakdown |
| **PlanesAnalysis** | `PlanesAnalysis.tsx` | Mental / Physical / Emotional / Intuitive plane scores |
| **ArrowsAnalysis** | `ArrowsAnalysis.tsx` | Present/missing Lo Shu arrows with meanings |
| **RajYogas** | `RajYogas.tsx` | Detected Raj Yoga combinations |
| **KarmicLessons** | `KarmicLessons.tsx` | Missing numbers → karmic lesson interpretations |
| **SpecialConditions** | `SpecialConditions.tsx` | Master numbers (11/22/33), karmic debt numbers |
| **SavedReadings** | `SavedReadings.tsx` | List of user's saved numerology readings (auth required) |
| **CompatibilityScore** | `CompatibilityScore.tsx` | 100-point score breakdown display |
| **GridComparison** | `GridComparison.tsx` | Side-by-side Lo Shu grid comparison |
| **CompatibilityArrows** | `CompatibilityArrows.tsx` | Arrow harmony analysis for the pair |
| **CompatibilityYogas** | `CompatibilityYogas.tsx` | Shared / complementary Raj Yoga display |

---

## Custom Hooks

### Active Hooks

#### useSavedCharts
**File:** `src/hooks/useSavedCharts.ts`
**Purpose:** Fetch, create, update, delete saved charts from Supabase
**Used by:** ChartClient

**Returns:** `{ charts[], isLoggedIn, loading, error, saveChart(), updateChart(), deleteChart(), refresh() }`

---

#### useDateTimeSync
**File:** `src/hooks/useDateTimeSync.ts`
**Purpose:** Sync date/time picker state with React Hook Form values
**Used by:** BirthDataForm, EditBirthDetailsForm

---

#### useIdleLogout
**File:** `src/hooks/useIdleLogout.ts`
**Purpose:** Auto-logout on user inactivity
**Used by:** ChartClient, Settings page

---

#### use-toast
**File:** `src/hooks/use-toast.ts`
**Purpose:** Toast notification trigger
**Used by:** Toaster component

**Returns:** `{ toast() }`

---

#### useAuth
**File:** `src/hooks/useAuth.ts`
**Purpose:** Session management, user info, sign out
**Used by:** Header.tsx, HoroscopeTeaser, NumerologyClient, CompatibilityClient

**Returns:** `{ user: AuthUser | null, loading, signOut, updateProfile }`

---

### Unused Hooks

#### useVargottama
**File:** `src/hooks/useVargottama.ts`
**Purpose:** Detect vargottama planets (same sign in D1 & D9)
**Status:** Never imported anywhere — candidate for removal

**Returns:** `{ vargottamaPlanets, getVargottamaInsights() }`

---

## API Routes

### Chart Calculation
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/calculate` | Main chart calculation (birth details to full ephemeris) |

### Dasha (Planetary Periods)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/dasha/mahadashas` | All mahadashas in 120-year cycle |
| GET | `/api/dasha/current` | Current mahadasha + balance |
| GET | `/api/dasha/antardasha` | Antardashas for a specific mahadasha |
| GET | `/api/dasha/pratyantar` | Pratyantar dashas |
| GET | `/api/dasha/sookshma` | Sookshma dashas |

### Saturn Transits
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/transits/saturn/sadesati` | Sade Sati analysis (7.5-year Saturn transit) |
| POST | `/api/transits/saturn/period-analysis` | Detailed period analysis |

### Other Calculations
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/avakahada` | Auspicious timing (nakshatra, yoga, karan) |
| GET | `/api/cities/search` | City lookup with timezone |

### Chart Persistence (Authenticated)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/save-chart` | List user's saved charts |
| POST | `/api/save-chart` | Create new saved chart |
| PATCH | `/api/save-chart/[id]` | Update label / is_favorite (clears other favorites when setting new default) |
| DELETE | `/api/save-chart/[id]` | Delete saved chart |

### Panchang
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/panchang` | Full daily panchang (date + lat/lng params); cached in `panchang_cache` table (24h TTL) |
| GET | `/api/panchang/ip-location` | Auto-detect user location from IP for panchang |

### Horoscope
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/horoscope` | Fetch horoscope by type/rashi/sign_type/date; falls back to latest |
| GET | `/api/horoscope/history` | Past N horoscopes (7 daily / 4 weekly / 6 monthly) |
| POST | `/api/horoscope/generate` | Generate all 12 rashis for a type/date — admin only (`ADMIN_SECRET_TOKEN`) |

### Numerology
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/numerology` | List saved readings (auth required) |
| POST | `/api/numerology` | Save a reading (auth required) |
| DELETE | `/api/numerology/[id]` | Delete a saved reading (auth required) |
| GET | `/api/numerology/compatibility` | List saved compatibility readings (auth required) |
| POST | `/api/numerology/compatibility` | Save a compatibility reading (auth required) |
| DELETE | `/api/numerology/compatibility/[id]` | Delete a compatibility reading (auth required) |

### Payment
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/payment/initiate` | Create PhonePe order → returns `checkoutUrl` |
| GET | `/api/payment/status` | Poll order state (`?orderId=xxx`) |
| POST | `/api/payment/webhook` | PhonePe server-to-server payment event notifications |

### User Preferences
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/user/theme` | Read stored theme preference (`null` if unset) |
| PATCH | `/api/user/theme` | Save theme preference to `profiles.theme` |

### Festivals
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/festivals` | Festival calendar data |

### Authentication
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/login` | Email/password login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user info (server-to-server only — do not use in UI) |

### Testing (Admin Only)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/test/history` | Test run history |
| GET | `/api/test/run-calculations` | Run calculation tests |
| DELETE | `/api/test/delete-runs` | Clear test runs |

---

## Unused Components (Dead Code)

These files exist in the codebase but are **not imported or rendered anywhere**:

### UI Components
| Component | File | Notes |
|-----------|------|-------|
| **ScrollArea** | `src/components/ui/scroll-area.tsx` | Installed shadcn/ui component, never imported |

### Chart Components
| Component | File | Notes |
|-----------|------|-------|
| **BirthDetails** | `src/components/chart/BirthDetails.tsx` | Replaced by UserDetailsCard — safe to delete |
| **PlanetDisplay** | `src/components/chart/PlanetDisplay.tsx` | Only imported by HouseBlock (also unused) — safe to delete |

### Landing Components
| Component | File | Notes |
|-----------|------|-------|
| **ZodiacWheel** | `src/components/landing/ZodiacWheel.tsx` | Added Apr 2026, not yet wired to any page — 0 imports |

### Horoscope Components
| Component | File | Notes |
|-----------|------|-------|
| **HistoryNavigator** | `src/components/horoscope/HistoryNavigator.tsx` | History nav is inline in HoroscopeShell — this file is never imported |

### Auth Components
| Component | File | Notes |
|-----------|------|-------|
| **SessionWatcher** | `src/components/auth/SessionWatcher.tsx` | Defined but never mounted in any layout or page |

### Hooks
| Hook | File | Notes |
|------|------|-------|
| **useVargottama** | `src/hooks/useVargottama.ts` | Never imported anywhere — safe to delete |

> **Recommendation:** Remove BirthDetails, PlanetDisplay, HistoryNavigator, and useVargottama. Wire ZodiacWheel to the home page or remove it. Consider mounting SessionWatcher in a protected layout or removing it too.

---

## Usage Guidelines

### Component Best Practices

#### 1. Always Use TypeScript
```tsx
// Good
interface MyComponentProps {
  title: string;
  onClick: () => void;
}

export const MyComponent = ({ title, onClick }: MyComponentProps) => {
  // Component logic
};

// Bad
export const MyComponent = ({ title, onClick }) => {
  // No types
};
```

---

#### 2. Use Server Components by Default
```tsx
// app/page.tsx (Server Component by default)
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// Only add 'use client' when needed
'use client';
export const InteractiveChart = () => {
  const [state, setState] = useState();
  // Client-side logic
};
```

---

#### 3. Memoize Expensive Calculations
```tsx
const houses = useMemo(
  () => buildLagnaHouses(planets, ascendant),
  [planets, ascendant]
);
```

---

### Naming Conventions

- **Components:** PascalCase (`DiamondChart.tsx`)
- **Utilities:** camelCase (`chartHelpers.ts`)
- **Types:** PascalCase (`PlanetData`)
- **Props:** ComponentNameProps (`DiamondChartProps`)

---

### Folder Organization

```
src/components/
├── ui/                    # Generic UI (shadcn/ui)
├── chart/                 # Domain-specific (astrology)
│   ├── diamond/           # Diamond chart rendering
│   ├── divisional/        # Divisional chart features
│   └── sadesati/          # Saturn transit analysis
├── forms/                 # Form components
├── layout/                # Site structure (Header, Footer)
├── landing/               # Landing page features
└── auth/                  # Auth utilities
```

---

## Component Lifecycle

### Creating New Components

1. **Determine Category**
   - UI component > `src/components/ui/`
   - Chart component > `src/components/chart/`
   - Form component > `src/components/forms/`

2. **Create File** (PascalCase filename)

3. **Define Props Interface**
   ```tsx
   interface NewChartProps {
     data: ChartData;
     onUpdate?: (data: ChartData) => void;
   }
   ```

4. **Implement Component**
   ```tsx
   export const NewChart = ({ data, onUpdate }: NewChartProps) => {
     // Implementation
   };
   ```

5. **Document in This File**
   - Add to appropriate category
   - Include props documentation
   - Add usage example

---

## Component Stats

### By Category (Active Only)
- **UI Components:** 16 active (of 17 installed)
- **Chart Components:** 12 active (of 15 files)
- **Form Components:** 5 active (of 5)
- **Layout Components:** 3 active (of 3)
- **Landing Components:** 6 active (of 6)
- **Auth Components:** 5 auth page forms active; SessionWatcher unused
- **Panchang Components:** 20 active (of 20)
- **Horoscope Components:** 8 active (of 8)
- **Numerology Components:** 15 active (of 15)
- **Custom Hooks:** 5 active (of 6)

**Active Total:** 96 components + 5 hooks
**Dead Code:** 7 components + 1 hook

### Dead Code Summary
8 files exist but are never imported: `ScrollArea`, `BirthDetails`, `PlanetDisplay`, `ZodiacWheel`, `HistoryNavigator`, `SessionWatcher`, `useVargottama`

---

## Next Steps

### Recently Completed
- [x] ChartLoader, Logo, StatusBadges, ChartLegend, UserDetailsCard, AvakhadaTable (Feb 2026)
- [x] Full divisional chart set (D1-D60), Toast system, BirthDataFormWrapper (Feb 2026)
- [x] Sade Sati / Dhaiya analysis (SadeSatiTableView + PeriodDetailView) (Mar 2026)
- [x] DashaNavigator multi-level navigator (Mar 2026)
- [x] Panchang module — 20 components (Mar–Apr 2026)
- [x] Horoscope module — 8 components + SSR pages (Mar–Apr 2026)
- [x] Numerology module — 15 components (Apr 2026)
- [x] ChartLabelModal + DeleteChartDialog (Apr 2026)
- [x] Galaxy canvas animation + ZodiacWheel landing components (Apr 2026)
- [x] useAuth hook activated — now used in Header, HoroscopeTeaser, NumerologyClient (Apr 2026)
- [x] Sitemap + robots.txt (Apr 2026)

### To Do
- [ ] Mount SessionWatcher in a protected layout or remove entirely
- [ ] Wire ZodiacWheel to home page or remove it
- [ ] Remove dead code: BirthDetails, PlanetDisplay, HistoryNavigator, useVargottama, scroll-area.tsx
- [ ] ErrorBoundary wrapper for chart components
- [ ] Chart export (PNG/PDF) functionality

---

**Last Updated:** April 25, 2026
**Maintainer:** Aakash + AI Assistants
