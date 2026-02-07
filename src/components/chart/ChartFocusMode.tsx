'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Columns2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DiamondChart } from '@/components/chart/diamond';
import type { HouseInfo as HouseData } from '@/types/astrology';
import { Button } from '@/components/ui/button';
import { useSwipeable } from 'react-swipeable';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ChartConfig {
  id: string;
  title: string;
  subtitle: string;
  houses: HouseData[];
  insights: ChartInsight[];
}

export interface ChartInsight {
  type: 'strength' | 'challenge' | 'highlight';
  icon: string;
  text: string;
}

interface ChartFocusModeProps {
  charts: ChartConfig[];
  className?: string;
}

// ============================================
// THUMBNAIL COMPONENT
// ============================================

interface ThumbnailProps {
  chart: ChartConfig;
  isActive: boolean;
  isComparing: boolean;
  onClick: () => void;
  onCompareToggle?: () => void;
}

function ChartThumbnail({ 
  chart, 
  isActive, 
  isComparing, 
  onClick,
  onCompareToggle 
}: ThumbnailProps) {
  const planetCount = chart.houses.reduce((sum, h) => sum + h.planets.length, 0);
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
        "hover:border-primary/50 hover:bg-accent/50",
        isActive && "border-primary bg-primary/10",
        !isActive && "border-border bg-card"
      )}
    >
      {/* Thumbnail preview */}
      <div className="w-20 h-20 flex items-center justify-center bg-background rounded border">
        <div className="text-xs text-muted-foreground">
          {chart.title}
        </div>
      </div>
      
      {/* Chart info */}
      <div className="text-center">
        <div className="text-sm font-medium">{chart.title}</div>
        <div className="text-xs text-muted-foreground">{planetCount} planets</div>
      </div>
      
      {/* Active indicator */}
      {isActive && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary" />
      )}
      
      {/* Compare mode checkbox */}
      {isComparing && (
        <div className="absolute top-2 right-2">
          <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
            <span className="text-xs text-primary-foreground">✓</span>
          </div>
        </div>
      )}
    </button>
  );
}

// ============================================
// INSIGHTS PANEL COMPONENT (Enhancement #7)
// ============================================

interface InsightsPanelProps {
  chart: ChartConfig;
  isCompareMode: boolean;
}

function ContextualInsightsPanel({ chart, isCompareMode }: InsightsPanelProps) {
  if (isCompareMode) return null;
  
  const strengths = chart.insights.filter(i => i.type === 'strength');
  const challenges = chart.insights.filter(i => i.type === 'challenge');
  const highlights = chart.insights.filter(i => i.type === 'highlight');
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-4 bg-card border rounded-lg p-4"
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">💡</span>
        <h3 className="font-semibold">Key Insights</h3>
      </div>
      
      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-green-600 dark:text-green-400">
            ✨ Strengths
          </h4>
          {strengths.map((insight, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <span>{insight.icon}</span>
              <span className="text-muted-foreground">{insight.text}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Challenges */}
      {challenges.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-orange-600 dark:text-orange-400">
            ⚠️ Challenges
          </h4>
          {challenges.map((insight, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <span>{insight.icon}</span>
              <span className="text-muted-foreground">{insight.text}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Highlights */}
      {highlights.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400">
            🔍 Notable
          </h4>
          {highlights.map((insight, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <span>{insight.icon}</span>
              <span className="text-muted-foreground">{insight.text}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Quick actions */}
      <div className="pt-4 border-t space-y-2">
        <Button variant="outline" size="sm" className="w-full justify-start">
          📊 View Detailed Analysis
        </Button>
        <Button variant="outline" size="sm" className="w-full justify-start">
          📥 Download Chart
        </Button>
      </div>
    </motion.div>
  );
}

// ============================================
// MAIN FOCUS MODE COMPONENT
// ============================================

export function ChartFocusMode({ charts, className }: ChartFocusModeProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [compareMode, setCompareMode] = useState(false);
  const [compareIndices, setCompareIndices] = useState<number[]>([0]);
  
  const activeChart = charts[activeIndex];
  
  // Enhancement #3: Comparison Mode Toggle
  const toggleCompareMode = () => {
    if (compareMode) {
      setCompareIndices([activeIndex]);
    } else {
      // When entering compare mode, select first 2 charts
      setCompareIndices([0, 1]);
    }
    setCompareMode(!compareMode);
  };
  
  const toggleChartInComparison = (index: number) => {
    if (compareIndices.includes(index)) {
      // Must keep at least 1 chart in comparison
      if (compareIndices.length > 1) {
        setCompareIndices(compareIndices.filter(i => i !== index));
      }
    } else {
      // Max 2 charts in comparison
      if (compareIndices.length < 2) {
        setCompareIndices([...compareIndices, index]);
      } else {
        // Replace the second chart
        setCompareIndices([compareIndices[0], index]);
      }
    }
  };
  
  // Enhancement #9: Mobile Swipe Gestures
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (!compareMode && activeIndex < charts.length - 1) {
        setActiveIndex(activeIndex + 1);
      }
    },
    onSwipedRight: () => {
      if (!compareMode && activeIndex > 0) {
        setActiveIndex(activeIndex - 1);
      }
    },
    trackMouse: false,
    trackTouch: true,
    delta: 50,
  });
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && activeIndex > 0 && !compareMode) {
        setActiveIndex(activeIndex - 1);
      }
      if (e.key === 'ArrowRight' && activeIndex < charts.length - 1 && !compareMode) {
        setActiveIndex(activeIndex + 1);
      }
      if (e.key === 'c' || e.key === 'C') {
        toggleCompareMode();
      }
      if (e.key >= '1' && e.key <= String(charts.length)) {
        const index = parseInt(e.key) - 1;
        if (!compareMode) {
          setActiveIndex(index);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeIndex, charts.length, compareMode]);
  
  return (
    <div className={cn("space-y-6", className)}>
      {/* Thumbnail Bar + Compare Toggle */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {compareMode ? 'Compare Charts' : 'Chart View'}
          </h2>
          
          {/* Enhancement #3: Compare Mode Toggle Button */}
          <Button
            variant={compareMode ? "default" : "outline"}
            size="sm"
            onClick={toggleCompareMode}
            className="gap-2"
          >
            {compareMode ? <X className="h-4 w-4" /> : <Columns2 className="h-4 w-4" />}
            {compareMode ? 'Exit Compare' : 'Compare Charts'}
          </Button>
        </div>
        
        {/* Thumbnails */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {charts.map((chart, index) => (
            <ChartThumbnail
              key={chart.id}
              chart={chart}
              isActive={compareMode ? compareIndices.includes(index) : index === activeIndex}
              isComparing={compareMode && compareIndices.includes(index)}
              onClick={() => {
                if (compareMode) {
                  toggleChartInComparison(index);
                } else {
                  setActiveIndex(index);
                }
              }}
            />
          ))}
        </div>
        
        {/* Compare mode instructions */}
        {compareMode && (
          <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
            💡 Select up to 2 charts to compare side-by-side
          </div>
        )}
      </div>
      
      {/* Main Content Area */}
      <div className={cn(
        "grid gap-6",
        compareMode 
          ? "grid-cols-1" // Full width in compare mode
          : "grid-cols-1 lg:grid-cols-3" // 3-column layout in normal mode
      )}>
        {/* Charts Area */}
        <div 
          className={cn(
            compareMode ? "" : "lg:col-span-2"
          )}
          {...swipeHandlers}
        >
          {compareMode ? (
            // Enhancement #3: Comparison Mode - Side by Side with LARGER charts
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {compareIndices.map((chartIndex) => (
                <motion.div
                  key={charts[chartIndex].id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="border rounded-lg p-6 bg-card"
                >
                  <DiamondChart
                    houses={charts[chartIndex].houses}
                    title={charts[chartIndex].title}
                    subtitle={charts[chartIndex].subtitle}
                    size="lg"
                    showRashiNumbers
                    showAscLabel
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            // Enhancement #8: Animated Transitions - Single Chart
            <div className="relative">
              {/* Navigation arrows (desktop) */}
              {activeIndex > 0 && (
                <button
                  onClick={() => setActiveIndex(activeIndex - 1)}
                  className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-10 w-10 h-10 items-center justify-center rounded-full bg-background border shadow-md hover:bg-accent"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              
              {activeIndex < charts.length - 1 && (
                <button
                  onClick={() => setActiveIndex(activeIndex + 1)}
                  className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-10 w-10 h-10 items-center justify-center rounded-full bg-background border shadow-md hover:bg-accent"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
              
              {/* Chart with animation */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeChart.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ 
                    duration: 0.3,
                    ease: "easeInOut"
                  }}
                  className="bg-card border rounded-lg p-6"
                >
                  <DiamondChart
                    houses={activeChart.houses}
                    title={activeChart.title}
                    subtitle={activeChart.subtitle}
                    size="lg"
                    showRashiNumbers
                    showAscLabel
                  />
                </motion.div>
              </AnimatePresence>
              
              {/* Mobile swipe indicator */}
              <div className="flex lg:hidden justify-center gap-2 mt-4">
                {charts.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      index === activeIndex 
                        ? "w-8 bg-primary" 
                        : "w-2 bg-muted"
                    )}
                  />
                ))}
              </div>
              
              {/* Swipe hint (mobile only) */}
              <div className="flex lg:hidden justify-center mt-2 text-xs text-muted-foreground">
                ← Swipe to navigate →
              </div>
            </div>
          )}
        </div>
        
        {/* Enhancement #7: Contextual Insights Panel */}
        {!compareMode && (
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              <ContextualInsightsPanel
                key={activeChart.id}
                chart={activeChart}
                isCompareMode={compareMode}
              />
            </AnimatePresence>
          </div>
        )}
      </div>
      
      {/* Comparison Insights - Below charts in compare mode */}
      {compareMode && compareIndices.length === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {compareIndices.map((chartIndex) => (
            <div
              key={charts[chartIndex].id}
              className="bg-card border rounded-lg p-4"
            >
              <h3 className="font-semibold mb-3">{charts[chartIndex].title}</h3>
              <div className="space-y-2">
                {charts[chartIndex].insights.slice(0, 3).map((insight, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span>{insight.icon}</span>
                    <span className="text-muted-foreground">{insight.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}
      
      {/* Keyboard shortcuts hint */}
      <div className="hidden md:block text-xs text-muted-foreground text-center bg-muted/30 rounded-lg py-2">
        Keyboard: <kbd className="px-2 py-1 bg-background rounded">←</kbd> <kbd className="px-2 py-1 bg-background rounded">→</kbd> to navigate • 
        <kbd className="px-2 py-1 bg-background rounded">C</kbd> to compare • 
        <kbd className="px-2 py-1 bg-background rounded">1</kbd><kbd className="px-2 py-1 bg-background rounded">2</kbd><kbd className="px-2 py-1 bg-background rounded">3</kbd> to jump
      </div>
    </div>
  );
}
