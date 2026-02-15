# DiamondChart Layout & Font Size Improvements - Task Document

**Created:** February 7, 2026  
**Priority:** Medium  
**Estimated Time:** 2-3 hours  
**Affects:** All charts (D1, D9, D10, Moon, and all divisional charts)

---

## 📋 **Overview**

Improve the DiamondChart component's visual layout with proper font sizing, precise rashi number positioning, and intelligent planet arrangement for crowded houses.

---

## 🎯 **Goals**

1. **Standardize font sizes** for readability
2. **Fix rashi number positions** to exact coordinates
3. **Implement smart planet positioning** based on house occupancy
4. **Handle crowded houses** (3, 5, 6+ planets) elegantly

---

## 📐 **Current State**

### Files Involved:
```
src/components/chart/diamond/
├── DiamondChart.tsx          # Main chart container
├── HouseBlock.tsx            # Individual house rendering
├── PlanetDisplay.tsx         # Planet rendering logic
├── constants.ts              # Chart constants and positions
└── types.ts                  # TypeScript types
```

### Current Issues:
- ❌ Font sizes are inconsistent
- ❌ Rashi numbers are positioned dynamically (not exact)
- ❌ Planets overlap when 3+ in a house
- ❌ No special handling for side triangle houses
- ❌ Degree and status symbols (R, C, D, S) positioning needs work

---

## 🔧 **Required Changes**

### **1. Font Sizes**

#### Planet Names, Arrows (↑↓), and Rashi Numbers
```typescript
// Current: Variable
// Required: 25px (font-size: 1.5625rem or text-2xl in Tailwind)

fontSize: '25px',
fontWeight: 'bold',
```

#### Planet Degrees and Status Symbols (R, C, D, S)
```typescript
// Current: Variable
// Required: 16px (font-size: 1rem or text-base in Tailwind)

fontSize: '16px',
fontWeight: 'normal',
```

#### Special Cases - Crowded Houses
```typescript
// When 5 planets in side triangle houses (2,3,5,6,8,9,11,12):
planetFontSize: '22px',  // Slightly smaller
degreeFontSize: '16px',  // Same
symbolFontSize: '16px',  // Same

// When 6+ planets:
planetFontSize: '18px',  // Much smaller
degreeFontSize: '14px',  // Reduced
symbolFontSize: '14px',  // Reduced
```

---

### **2. Rashi Number Positions**

Fixed coordinates for all 12 houses (viewBox: 600x600):

```typescript
export const RASHI_NUMBER_POSITIONS: Record<number, { x: number; y: number }> = {
  1:  { x: 300, y: 270 },  // Top (12 o'clock)
  2:  { x: 150, y: 120 },  // Top-left triangle
  3:  { x: 110, y: 150 },  // Left triangle
  4:  { x: 270, y: 300 },  // Bottom-left (9 o'clock)
  5:  { x: 110, y: 450 },  // Left-bottom triangle
  6:  { x: 150, y: 480 },  // Bottom triangle
  7:  { x: 300, y: 320 },  // Bottom (6 o'clock)
  8:  { x: 450, y: 480 },  // Bottom-right triangle
  9:  { x: 480, y: 450 },  // Right-bottom triangle
  10: { x: 330, y: 300 },  // Top-right (3 o'clock)
  11: { x: 480, y: 150 },  // Right-top triangle
  12: { x: 450, y: 120 },  // Top triangle
};
```

---

### **3. Planet Positioning Logic**

#### **Base Logic (All Houses)**

For a planet at position `(planetX, planetY)`:

**Degree Position:**
```typescript
degreeX = planetX + 15
degreeY = planetY - 10
```

**Status Symbol Position (R, C, D, S):**
```typescript
// First symbol (e.g., R)
symbolX_first = planetX - 10
symbolY = planetY + 20  // Same Y for all symbols

// Second symbol (e.g., C) - if exists
symbolX_second = symbolX_first + 15

// Third symbol (e.g., D) - if exists
symbolX_third = symbolX_second + 15

// And so on...
```

**Example:**
```
Planet: Mo at (150, 520)
Degree: 20° at (165, 510)  // 150+15, 520-10
Symbols: R at (140, 540)   // 150-10, 520+20
         C at (155, 540)   // 140+15, 520+20
         D at (170, 540)   // 155+15, 520+20
```

---

### **4. Multi-Planet Arrangements**

#### **Classification:**
- **Square houses:** 1, 4, 7, 10 (center squares)
- **Side triangle houses:** 2, 3, 5, 6, 8, 9, 11, 12

#### **2 Planets in a House**

**Side Triangle Houses (3, 5, 9, 11):**
```typescript
// Houses 3, 5 (left triangles)
planet1: { x: 50, y: auto }   // Vertical alignment, left side
planet2: { x: 50, y: auto }   // Below planet 1

// Houses 9, 11 (right triangles)
planet1: { x: 550, y: auto }  // Vertical alignment, right side
planet2: { x: 550, y: auto }  // Below planet 1
```

**Top/Bottom Triangle Houses (2, 6, 8, 12):**
```typescript
// Houses 2, 12 (top triangles)
planet1: { x: auto, y: 80 }   // Horizontal alignment, top
planet2: { x: auto, y: 80 }   // Right of planet 1

// Houses 6, 8 (bottom triangles)
planet1: { x: auto, y: 550 }  // Horizontal alignment, bottom
planet2: { x: auto, y: 550 }  // Right of planet 1
```

**Square Houses (1, 4, 7, 10):**
```typescript
// Houses 1, 7
planet1: { x: auto, y: 150 }  // For house 1
planet2: { x: auto, y: 150 }  // Horizontal alignment
// or
planet1: { x: auto, y: 450 }  // For house 7
planet2: { x: auto, y: 450 }  // Horizontal alignment

// Houses 4, 10
planet1: { x: auto, y: 300 }  // Horizontal alignment
planet2: { x: auto, y: 300 }  // Right of planet 1
```

---

#### **3 Planets in Side Triangle Houses**

Visual arrangement at triangle corners:

```
Example: House 3 (left triangle)
    
    Planet1 (top corner)
   /
  /
 /
Planet2 (left corner)     Planet3 (bottom corner)
```

**Approximate positions for house 3:**
```typescript
planet1: { x: 110, y: 100 }   // Top corner
planet2: { x: 50,  y: 200 }   // Left corner
planet3: { x: 110, y: 300 }   // Bottom corner
```

**Similar logic applies to houses 2, 5, 6, 8, 9, 11, 12** - adjust corners based on triangle orientation.

---

#### **5 Planets in Side Triangle Houses**

Visual arrangement:

```
Example: House 3 (left triangle)

     Planet1 (top)
    /
   /
  Planet2 (middle-top)
 /
Planet3 (left)      Planet4 (middle-bottom)
                    
                    Planet5 (bottom)
```

**Font sizes:**
```typescript
planetName: '22px',    // Reduced from 25px
degree: '16px',        // Same
symbols: '16px',       // Same
```

---

#### **6+ Planets in a House**

**Font sizes:**
```typescript
planetName: '18px',    // Significantly reduced
degree: '14px',        // Reduced
symbols: '14px',       // Reduced
```

**Layout Strategy:**

For **square houses (1, 4, 7, 10):**
```typescript
// Arrange 4 planets on one side, 2+ on the other
// Example for house 1:
// Top row: 4 planets
// Bottom row: remaining planets
```

For **side triangle houses:**

**Houses 6, 8 (bottom triangles):**
```typescript
// Arrange 4 planets at the bottom edge
bottomRow: [planet1, planet2, planet3, planet4]
topArea: [planet5, planet6, ...]
```

**Houses 1, 12 (top triangles):**
```typescript
// Arrange 4 planets at the top edge
topRow: [planet1, planet2, planet3, planet4]
bottomArea: [planet5, planet6, ...]
```

**Houses 3, 5 (left triangles):**
```typescript
// Arrange 4 planets vertically on the left
leftColumn: [planet1, planet2, planet3, planet4]
rightArea: [planet5, planet6, ...]
```

**Houses 9, 11 (right triangles):**
```typescript
// Arrange 4 planets vertically on the right
rightColumn: [planet1, planet2, planet3, planet4]
leftArea: [planet5, planet6, ...]
```

---

## 🛠️ **Implementation Steps**

### **Step 1: Update Constants**

File: `src/components/chart/diamond/constants.ts`

```typescript
// Add new constants
export const FONT_SIZES = {
  planet: {
    normal: 25,      // px
    crowded5: 22,    // px - for 5 planets in side triangles
    crowded6plus: 18 // px - for 6+ planets
  },
  degree: {
    normal: 16,      // px
    crowded6plus: 14 // px - for 6+ planets
  },
  symbol: {
    normal: 16,      // px
    crowded6plus: 14 // px - for 6+ planets
  },
  rashiNumber: 25    // px
};

export const RASHI_NUMBER_POSITIONS: Record<number, { x: number; y: number }> = {
  1:  { x: 300, y: 270 },
  2:  { x: 150, y: 120 },
  3:  { x: 110, y: 150 },
  4:  { x: 270, y: 300 },
  5:  { x: 110, y: 450 },
  6:  { x: 150, y: 480 },
  7:  { x: 300, y: 320 },
  8:  { x: 450, y: 480 },
  9:  { x: 480, y: 450 },
  10: { x: 330, y: 300 },
  11: { x: 480, y: 150 },
  12: { x: 450, y: 120 },
};

// Helper to determine house type
export const HOUSE_TYPES = {
  square: [1, 4, 7, 10],
  topTriangle: [2, 12],
  bottomTriangle: [6, 8],
  leftTriangle: [3, 5],
  rightTriangle: [9, 11]
};

export function getHouseType(houseNumber: number): 'square' | 'triangle' {
  return HOUSE_TYPES.square.includes(houseNumber) ? 'square' : 'triangle';
}

export function getTriangleOrientation(houseNumber: number): 'top' | 'bottom' | 'left' | 'right' | null {
  if (HOUSE_TYPES.topTriangle.includes(houseNumber)) return 'top';
  if (HOUSE_TYPES.bottomTriangle.includes(houseNumber)) return 'bottom';
  if (HOUSE_TYPES.leftTriangle.includes(houseNumber)) return 'left';
  if (HOUSE_TYPES.rightTriangle.includes(houseNumber)) return 'right';
  return null;
}
```

---

### **Step 2: Create Planet Layout Calculator**

File: `src/components/chart/diamond/planetLayoutCalculator.ts` (NEW FILE)

```typescript
import { FONT_SIZES, getHouseType, getTriangleOrientation } from './constants';
import type { PlanetPosition } from './types';

export interface PlanetLayout {
  x: number;
  y: number;
  fontSize: number;
  degreeOffset: { x: number; y: number };
  symbolStartOffset: { x: number; y: number };
  symbolSpacing: number;
}

/**
 * Calculate planet positions for a house based on planet count
 */
export function calculatePlanetLayouts(
  houseNumber: number,
  planetCount: number,
  basePositions: { x: number; y: number }[]
): PlanetLayout[] {
  const houseType = getHouseType(houseNumber);
  const triangleOrientation = getTriangleOrientation(houseNumber);
  
  // Determine font size based on count
  const fontSize = getFontSize(planetCount, houseType === 'triangle');
  
  if (planetCount === 1) {
    return [createSinglePlanetLayout(basePositions[0], fontSize)];
  }
  
  if (planetCount === 2) {
    return createTwoPlanetLayout(houseNumber, triangleOrientation, fontSize);
  }
  
  if (planetCount === 3 && houseType === 'triangle') {
    return createThreePlanetTriangleLayout(houseNumber, triangleOrientation, fontSize);
  }
  
  if (planetCount === 5 && houseType === 'triangle') {
    return createFivePlanetTriangleLayout(houseNumber, triangleOrientation, fontSize);
  }
  
  if (planetCount >= 6) {
    return createSixPlusPlanetLayout(houseNumber, triangleOrientation, fontSize, planetCount);
  }
  
  // Default: distribute evenly
  return createDefaultLayout(basePositions, fontSize);
}

function getFontSize(planetCount: number, isTriangle: boolean): number {
  if (planetCount >= 6) return FONT_SIZES.planet.crowded6plus;
  if (planetCount === 5 && isTriangle) return FONT_SIZES.planet.crowded5;
  return FONT_SIZES.planet.normal;
}

function createSinglePlanetLayout(
  position: { x: number; y: number },
  fontSize: number
): PlanetLayout {
  return {
    x: position.x,
    y: position.y,
    fontSize,
    degreeOffset: { x: 15, y: -10 },
    symbolStartOffset: { x: -10, y: 20 },
    symbolSpacing: 15
  };
}

function createTwoPlanetLayout(
  houseNumber: number,
  orientation: 'top' | 'bottom' | 'left' | 'right' | null,
  fontSize: number
): PlanetLayout[] {
  // Implement based on specification above
  // Houses 3, 5: x = 50, vertical
  // Houses 9, 11: x = 550, vertical
  // Houses 2, 12: y = 80, horizontal
  // Houses 6, 8: y = 550, horizontal
  // Houses 1, 4, 7, 10: specific logic
  
  // TODO: Implement detailed positioning
  return [];
}

function createThreePlanetTriangleLayout(
  houseNumber: number,
  orientation: 'top' | 'bottom' | 'left' | 'right' | null,
  fontSize: number
): PlanetLayout[] {
  // Position at triangle corners
  // TODO: Implement based on house number
  return [];
}

function createFivePlanetTriangleLayout(
  houseNumber: number,
  orientation: 'top' | 'bottom' | 'left' | 'right' | null,
  fontSize: number
): PlanetLayout[] {
  // Special 5-planet arrangement
  // TODO: Implement
  return [];
}

function createSixPlusPlanetLayout(
  houseNumber: number,
  orientation: 'top' | 'bottom' | 'left' | 'right' | null,
  fontSize: number,
  planetCount: number
): PlanetLayout[] {
  // 4 planets on main edge, rest in remaining space
  // TODO: Implement
  return [];
}

function createDefaultLayout(
  positions: { x: number; y: number }[],
  fontSize: number
): PlanetLayout[] {
  return positions.map(pos => createSinglePlanetLayout(pos, fontSize));
}

/**
 * Calculate exact position for degree text relative to planet
 */
export function calculateDegreePosition(
  planetX: number,
  planetY: number
): { x: number; y: number } {
  return {
    x: planetX + 15,
    y: planetY - 10
  };
}

/**
 * Calculate positions for status symbols (R, C, D, S)
 */
export function calculateSymbolPositions(
  planetX: number,
  planetY: number,
  symbolCount: number
): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  const startX = planetX - 10;
  const y = planetY + 20;
  
  for (let i = 0; i < symbolCount; i++) {
    positions.push({
      x: startX + (i * 15),
      y: y
    });
  }
  
  return positions;
}
```

---

### **Step 3: Update HouseBlock Component**

File: `src/components/chart/diamond/HouseBlock.tsx`

**Changes needed:**

1. Import new constants and layout calculator
2. Use `RASHI_NUMBER_POSITIONS` for exact rashi positioning
3. Call `calculatePlanetLayouts()` for planet arrangement
4. Apply correct font sizes from `FONT_SIZES`

```typescript
// Example update
import { RASHI_NUMBER_POSITIONS, FONT_SIZES } from './constants';

// In render:
const rashiPos = RASHI_NUMBER_POSITIONS[houseNumber];

<text
  x={rashiPos.x}
  y={rashiPos.y}
  fontSize={FONT_SIZES.rashiNumber}
  fontWeight="bold"
  // ... other props
>
  {rasiNumber}
</text>
```

---

### **Step 4: Update PlanetDisplay Component**

File: `src/components/chart/diamond/PlanetDisplay.tsx`

**Changes needed:**

1. Accept `layout: PlanetLayout` prop from HouseBlock
2. Use layout positions for degree and symbols
3. Apply correct font sizes

```typescript
interface PlanetDisplayProps {
  planet: PlanetInHouse;
  layout: PlanetLayout;  // NEW
  // ... other props
}

// Use layout.fontSize for planet name
// Use layout.degreeOffset for degree position
// Use layout.symbolStartOffset and layout.symbolSpacing for symbols
```

---

### **Step 5: Update DiamondChart Component**

File: `src/components/chart/diamond/DiamondChart.tsx`

**Changes needed:**

1. Pass planet count to HouseBlock
2. Ensure proper coordination between all components

```typescript
<HouseBlock
  house={house}
  planetCount={house.planets.length}  // NEW
  // ... other props
/>
```

---

## ✅ **Testing Checklist**

### **Visual Tests**

Test with these scenarios:

**1. Single Planet:**
- [ ] Font size is 25px for planet name
- [ ] Degree is 16px
- [ ] Symbols (R, C, D, S) are 16px
- [ ] Positions follow formula: degree at +15x, -10y

**2. Two Planets:**
- [ ] House 3: Both at x=50, vertical
- [ ] House 9: Both at x=550, vertical
- [ ] House 2: Both at y=80, horizontal
- [ ] House 6: Both at y=550, horizontal
- [ ] House 1: Both at y=150, horizontal
- [ ] House 7: Both at y=450, horizontal

**3. Three Planets (Triangle Houses):**
- [ ] Positioned at triangle corners
- [ ] No overlap
- [ ] All text readable

**4. Five Planets (Triangle Houses):**
- [ ] Font size reduced to 22px for planets
- [ ] Degree and symbols remain 16px
- [ ] All planets fit within triangle

**5. Six+ Planets:**
- [ ] Font size reduced to 18px for planets
- [ ] Degree and symbols reduced to 14px
- [ ] 4 planets on main edge (houses 6,8,1,12,3,5,9,11)
- [ ] Remaining planets in available space

**6. Rashi Numbers:**
- [ ] All 12 houses have correct positions
- [ ] Font size is 25px
- [ ] Not overlapping with planets

---

## 🧪 **Test Cases**

Create test birth charts with:

1. **Empty houses** - verify rashi numbers only
2. **All houses with 1 planet** - verify standard layout
3. **House 3 with 3 planets** - verify triangle corners
4. **House 6 with 5 planets** - verify reduced font + layout
5. **House 10 with 7 planets** - verify crowded house handling
6. **Retrograde planets** with R, C, D symbols - verify symbol spacing

---

## 📝 **Implementation Notes**

### **Challenges to Expect:**

1. **SVG coordinate system** - Y increases downward
2. **Text anchoring** - Use `text-anchor="middle"` or adjust x positions
3. **Overlapping prevention** - May need slight adjustments to formulas
4. **Responsive sizing** - Ensure positions scale with viewBox
5. **Long planet names** - May need truncation or wrapping

### **Edge Cases:**

- [ ] All 9 planets in one house (unlikely but possible)
- [ ] Very long status symbol combinations (R+C+D+S)
- [ ] Planet names of different lengths
- [ ] Different viewBox sizes (if you ever change from 600x600)

---

## 🚀 **Deployment Plan**

1. **Implement on dev branch**
2. **Test thoroughly with various birth charts**
3. **Visual QA on mobile and desktop**
4. **Deploy to staging** (if available)
5. **Get user feedback**
6. **Deploy to production**

---

## 📚 **Reference Images**

User provided screenshots showing:
- ✅ 3 planets in triangle layout
- ✅ 5 planets in triangle layout
- ✅ Side-by-side planet arrangement

These images are the source of truth for visual requirements.

---

## 🎯 **Success Criteria**

- [ ] All font sizes match specification exactly
- [ ] Rashi numbers at exact coordinates
- [ ] Planets don't overlap in any scenario
- [ ] Layout matches reference images
- [ ] Works on mobile and desktop
- [ ] No regressions in existing charts
- [ ] Performance remains acceptable (no lag when rendering)

---

## 📊 **Priority Breakdown**

**Must Have (P0):**
- Font sizes (planet: 25px, degree: 16px, symbol: 16px)
- Rashi number positions
- Degree and symbol positioning formula

**Should Have (P1):**
- 2-planet alignment logic
- 3-planet triangle corners
- 5-planet special layout

**Nice to Have (P2):**
- 6+ planet crowded house handling
- Ultra-smooth animations
- Accessibility improvements

---

## 💡 **Future Enhancements**

After this task is complete, consider:

1. **Dynamic text sizing** - Auto-shrink based on available space
2. **Planet tooltips** - Hover for full details
3. **Drag & drop** - Rearrange planets manually (advanced)
4. **Color coding** - Different colors for benefic/malefic
5. **Animation** - Smooth transitions when switching charts

---

**END OF TASK DOCUMENT**

---

**Next Steps:**
1. Review this document
2. Ask clarifying questions if needed
3. Implement in phases (P0 → P1 → P2)
4. Test thoroughly before deployment

**Estimated Timeline:**
- Phase 1 (P0): 1-2 hours
- Phase 2 (P1): 1-2 hours
- Phase 3 (P2): 2-4 hours
- **Total: 4-8 hours** depending on complexity
