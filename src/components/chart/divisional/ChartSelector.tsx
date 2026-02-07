'use client';

import { cn } from '@/lib/utils';
import { Star, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  getPhase1Charts,
  getChartsByImportance,
  type DivisionalChartInfo
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
  const phase1Charts = getPhase1Charts();
  const importantCharts = getChartsByImportance('important').filter(c => 
    !phase1Charts.find(p => p.id === c.id)
  );
  const advancedCharts = getChartsByImportance('advanced');
  
  if (variant === 'horizontal') {
    return (
      <HorizontalSelector
        charts={phase1Charts}
        selectedChartId={selectedChartId}
        onSelectChart={onSelectChart}
        advancedCount={importantCharts.length + advancedCharts.length}
        className={className}
      />
    );
  }
  
  return (
    <SidebarSelector
      phase1Charts={phase1Charts}
      importantCharts={importantCharts}
      advancedCharts={advancedCharts}
      selectedChartId={selectedChartId}
      onSelectChart={onSelectChart}
      className={className}
    />
  );
}

interface HorizontalSelectorProps {
  charts: DivisionalChartInfo[];
  selectedChartId: string;
  onSelectChart: (chartId: string) => void;
  advancedCount: number;
  className?: string;
}

function HorizontalSelector({
  charts,
  selectedChartId,
  onSelectChart,
  advancedCount,
  className
}: HorizontalSelectorProps) {
  return (
    <div className={cn('md:hidden', className)}>
       <div className="w-full overflow-x-auto">
        <div className="flex gap-2 p-2 pb-4 min-w-max">
          {charts.map(chart => (
            <ChartTabButton
              key={chart.id}
              chart={chart}
              isSelected={selectedChartId === chart.id}
              onClick={() => onSelectChart(chart.id)}
            />
          ))}
          
          {advancedCount > 0 && (
            <Button variant="outline" size="sm" className="whitespace-nowrap border-dashed" disabled>
              +{advancedCount} more
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ChartTabButton({
  chart,
  isSelected,
  onClick
}: {
  chart: DivisionalChartInfo;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-lg whitespace-nowrap border-2 transition-all',
        'flex items-center gap-2 min-w-fit hover:shadow-md active:scale-95',
        isSelected
          ? 'border-primary bg-primary text-primary-foreground shadow-lg'
          : 'border-border hover:border-primary/50 hover:bg-accent'
      )}
      aria-selected={isSelected}
      role="tab"
    >
      {chart.isPopular && <Star className="h-3 w-3 fill-current shrink-0" />}
      <span className="font-medium text-sm">{chart.label}</span>
    </button>
  );
}

interface SidebarSelectorProps {
  phase1Charts: DivisionalChartInfo[];
  importantCharts: DivisionalChartInfo[];
  advancedCharts: DivisionalChartInfo[];
  selectedChartId: string;
  onSelectChart: (chartId: string) => void;
  className?: string;
}

function SidebarSelector({
  phase1Charts,
  importantCharts,
  advancedCharts,
  selectedChartId,
  onSelectChart,
  className
}: SidebarSelectorProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const essentialCharts = phase1Charts.filter(c => c.importance === 'essential');
  const otherPhase1 = phase1Charts.filter(c => c.importance !== 'essential');
  
  return (
    <aside className={cn('hidden md:block w-52 border-r bg-card', className)}>
      <div className="p-4 space-y-6 sticky top-4">
        <ChartGroup
          title="Essential Charts"
          charts={essentialCharts}
          selectedChartId={selectedChartId}
          onSelectChart={onSelectChart}
        />
        
        {otherPhase1.length > 0 && (
          <ChartGroup
            title="Other Charts"
            charts={otherPhase1}
            selectedChartId={selectedChartId}
            onSelectChart={onSelectChart}
          />
        )}
        
        {(importantCharts.length > 0 || advancedCharts.length > 0) && (
          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between px-0 hover:bg-transparent">
                <span className="text-sm font-semibold text-muted-foreground">
                  Advanced Charts ({importantCharts.length + advancedCharts.length})
                </span>
                <ChevronDown className={cn('h-4 w-4 transition-transform', advancedOpen && 'rotate-180')} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 mt-2">
              {[...importantCharts, ...advancedCharts].map(chart => (
                <button
                  key={chart.id}
                  onClick={() => onSelectChart(chart.id)}
                  disabled
                  className="w-full text-left px-3 py-2 rounded-lg opacity-50 cursor-not-allowed"
                >
                  <div className="font-medium text-sm">{chart.label}</div>
                  <div className="text-xs text-muted-foreground truncate">Coming soon</div>
                </button>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </aside>
  );
}

function ChartGroup({
  title,
  charts,
  selectedChartId,
  onSelectChart
}: {
  title: string;
  charts: DivisionalChartInfo[];
  selectedChartId: string;
  onSelectChart: (chartId: string) => void;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-2 text-muted-foreground px-3">{title}</h3>
      <div className="space-y-1">
        {charts.map(chart => (
          <button
            key={chart.id}
            onClick={() => onSelectChart(chart.id)}
            className={cn(
              'w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 group',
              selectedChartId === chart.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'hover:bg-accent hover:text-accent-foreground'
            )}
            aria-selected={selectedChartId === chart.id}
            role="tab"
          >
            {chart.isPopular && (
              <Star className={cn('h-3 w-3 shrink-0', selectedChartId === chart.id ? 'fill-current' : 'fill-amber-400 text-amber-400')} />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{chart.label}</div>
              <div className={cn('text-xs truncate', selectedChartId === chart.id ? 'opacity-90' : 'text-muted-foreground')}>
                {chart.name}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
