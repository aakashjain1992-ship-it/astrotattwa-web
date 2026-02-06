'use client';

import { cn } from '@/lib/utils';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface AvakhadaData {
  // Core Info
  rasiSign?: string;
  rasiLord?: string;
  nakshatraCharan?: string;      // "Mula - 1" format
  nakshatra?: string;            // Alternate field name
  nakshatraPada?: number;
  nakshatraLord?: string;
  yoga?: string;
  karan?: string;
  
  // Matching Info
  gana?: string;
  yoni?: string;
  nadi?: string;
  varan?: string;
  vashya?: string;
  
  // Other
  nameAlphabet?: string;
  sunSignWestern?: string;
  
  // Additional fields that might be present
  ascendantSign?: string;
  ascendantLord?: string;
  varga?: string;
  yunja?: string;
  hansak?: string;
  payaRasi?: string;
  payaNakshatra?: string;
}

interface AvakhadaTableProps {
  /** Avakahada data object */
  data: AvakhadaData;
  /** Layout variant */
  variant?: 'full' | 'compact';
  /** Additional className */
  className?: string;
}

// ============================================
// HELPER COMPONENTS
// ============================================

function AttributeRow({ 
  label, 
  value 
}: { 
  label: string; 
  value: string | undefined;
}) {
  if (!value) return null;
  
  return (
    <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function SectionCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-lg border border-border bg-card p-4', className)}>
      <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
        {title}
      </h4>
      <div>{children}</div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * AvakhadaTable - Displays Vedic birth attributes
 * 
 * Groups:
 * - Core Info: Rasi, Nakshatra, Yoga, Karan
 * - Matching Info: Gana, Yoni, Nadi, Varan, Vashya
 * - Other: Name Alphabet, Western Sun Sign
 * 
 * Usage:
 * ```tsx
 * <AvakhadaTable data={chartData.avakahada} />
 * ```
 */
export function AvakhadaTable({
  data,
  variant = 'full',
  className,
}: AvakhadaTableProps) {
  // Format nakshatra display
  const getNakshatraDisplay = () => {
    if (data.nakshatraCharan) return data.nakshatraCharan;
    if (data.nakshatra && data.nakshatraPada) {
      return `${data.nakshatra} - ${data.nakshatraPada}`;
    }
    return data.nakshatra || '-';
  };

  // Format Rasi display
  const getRasiDisplay = () => {
    if (data.rasiSign && data.rasiLord) {
      return `${data.rasiSign} (${data.rasiLord})`;
    }
    return data.rasiSign || '-';
  };

  if (variant === 'compact') {
    // Compact single-column layout
    return (
      <div className={cn('rounded-lg border border-border bg-card p-4', className)}>
        <h3 className="text-lg font-semibold mb-4">Avakahada Chakra</h3>
        
        <div className="space-y-0">
          <AttributeRow label="Rasi" value={getRasiDisplay()} />
          <AttributeRow label="Nakshatra" value={getNakshatraDisplay()} />
          <AttributeRow label="Nakshatra Lord" value={data.nakshatraLord} />
          <AttributeRow label="Yoga" value={data.yoga} />
          <AttributeRow label="Karan" value={data.karan} />
          <AttributeRow label="Gana" value={data.gana} />
          <AttributeRow label="Yoni" value={data.yoni} />
          <AttributeRow label="Nadi" value={data.nadi} />
          <AttributeRow label="Varan" value={data.varan} />
          <AttributeRow label="Vashya" value={data.vashya} />
          <AttributeRow label="Name Alphabet" value={data.nameAlphabet} />
          <AttributeRow label="Sun Sign (Western)" value={data.sunSignWestern} />
        </div>
      </div>
    );
  }

  // Full two-column grouped layout
  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Core Info */}
        <SectionCard title="Core Info">
          <AttributeRow label="Rasi" value={data.rasiSign} />
          <AttributeRow label="Rasi Lord" value={data.rasiLord} />
          <AttributeRow label="Nakshatra" value={getNakshatraDisplay()} />
          <AttributeRow label="Nakshatra Lord" value={data.nakshatraLord} />
          <AttributeRow label="Yoga" value={data.yoga} />
          <AttributeRow label="Karan" value={data.karan} />
        </SectionCard>

        {/* Matching Info */}
        <SectionCard title="Matching Info">
          <AttributeRow label="Gana" value={data.gana} />
          <AttributeRow label="Yoni" value={data.yoni} />
          <AttributeRow label="Nadi" value={data.nadi} />
          <AttributeRow label="Varan" value={data.varan} />
          <AttributeRow label="Vashya" value={data.vashya} />
        </SectionCard>
      </div>

      {/* Other Info - Full width */}
      <SectionCard title="Other">
        <div className="grid grid-cols-2 gap-4">
          <AttributeRow label="Name Alphabet" value={data.nameAlphabet} />
          <AttributeRow label="Sun Sign (Western)" value={data.sunSignWestern} />
        </div>
      </SectionCard>
    </div>
  );
}

/**
 * Compact version for mobile sub-tabs
 */
export function AvakhadaTableCompact({
  data,
  className,
}: {
  data: AvakhadaData;
  className?: string;
}) {
  return <AvakhadaTable data={data} variant="compact" className={className} />;
}
