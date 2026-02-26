'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { BookOpen, Target, Pin, Compass, BookMarked } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { DivisionalChartInfo } from './DivisionalChartConfig';

interface ChartEducationProps {
  chartInfo: DivisionalChartInfo;
  className?: string;
}

export function ChartEducation({ chartInfo, className }: ChartEducationProps) {
  return (
    <Accordion type="single" collapsible defaultValue="education" className={className}>
      <AccordionItem value="education" className="border rounded-lg px-4">
        <AccordionTrigger className="text-lg font-semibold hover:no-underline">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-primary" />
            <span>What This Chart Means</span>
          </div>
        </AccordionTrigger>
        
        <AccordionContent className="space-y-6 pt-4 pb-6">
          <Section icon={<Target className="h-4 w-4" />} title="Primary Significance">
            <p className="text-muted-foreground leading-relaxed">{chartInfo.primarySignifies}</p>
          </Section>
          
          {chartInfo.alsoSignifies.length > 0 && (
            <Section icon={<Pin className="h-4 w-4" />} title="Also Indicates">
              <ul className="space-y-2">
                {chartInfo.alsoSignifies.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-1">•</span>
                    <span className="flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
          
          <Section icon={<Compass className="h-4 w-4" />} title="How to Interpret">
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {chartInfo.interpretation}
            </div>
          </Section>
          
          {chartInfo.keyHouses.length > 0 && (
            <Section icon={<BookMarked className="h-4 w-4" />} title="Key Houses to Analyze">
              <div className="space-y-3">
                {chartInfo.keyHouses.map((house, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                    <Badge variant="outline" className="shrink-0 font-mono">{house.house}</Badge>
                    <p className="text-sm text-muted-foreground">{house.meaning}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}
          
          {chartInfo.examples.length > 0 && (
            <Section icon={<BookMarked className="h-4 w-4" />} title="Examples">
              <div className="space-y-3">
                {chartInfo.examples.map((example, i) => (
               <div key={i} className="p-3 rounded-lg bg-accent border text-foreground">
   
                    <p className="text-sm">{example}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}
          
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">Chart Division:</span>
              <span>
                Each sign divided into {chartInfo.division} equal part
                {chartInfo.division !== 1 ? 's' : ''} of{' '}
                {chartInfo.division === 1 ? '30°' : `${(30 / chartInfo.division).toFixed(2)}°`} each
              </span>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode; }) {
  return (
    <div className="space-y-3">
      <h4 className="font-semibold flex items-center gap-2 text-foreground">
        {icon}
        <span>{title}</span>
      </h4>
      {children}
    </div>
  );
}
