'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface DashaLevel {
  type: 'mahadasha' | 'antardasha' | 'pratyantar' | 'sookshma';
  data: any[];
  parentInfo?: string;
}

interface DashaTimelineProps {
  dasa: {
    mahadasha: {
      lord: string;
      startDate: string | Date;
      endDate: string | Date;
      balance: {
        years: number;
        months: number;
        days: number;
      };
    };
    mahadashaCycle: Array<{
      lord: string;
      startDate: string | Date;
      endDate: string | Date;
      years: number;
      antardashas: Array<{
        lord: string;
        startDate: string | Date;
        endDate: string | Date;
        years: number;
        pratyantars?: Array<{
          lord: string;
          startDate: string | Date;
          endDate: string | Date;
          years: number;
          sookshmas?: Array<{
            lord: string;
            startDate: string | Date;
            endDate: string | Date;
            years: number;
          }>;
        }>;
      }>;
    }>;
  };
}

export function DashaTimeline({ dasa }: DashaTimelineProps) {
  const [viewStack, setViewStack] = useState<DashaLevel[]>([
    {
      type: 'mahadasha',
      data: dasa.mahadashaCycle,
    },
  ]);

  const currentView = viewStack[viewStack.length - 1];

  const handleDrillDown = (item: any, nextType: DashaLevel['type'], nextData: any[], parentInfo: string) => {
    setViewStack([
      ...viewStack,
      {
        type: nextType,
        data: nextData,
        parentInfo,
      },
    ]);
  };

  const handleGoBack = () => {
    if (viewStack.length > 1) {
      setViewStack(viewStack.slice(0, -1));
    }
  };

  const parseDate = (dateInput: string | Date): Date => {
    if (dateInput instanceof Date) return dateInput;
    
    const date = new Date(dateInput);
    if (!isNaN(date.getTime())) return date;
    
    return new Date();
  };

  const formatDate = (dateInput: string | Date): string => {
    try {
      const date = parseDate(dateInput);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Date formatting error:', error, dateInput);
      return 'Invalid Date';
    }
  };

  const formatDuration = (years: number): string => {
    if (!years || isNaN(years)) return '0d';
    
    const totalDays = Math.round(years * 365.25);
    const y = Math.floor(years);
    const remainingDays = totalDays - (y * 365);
    const m = Math.floor(remainingDays / 30);
    const d = remainingDays % 30;

    const parts = [];
    if (y > 0) parts.push(`${y}y`);
    if (m > 0) parts.push(`${m}m`);
    if (d > 0) parts.push(`${d}d`);
    return parts.join(' ') || '0d';
  };

  const getLevelTitle = () => {
    switch (currentView.type) {
      case 'mahadasha':
        return 'Mahadasha (120-Year Cycle)';
      case 'antardasha':
        return 'Antardasha Periods';
      case 'pratyantar':
        return 'Pratyantar Periods';
      case 'sookshma':
        return 'Sookshma Periods';
      default:
        return 'Dasha Periods';
    }
  };

  const getNextLevel = (type: DashaLevel['type']): DashaLevel['type'] | null => {
    switch (type) {
      case 'mahadasha': return 'antardasha';
      case 'antardasha': return 'pratyantar';
      case 'pratyantar': return 'sookshma';
      case 'sookshma': return null;
      default: return null;
    }
  };

  const getNextData = (item: any, type: DashaLevel['type']) => {
    switch (type) {
      case 'mahadasha': return item.antardashas || [];
      case 'antardasha': return item.pratyantars || [];
      case 'pratyantar': return item.sookshmas || [];
      default: return [];
    }
  };

  const isCurrentPeriod = (startDate: string | Date, endDate: string | Date): boolean => {
    try {
      const now = new Date();
      const start = parseDate(startDate);
      const end = parseDate(endDate);
      return now >= start && now <= end;
    } catch {
      return false;
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{getLevelTitle()}</h3>
            {currentView.parentInfo && (
              <p className="text-sm text-muted-foreground">{currentView.parentInfo}</p>
            )}
          </div>
          {viewStack.length > 1 && (
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          )}
        </div>

        {currentView.type === 'mahadasha' && dasa.mahadasha && (
          <div className="bg-primary/10 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Mahadasha:</span>
              <Badge variant="default">{dasa.mahadasha.lord}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              <div>
                {formatDate(dasa.mahadasha.startDate)} to {formatDate(dasa.mahadasha.endDate)}
              </div>
              {dasa.mahadasha.balance && (
                <div className="mt-1">
                  Balance at birth: {dasa.mahadasha.balance.years || 0}y{' '}
                  {dasa.mahadasha.balance.months || 0}m{' '}
                  {dasa.mahadasha.balance.days || 0}d
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          {currentView.data.map((item, index) => {
            const isCurrent = isCurrentPeriod(item.startDate, item.endDate);
            const nextLevel = getNextLevel(currentView.type);
            const nextData = getNextData(item, currentView.type);
            const hasChildren = nextData && nextData.length > 0;

            return (
              <div
                key={index}
                className={`
                  rounded-lg p-4 border transition-colors
                  ${isCurrent ? 'bg-primary/10 border-primary' : 'bg-card hover:bg-accent'}
                  ${hasChildren ? 'cursor-pointer' : ''}
                `}
                onClick={() => {
                  if (hasChildren && nextLevel) {
                    handleDrillDown(
                      item,
                      nextLevel,
                      nextData,
                      `${currentView.type === 'mahadasha' ? 'Mahadasha' : currentView.type === 'antardasha' ? 'Antardasha' : 'Pratyantar'}: ${item.lord}`
                    );
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {hasChildren && (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.lord}</span>
                        {isCurrent && (
                          <Badge variant="default" className="text-xs">Running</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDuration(item.years)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div>{formatDate(item.startDate)}</div>
                    <div className="text-muted-foreground">to</div>
                    <div>{formatDate(item.endDate)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-xs text-muted-foreground text-center pt-2">
          {currentView.type === 'mahadasha' && 'Click on a Mahadasha to see its Antardashas'}
          {currentView.type === 'antardasha' && 'Click on an Antardasha to see its Pratyantars'}
          {currentView.type === 'pratyantar' && 'Click on a Pratyantar to see its Sookshmams'}
          {currentView.type === 'sookshma' && 'Finest division reached'}
        </div>
      </div>
    </Card>
  );
}
