/**
 * Sade Sati Card Component
 * 
 * Displays current Sade Sati status with phase information,
 * progress bar, effects, and remedies
 * 
 * @file src/components/chart/sadesati/SadeSatiCard.tsx
 * @version 1.0.0
 * @created February 28, 2026
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  ChevronRight 
} from 'lucide-react';
import type { SadeSatiAnalysis } from '@/types/sadesati';
import { formatDuration } from '@/lib/astrology/sadesati/calculator';

interface SadeSatiCardProps {
  analysis: SadeSatiAnalysis;
  onViewTimeline?: () => void;
}

export function SadeSatiCard({ analysis, onViewTimeline }: SadeSatiCardProps) {
  const { current, insights } = analysis;
  
  // Not active - show next Sade Sati info
  if (!current.isActive) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Sade Sati Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mb-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
            
            <p className="text-lg font-medium mb-2">
              No Active Sade Sati Period
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              You are currently not under Saturn's challenging transit
            </p>
            
            {analysis.history.next && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">
                  Next Sade Sati begins
                </p>
                <p className="text-base font-medium">
                  {analysis.history.next.startDate.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  ({analysis.history.next.yearsFromNow.toFixed(1)} years from now)
                </p>
              </div>
            )}
            
            {onViewTimeline && (
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={onViewTimeline}
              >
                View Timeline
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Active Sade Sati - show detailed info
  const { currentPhase, allPhases, elapsedPercentage, daysRemainingInPhase, daysRemainingTotal } = current;
  
  if (!currentPhase) return null;
  
  // Phase color
  const phaseColors = {
    Rising: 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-500 text-yellow-700 dark:text-yellow-300',
    Peak: 'bg-red-100 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300',
    Setting: 'bg-orange-100 dark:bg-orange-900/20 border-orange-500 text-orange-700 dark:text-orange-300',
  };
  
  return (
    <Card className="border-orange-200 dark:border-orange-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Active Sade Sati - {currentPhase.phase} Phase
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Phase Badge */}
        <div className="flex justify-center">
          <Badge 
            variant="outline" 
            className={`text-base px-4 py-2 ${phaseColors[currentPhase.phase]}`}
          >
            {currentPhase.phase} Phase
          </Badge>
        </div>
        
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">
              {elapsedPercentage?.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={elapsedPercentage} 
            className="h-2"
          />
          <p className="text-xs text-muted-foreground text-center">
            {formatDuration(daysRemainingTotal || 0)} remaining in Sade Sati
          </p>
        </div>
        
        {/* Timeline Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
            <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Started</p>
              <p className="text-sm font-medium truncate">
                {current.startDate?.toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
            <Clock className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Current Phase</p>
              <p className="text-sm font-medium truncate">
                {formatDuration(daysRemainingInPhase || 0)} left
              </p>
            </div>
          </div>
        </div>
        
        {/* Three Phases Timeline */}
        <div className="space-y-2">
          <p className="text-sm font-medium">All Phases:</p>
          <div className="space-y-2">
            {allPhases?.map((phase, index) => {
              const isCurrentPhase = phase.phase === currentPhase.phase;
              const isPastPhase = index < allPhases.findIndex(p => p.phase === currentPhase.phase);
              
              return (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border transition-colors ${
                    isCurrentPhase
                      ? phaseColors[phase.phase]
                      : isPastPhase
                      ? 'border-muted bg-muted/30 opacity-60'
                      : 'border-muted bg-muted/10'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{phase.phase}</p>
                        {isCurrentPhase && (
                          <Badge variant="secondary" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Saturn in {phase.saturnSign}
                      </p>
                    </div>
                    <div className="text-right text-xs shrink-0 ml-2">
                      <p className="font-medium">
                        {phase.startDate.getFullYear()}
                      </p>
                      <p className="text-muted-foreground">
                        {phase.startDate.toLocaleDateString('en-US', { 
                          month: 'short' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Current Phase Effects */}
        {insights && (
          <div className="space-y-3">
            <p className="font-medium">Key Effects:</p>
            <ul className="space-y-2 text-sm">
              {insights.effects.slice(0, 3).map((effect, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1 shrink-0">•</span>
                  <span className="text-muted-foreground">{effect}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Remedies */}
        {insights && (
          <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
            <p className="font-medium text-blue-900 dark:text-blue-100">
              🙏 Recommended Remedies:
            </p>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              {insights.remedies.slice(0, 3).map((remedy, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0">✓</span>
                  <span>{remedy}</span>
                </li>
              ))}
            </ul>
            {insights.remedies.length > 3 && (
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                +{insights.remedies.length - 3} more remedies available
              </p>
            )}
          </div>
        )}
        
        {/* Positive Aspects */}
        {insights && insights.positiveAspects.length > 0 && (
          <div className="space-y-3 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
            <p className="font-medium text-green-900 dark:text-green-100">
              ✨ Silver Lining:
            </p>
            <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
              {insights.positiveAspects.slice(0, 2).map((aspect, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0">→</span>
                  <span>{aspect}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* View Timeline Button */}
        {onViewTimeline && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onViewTimeline}
          >
            View Complete Timeline
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
