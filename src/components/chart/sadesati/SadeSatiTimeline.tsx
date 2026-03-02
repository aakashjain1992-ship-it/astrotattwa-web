/**
 * Sade Sati Timeline Component - Interactive & Complete
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { SaturnTransitAnalysis, SadeSatiPeriod } from '@/types/sadesati';
import { PHASE_EFFECTS, PHASE_REMEDIES } from '@/lib/astrology/sadesati/constants';

interface SadeSatiTimelineProps {
  analysis: SaturnTransitAnalysis;
  birthDate: Date;
}

// ✅ Helper to ensure Date objects
const toDate = (d: any): Date => d instanceof Date ? d : new Date(d);

export function SadeSatiTimeline({ analysis, birthDate }: SadeSatiTimelineProps) {
  const currentDate = new Date();
  const [expandedPeriod, setExpandedPeriod] = useState<string | null>(null);
  
  const { sadeSati } = analysis;
  const { history } = sadeSati;
  
  const calculateAge = (date: Date): number => {
    const dateObj = toDate(date);
    return Math.floor(
      (dateObj.getTime() - toDate(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    );
  };
  
  const togglePeriod = (periodId: string) => {
    setExpandedPeriod(expandedPeriod === periodId ? null : periodId);
  };
  
  // ✅ Normalize phases to ensure Date objects
  const normalizePhases = (phases: SadeSatiPeriod[]): SadeSatiPeriod[] => {
    return phases.map(phase => ({
      ...phase,
      startDate: toDate(phase.startDate),
      endDate: toDate(phase.endDate),
    }));
  };
  
  const renderPeriodDetails = (phases: SadeSatiPeriod[], showFullDetails: boolean) => {
    // ✅ Normalize dates before using them
    const safePhases = normalizePhases(phases);
    
    const periodId = `${safePhases[0].startDate.getTime()}`;
    const isExpanded = expandedPeriod === periodId;
    const isPast = safePhases[2].endDate < currentDate;
    const isCurrent = safePhases[0].startDate <= currentDate && safePhases[2].endDate >= currentDate;
    
    return (
      <div key={periodId} className="relative pl-6 border-l-2 border-muted">
        <div className={`absolute -left-2 top-0 w-4 h-4 rounded-full border-2 border-background ${
          isCurrent 
            ? 'bg-orange-500' 
            : isPast 
            ? 'bg-muted' 
            : 'bg-blue-500'
        }`}>
          {isCurrent && (
            <div className="absolute inset-0 rounded-full bg-orange-500 animate-pulse opacity-75" />
          )}
        </div>
        
        <div className="pb-6">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm font-medium">
              {safePhases[0].startDate.getFullYear()} - {safePhases[2].endDate.getFullYear()}
            </p>
            <Badge variant="outline" className="text-xs">
              Age {calculateAge(safePhases[0].startDate)}
            </Badge>
            {isCurrent && (
              <Badge className="text-xs bg-orange-500">Active Now</Badge>
            )}
            {!isPast && !isCurrent && (
              <Badge variant="outline" className="text-xs bg-blue-50">Upcoming</Badge>
            )}
          </div>
          
          <div className="space-y-1 mb-3">
            {safePhases.map((phase, phaseIndex) => {
              const isCurrentPhase = isCurrent && phase.endDate > currentDate && phase.startDate <= currentDate;
              
              return (
                <p 
                  key={phaseIndex}
                  className={`text-xs ${
                    isCurrentPhase 
                      ? 'text-orange-700 dark:text-orange-300 font-medium' 
                      : 'text-muted-foreground'
                  }`}
                >
                  <span className="font-semibold">{phase.phase}:</span>{' '}
                  {phase.saturnSign} ({' '}
                  {phase.startDate.toLocaleDateString('en-US', { 
                    month: 'short', 
                    year: 'numeric' 
                  })} - {' '}
                  {phase.endDate.toLocaleDateString('en-US', { 
                    month: 'short', 
                    year: 'numeric' 
                  })})
                  {isCurrentPhase && (
                    <span className="ml-2 text-orange-600 dark:text-orange-400">
                      ← You are here
                    </span>
                  )}
                </p>
              );
            })}
          </div>
          
          {!isPast && !isCurrent && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => togglePeriod(periodId)}
              className="mt-2"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="mr-2 h-3 w-3" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-3 w-3" />
                  View Effects & Remedies
                </>
              )}
            </Button>
          )}
          
          {isExpanded && !isPast && (
            <div className="mt-4 space-y-4 p-4 bg-muted/30 rounded-lg border">
              {safePhases.map((phase, idx) => (
                <div key={idx} className="space-y-3">
                  <h4 className="font-semibold text-sm">{phase.phase} Phase</h4>
                  
                  <div>
                    <p className="text-xs font-medium mb-2">Key Effects:</p>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {PHASE_EFFECTS[phase.phase].slice(0, 3).map((effect, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-orange-500 mt-0.5">•</span>
                          <span>{effect}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-900">
                    <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Recommended Remedies:
                    </p>
                    <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
                      {PHASE_REMEDIES[phase.phase].slice(0, 3).map((remedy, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span>✓</span>
                          <span>{remedy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {idx < safePhases.length - 1 && <hr className="border-muted" />}
                </div>
              ))}
            </div>
          )}
          
          {isPast && (
            <p className="text-xs text-muted-foreground italic mt-2">
              Completed period
            </p>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Sade Sati Timeline</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Saturn's 7.5-year periods throughout your life (from birth to age 100)
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-8">
          {history.past.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">
                Past Periods ({history.past.length})
              </h3>
              <div className="space-y-6">
                {history.past.map((phases, index) => renderPeriodDetails(phases, false))}
              </div>
            </div>
          )}
          
          {history.current && (
            <>
              {history.past.length > 0 && <hr className="border-muted" />}
              <div>
                <h3 className="text-sm font-semibold text-orange-600 dark:text-orange-400 mb-4">
                  Current Period (Active)
                </h3>
                {renderPeriodDetails(history.current, true)}
              </div>
            </>
          )}
          
          {history.upcoming && (
            <>
              <hr className="border-muted" />
              <div>
                <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-4">
                  Next Sade Sati (Upcoming)
                </h3>
                {renderPeriodDetails(history.upcoming, true)}
              </div>
            </>
          )}
          
          {history.future.length > 0 && (
            <>
              <hr className="border-muted" />
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-4">
                  Future Periods ({history.future.length})
                </h3>
                <div className="space-y-6">
                  {history.future.map((phases, index) => renderPeriodDetails(phases, true))}
                </div>
              </div>
            </>
          )}
          
          <div className="p-4 bg-muted/50 rounded-lg border">
            <p className="text-xs text-muted-foreground">
              <strong>About This Timeline:</strong> Shows all Sade Sati periods from your birth to age 100. 
              Click "View Effects & Remedies" on upcoming periods to see detailed analysis for that specific time.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
