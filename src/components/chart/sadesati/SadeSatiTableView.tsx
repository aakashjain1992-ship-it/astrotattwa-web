/**
 * Sade Sati & Dhaiya - Table-Based View
 * 
 * Minimal, portal-consistent design matching Planetary Positions table
 * Mobile-responsive with collapsible sections
 * 
 * @file SadeSatiTableView.tsx
 * @version 2.0.0
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { SaturnTransitAnalysis, SadeSatiPeriod } from '@/types/sadesati';
import { PHASE_EFFECTS, PHASE_REMEDIES } from '@/lib/astrology/sadesati/constants';

interface SadeSatiTableViewProps {
  analysis: SaturnTransitAnalysis;
  birthDate: Date;
}

// Helper to ensure Date objects
const toDate = (d: any): Date => d instanceof Date ? d : new Date(d);

export function SadeSatiTableView({ analysis, birthDate }: SadeSatiTableViewProps) {
  const currentDate = new Date();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['status', 'current'])
  );
  const [expandedPeriods, setExpandedPeriods] = useState<Set<string>>(new Set());
  
  const { sadeSati, dhaiya } = analysis;
  const { current, history } = sadeSati;
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };
  
  const togglePeriod = (periodId: string) => {
    setExpandedPeriods(prev => {
      const next = new Set(prev);
      if (next.has(periodId)) {
        next.delete(periodId);
      } else {
        next.add(periodId);
      }
      return next;
    });
  };
  
  const calculateAge = (date: Date): number => {
    const dateObj = toDate(date);
    return Math.floor(
      (dateObj.getTime() - toDate(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    );
  };
  
  const formatDuration = (days: number): string => {
    if (days < 30) return `${days} days`;
    if (days < 365) {
      const months = Math.floor(days / 30);
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    }
    const years = Math.floor(days / 365.25);
    const months = Math.floor((days - years * 365.25) / 30);
    if (months === 0) return `${years} ${years === 1 ? 'year' : 'years'}`;
    return `${years}y ${months}m`;
  };
  
  // Normalize phases
  const normalizePhases = (phases: SadeSatiPeriod[]): SadeSatiPeriod[] => {
    return phases.map(phase => ({
      ...phase,
      startDate: toDate(phase.startDate),
      endDate: toDate(phase.endDate),
    }));
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Saturn Transit Analysis</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Sade Sati (7.5 years) and Dhaiya (2.5 years) periods
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        
        {/* ═══════════════════════════════════════════════════ */}
        {/* SADE SATI STATUS                                    */}
        {/* ═══════════════════════════════════════════════════ */}
        
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('status')}
            className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors w-full"
          >
            {expandedSections.has('status') ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            Sade Sati Status
          </button>
          
          {expandedSections.has('status') && (
            <div className="pl-6 space-y-3">
              {current.isActive ? (
                <>
                  {/* Active Sade Sati */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between md:block">
                      <span className="text-muted-foreground">Status</span>
                      <span className="font-medium md:block">
                        Currently Active - {current.currentPhase?.phase} Phase
                      </span>
                    </div>
                    
                    <div className="flex justify-between md:block">
                      <span className="text-muted-foreground">Period</span>
                      <span className="font-medium md:block">
                        {current.startDate && toDate(current.startDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          year: 'numeric' 
                        })} - {current.endDate && toDate(current.endDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                        {current.startDate && (
                          <span className="text-muted-foreground ml-2">
                            (Age {calculateAge(current.startDate)}-{calculateAge(current.endDate!)})
                          </span>
                        )}
                      </span>
                    </div>
                    
                    <div className="flex justify-between md:block">
                      <span className="text-muted-foreground">Current Phase</span>
                      <span className="font-medium md:block">
                        {current.currentPhase?.phase} (Saturn in {current.currentPhase?.saturnSign})
                      </span>
                    </div>
                    
                    <div className="flex justify-between md:block">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium md:block">
                        {current.elapsedPercentage?.toFixed(1)}% complete
                      </span>
                    </div>
                    
                    <div className="flex justify-between md:block">
                      <span className="text-muted-foreground">Time Remaining</span>
                      <span className="font-medium md:block">
                        {current.daysRemainingInPhase && formatDuration(current.daysRemainingInPhase)} in {current.currentPhase?.phase} phase
                      </span>
                    </div>
                  </div>
                  
                  {/* Three Phases Table */}
                  <div className="mt-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Three Phases:</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-3 font-medium">Phase</th>
                            <th className="text-left py-2 px-3 font-medium">Sign</th>
                            <th className="text-left py-2 px-3 font-medium">Period</th>
                            <th className="text-left py-2 px-3 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {current.allPhases?.map((phase, index) => {
                            const isCurrent = phase.phase === current.currentPhase?.phase;
                            const isPast = index < (current.allPhases?.findIndex(p => p.phase === current.currentPhase?.phase) ?? 0);
                            
                            return (
                              <tr 
                                key={index}
                                className={`border-b ${isCurrent ? 'bg-orange-50 dark:bg-orange-950/20' : ''}`}
                              >
                                <td className="py-2 px-3 font-medium">{phase.phase}</td>
                                <td className="py-2 px-3 text-muted-foreground">{phase.saturnSign}</td>
                                <td className="py-2 px-3 text-muted-foreground">
                                  {phase.startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {' '}
                                  {phase.endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </td>
                                <td className="py-2 px-3">
                                  {isCurrent ? (
                                    <span className="text-orange-600 dark:text-orange-400 font-medium">← Current</span>
                                  ) : isPast ? (
                                    <span className="text-muted-foreground">Past</span>
                                  ) : (
                                    <span className="text-muted-foreground">Upcoming</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                // Not Active
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium">No Active Sade Sati</span>
                  </div>
                  {history.next && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Next Sade Sati</span>
                      <span className="font-medium">
                        {toDate(history.next.startDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                        <span className="text-muted-foreground ml-2">
                          ({history.next.yearsFromNow.toFixed(1)} years from now)
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="border-t" />
        
        {/* ═══════════════════════════════════════════════════ */}
        {/* DHAIYA STATUS                                       */}
        {/* ═══════════════════════════════════════════════════ */}
        
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('dhaiya')}
            className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors w-full"
          >
            {expandedSections.has('dhaiya') ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            Dhaiya Periods (ढैय्या)
          </button>
          
          {expandedSections.has('dhaiya') && (
            <div className="pl-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Dhaiya</span>
                <span className="font-medium">
                  {dhaiya.current ? (
                    <>
                      {dhaiya.current.type} House Transit (Saturn in {dhaiya.current.saturnSign})
                    </>
                  ) : (
                    'None Active'
                  )}
                </span>
              </div>
              
              {/* Next 4th House */}
              {dhaiya.fourthHouse.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Next 4th House</span>
                  <span className="font-medium">
                    {toDate(dhaiya.fourthHouse[0].startDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })} - {toDate(dhaiya.fourthHouse[0].endDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                    <span className="text-muted-foreground ml-2">
                      (Saturn in {dhaiya.fourthHouse[0].saturnSign})
                    </span>
                  </span>
                </div>
              )}
              
              {/* Next 8th House */}
              {dhaiya.eighthHouse.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Next 8th House</span>
                  <span className="font-medium">
                    {toDate(dhaiya.eighthHouse[0].startDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })} - {toDate(dhaiya.eighthHouse[0].endDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                    <span className="text-muted-foreground ml-2">
                      (Saturn in {dhaiya.eighthHouse[0].saturnSign})
                    </span>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="border-t" />
        
        {/* ═══════════════════════════════════════════════════ */}
        {/* COMPLETE TIMELINE                                   */}
        {/* ═══════════════════════════════════════════════════ */}
        
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('timeline')}
            className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors w-full"
          >
            {expandedSections.has('timeline') ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            Complete Timeline
          </button>
          
          {expandedSections.has('timeline') && (
            <div className="pl-6 space-y-4">
              
              {/* Past Periods */}
              {history.past.length > 0 && (
                <div className="space-y-2">
                  <button
                    onClick={() => toggleSection('past')}
                    className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {expandedSections.has('past') ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                    Past Periods ({history.past.length})
                  </button>
                  
                  {expandedSections.has('past') && (
                    <div className="pl-4 space-y-3">
                      {history.past.map((phases, index) => {
                        const safePhases = normalizePhases(phases);
                        const periodId = `past-${index}`;
                        
                        return (
                          <div key={periodId} className="text-sm border-l-2 border-muted pl-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">
                                  {safePhases[0].startDate.getFullYear()} - {safePhases[2].endDate.getFullYear()}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Age {calculateAge(safePhases[0].startDate)}-{calculateAge(safePhases[2].endDate)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {safePhases[0].saturnSign} → {safePhases[1].saturnSign} → {safePhases[2].saturnSign}
                                </p>
                              </div>
                              <span className="text-xs text-muted-foreground">Completed</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              
              {/* Current Period */}
              {history.current && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-orange-600 dark:text-orange-400">
                    Current Period (Active Now)
                  </p>
                  <div className="text-sm border-l-2 border-orange-500 pl-3 bg-orange-50 dark:bg-orange-950/20 py-2">
                    {(() => {
                      const safePhases = normalizePhases(history.current);
                      return (
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              {safePhases[0].startDate.getFullYear()} - {safePhases[2].endDate.getFullYear()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Age {calculateAge(safePhases[0].startDate)}-{calculateAge(safePhases[2].endDate)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {safePhases[0].saturnSign} → {safePhases[1].saturnSign} → {safePhases[2].saturnSign}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium text-orange-600 dark:text-orange-400">
                              {current.elapsedPercentage?.toFixed(1)}% done
                            </p>
                            <p className="text-xs text-muted-foreground">← You are here</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
              
              {/* Next Sade Sati */}
              {history.upcoming && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    Next Sade Sati
                  </p>
                  <div className="text-sm border-l-2 border-blue-500 pl-3">
                    {(() => {
                      const safePhases = normalizePhases(history.upcoming);
                      const periodId = `upcoming`;
                      const isExpanded = expandedPeriods.has(periodId);
                      
                      return (
                        <>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">
                                {safePhases[0].startDate.getFullYear()} - {safePhases[2].endDate.getFullYear()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Age {calculateAge(safePhases[0].startDate)}-{calculateAge(safePhases[2].endDate)}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {safePhases[0].saturnSign} → {safePhases[1].saturnSign} → {safePhases[2].saturnSign}
                              </p>
                            </div>
                            <span className="text-xs text-blue-600 dark:text-blue-400">Upcoming</span>
                          </div>
                          
                          <button
                            onClick={() => togglePeriod(periodId)}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2"
                          >
                            {isExpanded ? 'Hide' : 'View'} effects & remedies
                          </button>
                          
                          {isExpanded && (
                            <div className="mt-3 space-y-3 p-3 bg-muted/50 rounded text-xs">
                              {safePhases.map((phase, idx) => (
                                <div key={idx}>
                                  <p className="font-medium">{phase.phase} Phase</p>
                                  <p className="text-muted-foreground mt-1">Key Effects:</p>
                                  <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-0.5">
                                    {PHASE_EFFECTS[phase.phase].slice(0, 2).map((effect, i) => (
                                      <li key={i}>{effect}</li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
              
              {/* Future Periods */}
              {history.future.length > 0 && (
                <div className="space-y-2">
                  <button
                    onClick={() => toggleSection('future')}
                    className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {expandedSections.has('future') ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                    Future Periods ({history.future.length})
                  </button>
                  
                  {expandedSections.has('future') && (
                    <div className="pl-4 space-y-3">
                      {history.future.map((phases, index) => {
                        const safePhases = normalizePhases(phases);
                        const periodId = `future-${index}`;
                        
                        return (
                          <div key={periodId} className="text-sm border-l-2 border-muted pl-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">
                                  {safePhases[0].startDate.getFullYear()} - {safePhases[2].endDate.getFullYear()}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Age {calculateAge(safePhases[0].startDate)}-{calculateAge(safePhases[2].endDate)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {safePhases[0].saturnSign} → {safePhases[1].saturnSign} → {safePhases[2].saturnSign}
                                </p>
                              </div>
                              <span className="text-xs text-muted-foreground">Future</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              
            </div>
          )}
        </div>
        
      </CardContent>
    </Card>
  );
}
