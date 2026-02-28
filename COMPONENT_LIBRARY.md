# Component Library

**Version:** 1.1  
**Last Updated:** February 28, 2026  
**Total Components:** 60+

---

## 📋 Table of Contents

- [Overview](#overview)
- [UI Components](#ui-components)
- [Chart Components](#chart-components)
- [Form Components](#form-components)
- [Layout Components](#layout-components)
- [Utility Components](#utility-components)
- [Usage Guidelines](#usage-guidelines)

---

## 🎯 Overview

This document catalogs all reusable components in the Astrotattwa codebase. Each component includes props documentation, usage examples, and best practices.

### Component Categories
- **UI Components** - shadcn/ui primitives + custom (28 components)
- **Chart Components** - Astrology visualization (20 components)
- **Form Components** - Input and validation (5 components)
- **Layout Components** - Page structure (4 components)
- **Landing Components** - Landing page features (4 components)
- **Auth Components** - Authentication utilities (1 component)

### File Structure
```
src/components/
├── ui/              # shadcn/ui base components + custom UI
├── chart/           # Chart visualization
│   ├── diamond/     # North Indian diamond chart
│   └── divisional/  # Divisional chart components
├── forms/           # Form components
├── layout/          # Header, Footer, Navigation
├── landing/         # Landing page components
└── auth/            # Authentication components
```

---

## 🎨 UI Components (shadcn/ui)

### Base Components from shadcn/ui

#### Button
**File:** `src/components/ui/button.tsx`  
**Purpose:** Reusable button with variants

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

#### Table
**File:** `src/components/ui/table.tsx`  
**Purpose:** Data table display

**Usage:**
```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Header 1</TableHead>
      <TableHead>Header 2</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Cell 1</TableCell>
      <TableCell>Cell 2</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

#### Tabs
**File:** `src/components/ui/tabs.tsx`  
**Purpose:** Tabbed interface

**Usage:**
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    Tab 1 content
  </TabsContent>
  <TabsContent value="tab2">
    Tab 2 content
  </TabsContent>
</Tabs>
```

---

#### Dialog
**File:** `src/components/ui/dialog.tsx`  
**Purpose:** Modal dialog

**Usage:**
```tsx
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

---

### Other shadcn/ui Components Available
- `Accordion` - Collapsible sections with headers
- `Alert` - Alert messages
- `Badge` - Status badges
- `Checkbox` - Checkbox input
- `Collapsible` - Collapsible sections
- `DropdownMenu` - Dropdown menu
- `Label` - Form labels
- `Popover` - Popover content
- `Progress` - Progress bar indicator
- `RadioGroup` - Radio button group
- `ScrollArea` - Scrollable area with custom scrollbar
- `Separator` - Horizontal/vertical divider
- `Sheet` - Slide-out panel
- `Skeleton` - Loading skeleton
- `Switch` - Toggle switch
- `Textarea` - Multi-line text input
- `Toast` - Toast notifications
- `Toaster` - Toast notification container
- `Tooltip` - Tooltip on hover

---

### Custom UI Components

#### ChartLoader
**File:** `src/components/ui/ChartLoader.tsx`  
**Purpose:** Full-screen loading overlay for chart calculations

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

## 📊 Chart Components

### DiamondChart
**File:** `src/components/chart/diamond/DiamondChart.tsx`  
**Purpose:** Main North Indian diamond chart visualization

```typescript
interface DiamondChartProps {
  houses: HouseData[];
  width?: number;
  height?: number;
  showAscendantMarker?: boolean;
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

### DiamondGrid
**File:** `src/components/chart/diamond/DiamondGrid.tsx`  
**Purpose:** Diamond shape grid with 12 houses

```typescript
interface DiamondGridProps {
  width: number;
  height: number;
  strokeColor?: string;
  strokeWidth?: number;
}
```

**Usage:**
```tsx
import { DiamondGrid } from '@/components/chart/diamond/DiamondGrid';

<DiamondGrid 
  width={400}
  height={400}
  strokeColor="currentColor"
  strokeWidth={1}
/>
```

**Features:**
- Perfect diamond geometry
- 12 house divisions (4 triangles, 8 rectangles)
- Customizable stroke

---

### HouseBlock
**File:** `src/components/chart/HouseBlock.tsx`  
**Purpose:** Individual house with planets

```typescript
interface HouseBlockProps {
  house: HouseData;
  position: { x: number; y: number; width: number; height: number };
  isTriangle?: boolean;
  onPlanetClick?: (planetKey: string) => void;
}
```

**Usage:**
```tsx
import { HouseBlock } from '@/components/chart/HouseBlock';

<HouseBlock 
  house={houseData}
  position={{ x: 100, y: 100, width: 80, height: 60 }}
  isTriangle={false}
  onPlanetClick={handleClick}
/>
```

**Features:**
- Planet stacking (up to 6 planets)
- Rashi number display
- Status symbols
- Click handling

---

### PlanetDisplay
**File:** `src/components/chart/PlanetDisplay.tsx`  
**Purpose:** Display single planet with status

```typescript
interface PlanetDisplayProps {
  planetKey: string;
  degreeInSign: number;
  retrograde?: boolean;
  combust?: boolean;
  exalted?: boolean;
  debilitated?: boolean;
  subLord?: string;
  size?: 'sm' | 'md' | 'lg';
}
```

**Usage:**
```tsx
import { PlanetDisplay } from '@/components/chart/PlanetDisplay';

<PlanetDisplay 
  planetKey="Moon"
  degreeInSign={15.5}
  retrograde={false}
  combust={false}
  size="md"
/>
```

**Output:** `Mo 15° RC` (if retrograde & combust)

---

### PlanetaryTable
**File:** `src/components/chart/PlanetaryTable.tsx`  
**Purpose:** Table of all planetary positions

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
- Sign names
- Degrees
- Nakshatra & Pada
- Status flags
- Sub-lord (KP)

---

### UserDetailsCard
**File:** `src/components/chart/UserDetailsCard.tsx`  
**Purpose:** Display user's birth details with edit toggle

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

### StatusBadges
**File:** `src/components/chart/StatusBadges.tsx`  
**Purpose:** Display planet status flags as badges

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

### ChartLegend
**File:** `src/components/chart/ChartLegend.tsx`  
**Purpose:** Display chart symbol legend and status flags explanation

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
- Planet symbols and names (☉ Surya, ☽ Chandra, etc.)
- Status flags explanation (R, C, D, S)
- Dignity indicators (Exalted, Debilitated, etc.)
- Two variants: sidebar (always visible) and accordion (collapsible)
- Dark mode support

---

### AvakhadaTable
**File:** `src/components/chart/AvakhadaTable.tsx`  
**Purpose:** Display Panchang details and matching information

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
- Label-value pairs with proper spacing

---

### DashaNavigator
**File:** `src/components/chart/DashaNavigator.tsx`  
**Purpose:** Interactive Vimshottari Dasha timeline

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
- 4-level hierarchy (Maha → Antar → Pratyantar → Sookshma)
- Current dasha highlighting
- Expandable/collapsible
- Date ranges

---

### DivisionalChartsTab
**File:** `src/components/chart/divisional/DivisionalChartsTab.tsx`  
**Purpose:** Tab interface for divisional charts

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
- AI-powered insights
- Chart visualization

---

### ChartSelector
**File:** `src/components/chart/divisional/ChartSelector.tsx`  
**Purpose:** Dropdown to select divisional chart

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

### ChartEducation
**File:** `src/components/chart/divisional/ChartEducation.tsx`  
**Purpose:** Educational content for each chart

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

### ChartInsights
**File:** `src/components/chart/divisional/ChartInsights.tsx`  
**Purpose:** AI-generated insights (future)

```typescript
interface ChartInsightsProps {
  chartType: DivisionalChartType;
  houses: HouseData[];
  planets: Record<string, PlanetData>;
}
```

**Status:** Placeholder for P4 (AI Insights)

---

### ChartFocusMode
**File:** `src/components/chart/ChartFocusMode.tsx`  
**Purpose:** Fullscreen swipeable chart view

```typescript
interface ChartFocusModeProps {
  isOpen: boolean;
  onClose: () => void;
  initialChart: DivisionalChartType;
  chartData: ChartData;
}
```

**Features:**
- Swipeable navigation
- Fullscreen overlay
- All divisional charts
- Keyboard shortcuts (←/→)

---

### AscendantCard
**File:** `src/components/chart/AscendantCard.tsx`  
**Purpose:** Display ascendant information

```typescript
interface AscendantCardProps {
  ascendant: AscendantData;
}
```

---

### BirthDetails
**File:** `src/components/chart/BirthDetails.tsx`  
**Purpose:** Compact birth details display component

**Features:**
- Displays name, date, time, place
- Compact format for chart pages
- Mobile-responsive

---

## 📝 Form Components

### BirthDataForm
**File:** `src/components/forms/BirthDataForm.tsx`  
**Purpose:** Main form to create birth chart

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
**Refactored:** February 14, 2026 — now uses `DateTimeField` (same as home form)

```typescript
interface EditBirthDetailsFormProps {
  isOpen: boolean;
  currentData: {
    name: string;
    gender?: 'male' | 'female';
    localDateTime: string;   // "YYYY-MM-DDTHH:mm" or "YYYY-MM-DD HH:mm"
    latitude: number;
    longitude: number;
    timezone: string;
    cityName?: string;
  };
  onSubmit: (data: {
    name: string;
    gender: 'male' | 'female';
    birthDate: string;        // YYYY-MM-DD
    birthTime: string;        // HH:MM
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
- Uses `DateTimeField` (shared with home form — no duplicate calendar UI)
- Pre-filled from `currentData.localDateTime` via `parseDateTime` utility
- `syncDateTimeToForm` pattern identical to BirthDataForm
- Collapsible (hidden when `isOpen` is false)

---

### DateTimeField
**File:** `src/components/forms/DateTimeField.tsx`  
**Purpose:** Combined date + time picker (12-hour AM/PM)

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
- Calendar popup
- 12-hour format
- AM/PM toggle
- Validation

---

### CitySearch
**File:** `src/components/forms/CitySearch.tsx`  
**Purpose:** City autocomplete with coordinates

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

### Form Utilities (Added Feb 14, 2026)

#### parseDateTime
**File:** `src/lib/utils/parseDateTime.ts`  
**Purpose:** Parse `localDateTime` string → `DateTimeValue` for use with `DateTimeField`

```typescript
import { parseDateTime } from '@/lib/utils/parseDateTime'

// Handles ISO, "YYYY-MM-DD HH:mm", date-only
const dtValue = parseDateTime('1992-03-25T11:55:00')
// → { date: Date, hour: '11', minute: '55', period: 'AM' }
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

## 🏗️ Layout Components

### Header
**File:** `src/components/layout/Header.tsx`  
**Purpose:** Site header with navigation

```typescript
interface HeaderProps {
  user?: User | null;
}
```

**Features:**
- Logo
- Navigation links
- Login/Signup buttons
- Theme toggle

---

### Footer
**File:** `src/components/layout/Footer.tsx`  
**Purpose:** Site footer

**Content:**
- Links (About, Privacy, Terms)
- Social media
- Copyright

---

### ThemeToggle
**File:** `src/components/layout/ThemeToggle.tsx`  
**Purpose:** Dark/Light mode toggle

```tsx
import { ThemeToggle } from '@/components/layout/ThemeToggle';

<ThemeToggle />
```

---

### ThemeProvider
**File:** `src/components/theme-provider.tsx`  
**Purpose:** Context provider for dark/light mode theme

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
- Uses next-themes
- System preference detection
- Persistent theme storage
- Context for theme state

---

## 🔐 Auth Components

### SessionWatcher
**File:** `src/components/auth/SessionWatcher.tsx`  
**Purpose:** Monitor authentication state and handle session changes

```typescript
interface SessionWatcherProps {
  // No props - automatically handles auth state
}
```

**Usage:**
```tsx
import { SessionWatcher } from '@/components/auth/SessionWatcher';

// In protected pages or layouts
<SessionWatcher />
```

**Features:**
- Listens to Supabase auth state changes
- Redirects to login when session expires
- Handles SIGNED_OUT events
- Tab synchronization (signs out across tabs)
- Automatic cleanup on unmount

---

## 🎨 Landing Components

### NavagrahaSection
**File:** `src/components/landing/NavagrahaSection.tsx`  
**Purpose:** Interactive section displaying 9 planetary deities

**Features:**
- Animated planet cards with Unicode symbols (☉, ☽, ♂, ☿, ♃, ♀, ♄, ☊, ☋)
- Detailed descriptions for each planet
- Key points and tags for each planet
- Smooth hover animations
- Dark mode support
- Mobile-responsive layout

---

### Yantra
**File:** `src/components/landing/Yantra.tsx`  
**Purpose:** Animated sacred geometry visualization

**Features:**
- SVG-based yantra illustration
- Rotation and glow animations
- Geometric patterns
- Uses framer-motion for animations

---

### Particles
**File:** `src/components/landing/Particles.tsx`  
**Purpose:** Animated particle background effect

**Features:**
- Canvas-based particle animation
- Floating particles with connections
- Performance optimized
- Responsive to viewport size

---

### Glyphs
**File:** `src/components/landing/Glyphs.tsx`  
**Purpose:** Decorative astrological glyphs

**Features:**
- Zodiac and planetary symbols
- Animated appearance
- Decorative background elements

---

## 🛠️ Utility Components

### ChartLoader
See [Custom UI Components](#chartloader) section above.

### LoadingSpinner
**Status:** Can be created using shadcn/ui Skeleton or custom spinner

---

### ErrorMessage
**Status:** Can be created using shadcn/ui Alert component

```tsx
<ErrorMessage message="Something went wrong" />
```

---

## 📖 Usage Guidelines

### Component Best Practices

#### 1. **Always Use TypeScript**
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

#### 2. **Use Server Components by Default**
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

#### 3. **Memoize Expensive Calculations**
```tsx
const houses = useMemo(
  () => buildLagnaHouses(planets, ascendant),
  [planets, ascendant]
);
```

---

#### 4. **Use Proper Error Boundaries**
```tsx
<ChartErrorBoundary>
  <DiamondChart houses={houses} />
</ChartErrorBoundary>
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
│   ├── diamond/           # Grouped by feature
│   └── divisional/
├── forms/                 # Grouped by purpose
└── layout/                # Site structure
```

---

## 🔄 Component Lifecycle

### Creating New Components

1. **Determine Category**
   - UI component → `src/components/ui/`
   - Chart component → `src/components/chart/`
   - Form component → `src/components/forms/`

2. **Create File**
   ```bash
   # PascalCase filename
   touch src/components/chart/NewChart.tsx
   ```

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

5. **Export from Index** (optional)
   ```tsx
   // src/components/chart/index.ts
   export { NewChart } from './NewChart';
   ```

6. **Document in This File**
   - Add to appropriate category
   - Include props documentation
   - Add usage example

---

## 📊 Component Stats

### By Category
- **UI Components:** 28 (19 shadcn/ui + 9 custom including ChartLoader, Logo, etc.)
- **Chart Components:** 20 (DiamondChart, PlanetaryTable, DashaNavigator, UserDetailsCard, StatusBadges, ChartLegend, AvakhadaTable, AscendantCard, BirthDetails, ChartFocusMode, NorthIndianChart, PlanetDisplay, HouseBlock, DiamondGrid + 6 divisional components)
- **Form Components:** 5 (BirthDataForm, BirthDataFormWrapper, EditBirthDetailsForm, DateTimeField, CitySearch)
- **Layout Components:** 4 (Header, Footer, ThemeToggle, ThemeProvider)
- **Landing Components:** 4 (NavagrahaSection, Yantra, Particles, Glyphs)
- **Auth Components:** 1 (SessionWatcher)

**Total:** 62 components

### By Type
- **Server Components:** ~35
- **Client Components:** ~25
- **Hybrid:** ~2

### Bundle Size Contribution (Estimated)
- shadcn/ui: ~90 KB
- Chart components: ~80 KB
- Form components: ~35 KB
- Landing components: ~25 KB
- Other: ~20 KB
- **Total:** ~250 KB

---

## 🚀 Next Steps

### Recently Completed ✅
- [x] ChartLoader component (Feb 2026)
- [x] Logo component (Feb 2026)
- [x] Landing page components (Feb 2026)
- [x] SessionWatcher auth component (Feb 2026)
- [x] StatusBadges component (Feb 2026)
- [x] ChartLegend component (Feb 2026)
- [x] UserDetailsCard component (Feb 2026)
- [x] AvakhadaTable component (Feb 2026)
- [x] Full divisional chart set (D1-D60) (Feb 2026)
- [x] Toast notification system (Feb 2026)
- [x] BirthDataFormWrapper (Feb 2026)

### To Add
- [ ] ErrorBoundary wrapper for charts
- [ ] SkeletonLoader variations for different components
- [ ] Modal/Dialog wrappers for common patterns
- [ ] Chart export (PNG/PDF) functionality
- [ ] Print-friendly chart layouts

### To Refactor
- [ ] Extract common HOC for loading/error states
- [ ] Consolidate duplicate chart styling logic
- [ ] Create shared hooks for chart interactions
- [ ] Optimize bundle size (lazy loading improvements)

---

**Last Updated:** February 28, 2026  
**Next Review:** March 7, 2026  
**Maintainer:** Aakash + AI Assistants
