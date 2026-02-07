# Component Library

**Version:** 1.0  
**Last Updated:** February 7, 2026  
**Total Components:** 45+

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
- **UI Components** - shadcn/ui primitives (24 components)
- **Chart Components** - Astrology visualization (12 components)
- **Form Components** - Input and validation (4 components)
- **Layout Components** - Page structure (3 components)
- **Utility Components** - Helpers and wrappers (2 components)

### File Structure
```
src/components/
├── ui/              # shadcn/ui base components
├── chart/           # Chart visualization
│   ├── diamond/     # North Indian diamond chart
│   └── divisional/  # Divisional chart components
├── forms/           # Form components
└── layout/          # Header, Footer, Navigation
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
- `Alert` - Alert messages
- `Badge` - Status badges
- `Checkbox` - Checkbox input
- `Collapsible` - Collapsible sections
- `DropdownMenu` - Dropdown menu
- `Label` - Form labels
- `Popover` - Popover content
- `RadioGroup` - Radio button group
- `ScrollArea` - Scrollable area
- `Separator` - Horizontal/vertical divider
- `Sheet` - Slide-out panel
- `Skeleton` - Loading skeleton
- `Switch` - Toggle switch
- `Textarea` - Multi-line text input
- `Toast` - Toast notifications
- `Tooltip` - Tooltip on hover

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

### AvakhadaTable
**File:** `src/components/chart/AvakhadaTable.tsx`  
**Purpose:** Avakahada Chakra (21 attributes)

```typescript
interface AvakhadaTableProps {
  avakhadaData: AvakhadaData;
}
```

**Usage:**
```tsx
import { AvakhadaTable } from '@/components/chart/AvakhadaTable';

<AvakhadaTable avakhadaData={chartData.avakahada} />
```

**Features:**
- 21 birth attributes
- Categorized display
- Tooltips with meanings

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
- D1 (Lagna/Rashi)
- D2 (Hora)
- D3 (Drekkana)
- D7 (Saptamsa)
- D9 (Navamsa)
- D10 (Dasamsa)
- D12 (Dwadasamsa)
- Moon Chart

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

### UserDetailsCard
**File:** `src/components/chart/UserDetailsCard.tsx`  
**Purpose:** Display birth details

```typescript
interface UserDetailsCardProps {
  name: string;
  birthDate: Date;
  birthTime: string;
  birthPlace: string;
  editable?: boolean;
  onEdit?: () => void;
}
```

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

### StatusBadges
**File:** `src/components/chart/StatusBadges.tsx`  
**Purpose:** Display planet status (R, C, D, S)

```typescript
interface StatusBadgesProps {
  retrograde?: boolean;
  combust?: boolean;
  debilitated?: boolean;
  exalted?: boolean;
  subLord?: string;
}
```

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

### EditBirthDetailsForm
**File:** `src/components/forms/EditBirthDetailsForm.tsx`  
**Purpose:** Edit existing birth details

```typescript
interface EditBirthDetailsFormProps {
  initialData: ChartFormData;
  onSubmit: (data: ChartFormData) => void;
  onCancel: () => void;
}
```

**Usage:**
```tsx
import { EditBirthDetailsForm } from '@/components/forms/EditBirthDetailsForm';

<EditBirthDetailsForm 
  initialData={existingData}
  onSubmit={handleUpdate}
  onCancel={handleCancel}
/>
```

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

## 🛠️ Utility Components

### LoadingSpinner
**File:** `src/components/ui/loading-spinner.tsx` (to create)  
**Purpose:** Loading indicator

```tsx
<LoadingSpinner size="sm" | "md" | "lg" />
```

---

### ErrorMessage
**File:** `src/components/ui/error-message.tsx` (to create)  
**Purpose:** Error display

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
- **UI Components:** 24
- **Chart Components:** 12
- **Form Components:** 4
- **Layout Components:** 3
- **Utility Components:** 2

### By Type
- **Server Components:** ~30
- **Client Components:** ~15
- **Hybrid:** ~5

### Bundle Size Contribution
- shadcn/ui: ~80 KB
- Chart components: ~60 KB
- Form components: ~30 KB
- Other: ~40 KB

---

## 🚀 Next Steps

### To Add
- [ ] LoadingSpinner component
- [ ] ErrorMessage component
- [ ] SkeletonLoader component
- [ ] Toast notification system
- [ ] Modal/Dialog wrappers

### To Refactor
- [ ] Extract common HOC for loading/error
- [ ] Consolidate chart components
- [ ] Create shared hooks

---

**Last Updated:** February 7, 2026  
**Next Review:** February 14, 2026  
**Maintainer:** Aakash + AI Assistants
