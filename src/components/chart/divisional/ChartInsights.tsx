'use client';

import { Lightbulb, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { HouseData } from '@/components/chart/diamond';
import type { DivisionalChartInfo } from './DivisionalChartConfig';

export interface ChartInsight {
  type: 'strength' | 'challenge' | 'highlight' | 'neutral';
  icon: string;
  title: string;
  description: string;
  planetsConcerned?: string[];
}

interface ChartInsightsProps {
  houses: HouseData[];
  chartInfo: DivisionalChartInfo;
  className?: string;
}

export function ChartInsights({ houses, chartInfo, className }: ChartInsightsProps) {
  const insights = generateInsights(houses, chartInfo);
  
  if (insights.length === 0) {
    return (
      <Card className={cn('p-8 text-center', className)}>
        <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold mb-2">Insights Coming Soon</h3>
        <p className="text-sm text-muted-foreground">
          Detailed AI-powered insights for {chartInfo.name} chart will be available soon.
        </p>
      </Card>
    );
  }
  
  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-amber-500" />
        Key Insights
      </h3>
      <div className="space-y-3">
        {insights.map((insight, i) => (<InsightCard key={i} insight={insight} />))}
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: ChartInsight }) {
  const config = getInsightConfig(insight.type);
  return (
    <Card className={cn('p-4 border-l-4 transition-all hover:shadow-md', config.borderColor)}>
      <div className="flex items-start gap-3">
        <div className={cn('flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center', config.bgColor)}>
          <config.IconComponent className={cn('h-4 w-4', config.iconColor)} />
        </div>
        <div className="flex-1 space-y-2">
          <h4 className="font-semibold text-sm">{insight.title}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{insight.description}</p>
          {insight.planetsConcerned && insight.planetsConcerned.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {insight.planetsConcerned.map(planet => (
                <Badge key={planet} variant="secondary" className="text-xs">{planet}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function generateInsights(houses: HouseData[], chartInfo: DivisionalChartInfo): ChartInsight[] {
  const insights: ChartInsight[] = [];
  switch (chartInfo.id) {
    case 'd1': insights.push(...generateD1Insights(houses)); break;
    case 'd2': insights.push(...generateD2Insights(houses)); break;
    case 'd9': insights.push(...generateD9Insights(houses)); break;
    case 'd10': insights.push(...generateD10Insights(houses)); break;
    case 'moon': insights.push(...generateMoonChartInsights(houses)); break;
    default: insights.push(...generateGenericInsights(houses, chartInfo));
  }
  return insights;
}

function generateD1Insights(houses: HouseData[]): ChartInsight[] {
  const insights: ChartInsight[] = [];
  const firstHouse = houses[0];
  if (firstHouse.planets.length > 0) {
    insights.push({
      type: 'highlight', icon: '💡', title: 'Strong Self-Identity',
      description: 'Planets in the 1st house directly influence your personality and how you present yourself to the world.',
      planetsConcerned: firstHouse.planets.map(p => p.key)
    });
  }
  const tenthHouse = houses[9];
  if (tenthHouse.planets.length > 0) {
    insights.push({
      type: 'strength', icon: '✓', title: 'Career Potential',
      description: 'Planets in the 10th house indicate strong career focus and potential for professional success.',
      planetsConcerned: tenthHouse.planets.map(p => p.key)
    });
  }
  return insights;
}

function generateD2Insights(houses: HouseData[]): ChartInsight[] {
  const insights: ChartInsight[] = [];
  const secondHouse = houses[1];
  if (secondHouse.planets.length > 0) {
    insights.push({
      type: 'strength', icon: '✓', title: 'Wealth Accumulation',
      description: 'Planets in 2nd house of Hora chart indicate strong earning capacity and ability to accumulate wealth.',
      planetsConcerned: secondHouse.planets.map(p => p.key)
    });
  }
  const eleventhHouse = houses[10];
  if (eleventhHouse.planets.length > 0) {
    insights.push({
      type: 'highlight', icon: '💡', title: 'Multiple Income Sources',
      description: 'The 11th house shows gains and income. Planets here suggest potential for multiple revenue streams.',
      planetsConcerned: eleventhHouse.planets.map(p => p.key)
    });
  }
  return insights;
}

function generateD9Insights(houses: HouseData[]): ChartInsight[] {
  const insights: ChartInsight[] = [];
  const seventhHouse = houses[6];
  if (seventhHouse.planets.length > 0) {
    const planetNames = seventhHouse.planets.map(p => p.key);
    if (planetNames.includes('Venus')) {
      insights.push({
        type: 'strength', icon: '✓', title: 'Harmonious Marriage Potential',
        description: 'Venus in 7th house of Navamsa indicates a loving, harmonious spouse and happy marriage life.',
        planetsConcerned: ['Venus']
      });
    }
    if (planetNames.includes('Mars')) {
      insights.push({
        type: 'challenge', icon: '⚠️', title: 'Passionate But Argumentative',
        description: 'Mars in 7th house can bring passion but also arguments in marriage. Practice patience and understanding.',
        planetsConcerned: ['Mars']
      });
    }
    const otherPlanets = planetNames.filter(p => p !== 'Venus' && p !== 'Mars');
    if (otherPlanets.length > 0) {
      insights.push({
        type: 'highlight', icon: '💡', title: 'Significant Marriage Indicators',
        description: 'Planets in the 7th house of Navamsa strongly influence marriage and partner\'s nature.',
        planetsConcerned: otherPlanets
      });
    }
  }
  const firstHouse = houses[0];
  if (firstHouse.planets.length > 0) {
    insights.push({
      type: 'highlight', icon: '💡', title: 'Soul\'s Path',
      description: 'Planets in 1st house of Navamsa reveal your dharma (life purpose) and spiritual evolution.',
      planetsConcerned: firstHouse.planets.map(p => p.key)
    });
  }
  return insights;
}

function generateD10Insights(houses: HouseData[]): ChartInsight[] {
  const insights: ChartInsight[] = [];
  const tenthHouse = houses[9];
  if (tenthHouse.planets.length > 0) {
    const planetNames = tenthHouse.planets.map(p => p.key);
    if (planetNames.includes('Sun')) {
      insights.push({
        type: 'strength', icon: '✓', title: 'Leadership & Authority',
        description: 'Sun in 10th house of career chart indicates leadership roles and positions of authority.',
        planetsConcerned: ['Sun']
      });
    }
    if (planetNames.includes('Mercury')) {
      insights.push({
        type: 'strength', icon: '✓', title: 'Business & Communication',
        description: 'Mercury in 10th house suggests success in business, communication, or intellectual professions.',
        planetsConcerned: ['Mercury']
      });
    }
    const otherPlanets = planetNames.filter(p => p !== 'Sun' && p !== 'Mercury');
    if (otherPlanets.length > 0) {
      insights.push({
        type: 'highlight', icon: '💡', title: 'Career Direction',
        description: 'Planets in 10th house of Dasamsa chart strongly indicate your professional path and success.',
        planetsConcerned: otherPlanets
      });
    }
  }
  return insights;
}

function generateMoonChartInsights(houses: HouseData[]): ChartInsight[] {
  const insights: ChartInsight[] = [];
  const firstHouse = houses[0];
  if (firstHouse.planets.length > 0) {
    insights.push({
      type: 'highlight', icon: '💡', title: 'Mental Nature',
      description: 'Planets in 1st house from Moon reveal your mental and emotional patterns, how you process feelings.',
      planetsConcerned: firstHouse.planets.map(p => p.key)
    });
  }
  return insights;
}

function generateGenericInsights(houses: HouseData[], chartInfo: DivisionalChartInfo): ChartInsight[] {
  const insights: ChartInsight[] = [];
  chartInfo.keyHouses.forEach(keyHouse => {
    const house = houses[keyHouse.house - 1];
    if (house && house.planets.length > 0) {
      insights.push({
        type: 'highlight', icon: '💡',
        title: `${keyHouse.house}${getOrdinalSuffix(keyHouse.house)} House Activity`,
        description: `${keyHouse.meaning}. Planets here are significant for ${chartInfo.name} analysis.`,
        planetsConcerned: house.planets.map(p => p.key)
      });
    }
  });
  return insights;
}

function getInsightConfig(type: ChartInsight['type']) {
  const configs = {
    strength: {
      IconComponent: CheckCircle,
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      borderColor: 'border-l-green-500'
    },
    challenge: {
      IconComponent: AlertCircle,
      bgColor: 'bg-amber-100 dark:bg-amber-900/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
      borderColor: 'border-l-amber-500'
    },
    highlight: {
      IconComponent: Lightbulb,
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-l-blue-500'
    },
    neutral: {
      IconComponent: Info,
      bgColor: 'bg-gray-100 dark:bg-gray-900/20',
      iconColor: 'text-gray-600 dark:text-gray-400',
      borderColor: 'border-l-gray-500'
    }
  };
  return configs[type];
}

function getOrdinalSuffix(num: number): string {
  const j = num % 10, k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}
