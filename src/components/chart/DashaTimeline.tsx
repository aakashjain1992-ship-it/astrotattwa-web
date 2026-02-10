'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';

interface MahadashaItem {
  lord: string;
  startUtc: string;
  endUtc: string;
  durationDays: number;
  durationYears: number;
}

interface DashaTimelineProps {
  dasa: {
    balance: {
      classical360: {
        mahadashaLord: string;
        balanceYears: number;
        balanceMonths: number;
        balanceDays: number;
        balanceText: string;
      };
    };
    currentMahadasha: {
      lord: string;
      startUtc: string;
      endUtc: string;
      durationDays: number;
      durationYears: number;
    };
    allMahadashas: MahadashaItem[];
  };
}

export function DashaTimeline({ dasa }: DashaTimelineProps) {
  const [expandedMahadasha, setExpandedMahadasha] = useState<string | null>(null);
  const [antardashas, setAntardashas] = useState<any[] | null>(null);
  const [loadingAntardasha, setLoadingAntardasha] = useState(false);

  const formatDate = (dateInput: string): string => {
    try {
      const date = new Date(dateInput);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return 'Invalid Date';
    }
  };

  const formatDuration = (years: number): string => {
    if (!years || isNaN(years)) return '0d';
    
    const y = Math.floor(years);
    const remainingMonths = (years - y) * 12;
    const m = Math.floor(remainingMonths);
    const d = Math.round((remainingMonths - m) * 30);

    const parts = [];
    if (y > 0) parts.push(`${y}y`);
    if (m > 0) parts.push(`${m}m`);
    if (d > 0) parts.push(`${d}d`);
    return parts.join(' ') || '0d';
  };

  const isCurrentPeriod = (startUtc: string, endUtc: string): boolean => {
    try {
      const now = new Date();
      const start = new Date(startUtc);
      const end = new Date(endUtc);
      return now >= start && now <= end;
    } catch {
      return false;
    }
  };

  const handleMahadashaClick = async (mahadasha: MahadashaItem) => {
    if (expandedMahadasha === mahadasha.lord) {
      setExpandedMahadasha(null);
      setAntardashas(null);
      return;
    }

    setExpandedMahadasha(mahadasha.lord);
    setLoadingAntardasha(true);

    try {
      const response = await fetch('/api/dasha/antardasha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mahadashaLord: mahadasha.lord,
          mahadashaStart: mahadasha.startUtc,
          mahadashaEnd: mahadasha.endUtc,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAntardashas(data.antardashas || []);
      } else {
        setAntardashas([]);
      }
    } catch {
      setAntardashas([]);
    } finally {
      setLoadingAntardasha(false);
    }
  };

  const balance = dasa.balance?.classical360;
  const current = dasa.currentMahadasha;
  const allMahadashas = dasa.allMahadashas || [];

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Vimshottari Dasha (120-Year Cycle)</h3>

        {/* Current Mahadasha & Balance */}
        {current && (
          <div className="bg-primary/10 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Mahadasha:</span>
              <Badge variant="default">{current.lord}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              <div>
                {formatDate(current.startUtc)} to {formatDate(current.endUtc)}
              </div>
              {balance && (
                <div className="mt-1">
                  Balance at birth: {balance.balanceYears || 0}y{' '}
                  {balance.balanceMonths || 0}m{' '}
                  {balance.balanceDays || 0}d
                </div>
              )}
            </div>
          </div>
        )}

        {/* All Mahadashas */}
        <div className="space-y-2">
          {allMahadashas.map((item, index) => {
            const isCurrent = isCurrentPeriod(item.startUtc, item.endUtc);
            const isExpanded = expandedMahadasha === item.lord;

            return (
              <div key={index}>
                <div
                  className={`
                    rounded-lg p-4 border transition-colors cursor-pointer
                    ${isCurrent ? 'bg-primary/10 border-primary' : 'bg-card hover:bg-accent'}
                  `}
                  onClick={() => handleMahadashaClick(item)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ChevronRight 
                        className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.lord}</span>
                          {isCurrent && (
                            <Badge variant="default" className="text-xs">Running</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDuration(item.durationYears)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div>{formatDate(item.startUtc)}</div>
                      <div className="text-muted-foreground">to</div>
                      <div>{formatDate(item.endUtc)}</div>
                    </div>
                  </div>
                </div>

                {/* Antardashas (loaded on demand) */}
                {isExpanded && (
                  <div className="ml-6 mt-2 space-y-1">
                    {loadingAntardasha ? (
                      <div className="text-sm text-muted-foreground p-2">Loading antardashas...</div>
                    ) : antardashas && antardashas.length > 0 ? (
                      antardashas.map((ad: any, adIndex: number) => (
                        <div
                          key={adIndex}
                          className={`
                            rounded-md p-3 border text-sm
                            ${isCurrentPeriod(ad.startUtc, ad.endUtc) ? 'bg-primary/5 border-primary/50' : 'bg-muted/30'}
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{ad.lord}</span>
                              {isCurrentPeriod(ad.startUtc, ad.endUtc) && (
                                <Badge variant="outline" className="text-xs">Running</Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(ad.startUtc)} - {formatDate(ad.endUtc)}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground p-2">No antardashas available</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-xs text-muted-foreground text-center pt-2">
          Click on a Mahadasha to see its Antardashas
        </div>
      </div>
    </Card>
  );
}
