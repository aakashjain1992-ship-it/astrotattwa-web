'use client';

import { cn } from '@/lib/utils';
import { Star, ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DIVISIONAL_CHARTS,
  type DivisionalChartInfo,
  type ChartImportance
} from './DivisionalChartConfig';
import { useState } from 'react';

interface ChartSelectorProps {
  selectedChartId: string;
  onSelectChart: (chartId: string) => void;
  variant?: 'horizontal' | 'sidebar';
  className?: string;
}

export function ChartSelector({
  selectedChartId,
  onSelectChart,
  variant = 'horizontal',
  className
}: ChartSelectorProps) {
  // Properly categorize all charts by importance
  const essentialCharts = DIVISIONAL_CHARTS.filter(c => c.importance === 'essential');
  const importantCharts = DIVISIONAL_CHARTS.filter(c => c.importance === 'important');
  const advancedCharts = DIVISIONAL_CHARTS.filter(c => c.importance === 'advanced');
  
  if (variant === 'horizontal') {
    return (
      <MobileDropdown
        essentialCharts={essentialCharts}
        importantCharts={importantCharts}
        advancedCharts={advancedCharts}
        selectedChartId={selectedChartId}
        onSelectChart={onSelectChart}
        className={className}
      />
    );
  }
  
  return (
    <SidebarSelector
      essentialCharts={essentialCharts}
      importantCharts={importantCharts}
      advancedCharts={advancedCharts}
      selectedChartId={selectedChartId}
      onSelectChart={onSelectChart}
      className={className}
    />
  );
}

// ============================================================================
// MOBILE DROPDOWN
// ============================================================================

interface MobileDropdownProps {
  essentialCharts: DivisionalChartInfo[];
  importantCharts: DivisionalChartInfo[];
  advancedCharts: DivisionalChartInfo[];
  selectedChartId: string;
  onSelectChart: (chartId: string) => void;
  className?: string;
}

function MobileDropdown({
  essentialCharts,
  importantCharts,
  advancedCharts,
  selectedChartId,
  onSelectChart,
  className
}: MobileDropdownProps) {
  const selectedChart = DIVISIONAL_CHARTS.find(c => c.id === selectedChartId);
  
  return (
    <div className={cn('lg:hidden', className)}>
      <Select value={selectedChartId} onValueChange={onSelectChart}>
        <SelectTrigger className="w-full">
          <SelectValue>
            {selectedChart ? (
              <div className="flex items-center gap-2">
                {selectedChart.isPopular && <Star className="h-3 w-3 fill-amber-400 text-amber-400" />}
                <span className="font-medium">{selectedChart.label}</span>
                <span className="text-muted-foreground">- {selectedChart.name}</span>
              </div>
            ) : (
              'Select a chart'
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {/* Essential Charts Section */}
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b">
            ⭐ Essential Charts ({essentialCharts.length})
          </div>
          {essentialCharts.map(chart => (
            <SelectItem key={chart.id} value={chart.id}>
              <div className="flex items-center gap-2">
                {chart.isPopular && <Star className="h-3 w-3 fill-amber-400 text-amber-400" />}
                <span className="font-medium">{chart.label}</span>
                <span className="text-muted-foreground text-xs">- {chart.name}</span>
              </div>
            </SelectItem>
          ))}
          
          {/* Important Charts Section */}
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t border-b mt-2">
            📊 Important Charts ({importantCharts.length})
          </div>
          {importantCharts.map(chart => (
            <SelectItem key={chart.id} value={chart.id}>
              <div className="flex items-center gap-2">
                <span className="font-medium">{chart.label}</span>
                <span className="text-muted-foreground text-xs">- {chart.name}</span>
              </div>
            </SelectItem>
          ))}
          
          {/* Advanced Charts Section */}
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t border-b mt-2">
            🔬 Advanced Charts ({advancedCharts.length})
          </div>
          {advancedCharts.map(chart => (
            <SelectItem key={chart.id} value={chart.id}>
              <div className="flex items-center gap-2">
                <span className="font-medium">{chart.label}</span>
                <span className="text-muted-foreground text-xs">- {chart.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ============================================================================
// DESKTOP SIDEBAR
// ============================================================================

interface SidebarSelectorProps {
  essentialCharts: DivisionalChartInfo[];
  importantCharts: DivisionalChartInfo[];
  advancedCharts: DivisionalChartInfo[];
  selectedChartId: string;
  onSelectChart: (chartId: string) => void;
  className?: string;
}

function SidebarSelector({
  essentialCharts,
  importantCharts,
  advancedCharts,
  selectedChartId,
  onSelectChart,
  className
}: SidebarSelectorProps) {
  // State for each collapsible section (all start expanded for now)
  const [essentialOpen, setEssentialOpen] = useState(true);
  const [importantOpen, setImportantOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  
  return (
    <aside className={cn('hidden lg:block', className)}>
      <div className="space-y-4">
        
        {/* Essential Charts - Collapsible */}
        <CollapsibleSection
          title="Essential Charts"
          icon="⭐"
          count={essentialCharts.length}
          isOpen={essentialOpen}
          onOpenChange={setEssentialOpen}
        >
          <ChartList
            charts={essentialCharts}
            selectedChartId={selectedChartId}
            onSelectChart={onSelectChart}
          />
        </CollapsibleSection>
        
        {/* Important Charts - Collapsible */}
        <CollapsibleSection
          title="Important Charts"
          icon="📊"
          count={importantCharts.length}
          isOpen={importantOpen}
          onOpenChange={setImportantOpen}
        >
          <ChartList
            charts={importantCharts}
            selectedChartId={selectedChartId}
            onSelectChart={onSelectChart}
          />
        </CollapsibleSection>
        
        {/* Advanced Charts - Collapsible */}
        <CollapsibleSection
          title="Advanced Charts"
          icon="🔬"
          count={advancedCharts.length}
          isOpen={advancedOpen}
          onOpenChange={setAdvancedOpen}
        >
          <ChartList
            charts={advancedCharts}
            selectedChartId={selectedChartId}
            onSelectChart={onSelectChart}
          />
        </CollapsibleSection>
        
      </div>
    </aside>
  );
}

// ============================================================================
// COLLAPSIBLE SECTION COMPONENT
// ============================================================================

interface CollapsibleSectionProps {
  title: string;
  icon: string;
  count: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function CollapsibleSection({
  title,
  icon,
  count,
  isOpen,
  onOpenChange,
  children
}: CollapsibleSectionProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange} className="border rounded-lg">
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between p-3 hover:bg-accent transition-colors">
          <div className="flex items-center gap-2">
            <span className="text-base">{icon}</span>
            <span className="text-sm font-semibold">{title}</span>
            <span className="text-xs text-muted-foreground">({count})</span>
          </div>
          <ChevronDown 
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              isOpen && 'rotate-180'
            )} 
          />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-t">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ============================================================================
// CHART LIST COMPONENT
// ============================================================================

interface ChartListProps {
  charts: DivisionalChartInfo[];
  selectedChartId: string;
  onSelectChart: (chartId: string) => void;
}

function ChartList({ charts, selectedChartId, onSelectChart }: ChartListProps) {
  return (
    <div className="p-2 space-y-1">
      {charts.map(chart => (
        <button
          key={chart.id}
          onClick={() => onSelectChart(chart.id)}
          className={cn(
            'w-full text-left px-3 py-2 rounded-md transition-colors',
            'flex items-center gap-2 group',
            selectedChartId === chart.id
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'hover:bg-accent hover:text-accent-foreground'
          )}
          aria-selected={selectedChartId === chart.id}
          role="tab"
        >
          {chart.isPopular && (
            <Star 
              className={cn(
                'h-3 w-3 shrink-0',
                selectedChartId === chart.id 
                  ? 'fill-current' 
                  : 'fill-amber-400 text-amber-400'
              )} 
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm">{chart.label}</div>
            <div className={cn(
              'text-xs truncate',
              selectedChartId === chart.id 
                ? 'opacity-90' 
                : 'text-muted-foreground'
            )}>
              {chart.name}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
