/**
 * Sade Sati Timeline Component
 * 
 * Displays historical, current, and future Sade Sati periods
 * in a vertical timeline format
 * 
 * @version 1.0.0
 * @created February 28, 2026
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { SadeSatiHistory } from '@/types/sadesati';

interface SadeSatiTimelineProps {
  history: SadeSatiHistory;
  birthDate: Date;
}

export function SadeSatiTimeline({ history, birthDate }: SadeSatiTimelineProps) {
  const currentDate = new Date();
  
  // Helper to calculate age at a given date
  const calculateAge = (date: Date): number => {
    return Math.floor(
      (date.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sade Sati Timeline</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Saturn's 7.5-year challenging periods throughout your life
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-8">
          {/* Past Sade Sati Periods */}
          {history.past.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-4 text-muted-foreground">
                Past Periods
              </h3>
              <div className="space-y-6">
                {history.past.map((phases, index) => {
                  const startYear = phases[0].startDate.getFullYear();
                  const endYear = phases[2].endDate.getFullYear();
                  const startAge = calculateAge(phases[0].startDate);
                  
                  return (
                    <div key={index} className="relative pl-6 border-l-2 border-muted">
                      {/* Timeline dot */}
                      <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-muted border-2 border-background" />
                      
                      <div className="pb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-sm font-medium">
                            {startYear} - {endYear}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            Age {startAge}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1">
                          {phases.map((phase, phaseIndex) => (
                            <p key={phaseIndex} className="text-xs text-muted-foreground">
                              <span className="font-medium">{phase.phase}:</span>{' '}
                              {phase.saturnSign} ({' '}
                              {phase.startDate.toLocaleDateString('en-US', { 
                                month: 'short', 
                                year: 'numeric' 
                              })} - {' '}
                              {phase.endDate.toLocaleDateString('en-US', { 
                                month: 'short', 
                                year: 'numeric' 
                              })})
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Current Sade Sati */}
          {history.current && (
            <>
              {history.past.length > 0 && <Separator />}
              <div>
                <h3 className="text-sm font-semibold mb-4 text-orange-600 dark:text-orange-400">
                  Current Period (Active)
                </h3>
                <div className="relative pl-6 border-l-2 border-orange-500">
                  {/* Timeline dot - larger and animated */}
                  <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-orange-500 border-2 border-background">
                    <div className="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-75" />
                  </div>
                  
                  <div className="pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sm font-medium">
                        {history.current[0].startDate.getFullYear()} - {' '}
                        {history.current[2].endDate.getFullYear()}
                      </p>
                      <Badge className="text-xs bg-orange-500 hover:bg-orange-600">
                        Active Now
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 mb-3">
                      {history.current.map((phase, phaseIndex) => {
                        const isCurrentPhase = phase.endDate > currentDate && phase.startDate <= currentDate;
                        
                        return (
                          <div 
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
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Progress indicator */}
                    <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-950/30 rounded border border-orange-200 dark:border-orange-900">
                      <p className="text-xs text-orange-800 dark:text-orange-200">
                        <strong>Note:</strong> You are currently experiencing Sade Sati. 
                        This period brings challenges but also opportunities for growth and karmic lessons.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Next Sade Sati */}
          <Separator />
          <div>
            <h3 className="text-sm font-semibold mb-4 text-muted-foreground">
              Next Period
            </h3>
            <div className="relative pl-6 border-l-2 border-muted border-dashed">
              {/* Timeline dot */}
              <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-muted/50 border-2 border-background" />
              
              <div>
                <p className="text-sm font-medium mb-2">
                  Starts: {history.next.startDate.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-xs">
                    {history.next.yearsFromNow.toFixed(1)} years from now
                  </Badge>
                  {calculateAge(history.next.startDate) > 0 && (
                    <Badge variant="outline" className="text-xs">
                      Age {calculateAge(history.next.startDate)}
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-1">
                  {history.next.phases.map((phase, phaseIndex) => (
                    <p key={phaseIndex} className="text-xs text-muted-foreground">
                      <span className="font-medium">{phase.phase}:</span>{' '}
                      {phase.saturnSign} ({' '}
                      {phase.startDate.toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                      })} - {' '}
                      {phase.endDate.toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                      })})
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Info Box */}
          <div className="p-4 bg-muted/50 rounded-lg border">
            <p className="text-xs text-muted-foreground">
              <strong>About Sade Sati:</strong> Saturn takes approximately 29.5 years 
              to orbit through all 12 zodiac signs. Sade Sati occurs when Saturn 
              transits through the 12th, 1st, and 2nd houses from your natal Moon, 
              lasting approximately 7.5 years.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
