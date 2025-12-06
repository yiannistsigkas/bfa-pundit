import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CalculatedMetrics, METRICS_INFO, formatValue } from '@/lib/financialCalculations';
import { Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BenchmarkComparisonProps {
  data: CalculatedMetrics[];
  companies: string[];
  selectedMetrics: string[];
}

// Industry benchmark averages (typical values)
const BENCHMARKS: Record<string, { low: number; avg: number; high: number; unit: string; higherIsBetter: boolean }> = {
  netMargin: { low: 0.05, avg: 0.10, high: 0.20, unit: '%', higherIsBetter: true },
  ebitMargin: { low: 0.08, avg: 0.15, high: 0.25, unit: '%', higherIsBetter: true },
  roa: { low: 0.03, avg: 0.06, high: 0.12, unit: '%', higherIsBetter: true },
  roe: { low: 0.08, avg: 0.15, high: 0.25, unit: '%', higherIsBetter: true },
  debtToEquity: { low: 0.3, avg: 0.8, high: 1.5, unit: 'x', higherIsBetter: false },
  peRatio: { low: 10, avg: 20, high: 35, unit: 'x', higherIsBetter: false },
  evToEbit: { low: 8, avg: 15, high: 25, unit: 'x', higherIsBetter: false },
  evToEbitda: { low: 6, avg: 12, high: 20, unit: 'x', higherIsBetter: false },
};

type RatingType = 'excellent' | 'good' | 'average' | 'poor';

function getRating(value: number | null, benchmark: typeof BENCHMARKS[string]): RatingType {
  if (value === null) return 'average';
  
  if (benchmark.higherIsBetter) {
    if (value >= benchmark.high) return 'excellent';
    if (value >= benchmark.avg) return 'good';
    if (value >= benchmark.low) return 'average';
    return 'poor';
  } else {
    if (value <= benchmark.low) return 'excellent';
    if (value <= benchmark.avg) return 'good';
    if (value <= benchmark.high) return 'average';
    return 'poor';
  }
}

const RATING_STYLES: Record<RatingType, string> = {
  excellent: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  good: 'bg-primary/10 text-primary border-primary/20',
  average: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  poor: 'bg-destructive/10 text-destructive border-destructive/20',
};

const RATING_LABELS: Record<RatingType, string> = {
  excellent: 'Excellent',
  good: 'Good',
  average: 'Average',
  poor: 'Below Avg',
};

export function BenchmarkComparison({ data, companies, selectedMetrics }: BenchmarkComparisonProps) {
  const benchmarkData = useMemo(() => {
    const targetCompanies = companies.length > 0 ? companies : [...new Set(data.map(d => d.company_name))];
    const metricsToShow = METRICS_INFO.filter(m => selectedMetrics.includes(m.key) && BENCHMARKS[m.key]);
    
    // Get latest year data for each company
    const latestData: Record<string, CalculatedMetrics> = {};
    targetCompanies.forEach(company => {
      const companyRecords = data.filter(d => d.company_name === company);
      if (companyRecords.length > 0) {
        const maxYear = Math.max(...companyRecords.map(d => d.year));
        latestData[company] = companyRecords.find(d => d.year === maxYear)!;
      }
    });

    return { latestData, metricsToShow, targetCompanies: Object.keys(latestData) };
  }, [data, companies, selectedMetrics]);

  const { latestData, metricsToShow, targetCompanies } = benchmarkData;

  if (targetCompanies.length === 0 || metricsToShow.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Target className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No data available for benchmark comparison</p>
          <p className="text-sm text-muted-foreground/70">Select companies and metrics to compare against industry benchmarks</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Target className="h-4 w-4" />
          Industry Benchmark Comparison
        </CardTitle>
        <CardDescription>
          Comparing latest year metrics against typical industry benchmarks
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="font-semibold">Company</TableHead>
              {metricsToShow.map(metric => (
                <TableHead key={metric.key} className="font-semibold text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span>{metric.name}</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      Avg: {BENCHMARKS[metric.key].unit === '%' 
                        ? `${(BENCHMARKS[metric.key].avg * 100).toFixed(0)}%`
                        : `${BENCHMARKS[metric.key].avg}${BENCHMARKS[metric.key].unit}`
                      }
                    </span>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {targetCompanies.map(company => {
              const companyData = latestData[company];
              return (
                <TableRow key={company} className="border-border">
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{company}</span>
                      <span className="text-xs text-muted-foreground">{companyData.year}</span>
                    </div>
                  </TableCell>
                  {metricsToShow.map(metric => {
                    const value = companyData[metric.key as keyof CalculatedMetrics] as number | null;
                    const benchmark = BENCHMARKS[metric.key];
                    const rating = getRating(value, benchmark);
                    
                    return (
                      <TableCell key={metric.key} className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="tabular-nums font-medium">
                            {formatValue(value, metric.isPercentage)}
                          </span>
                          <Badge variant="outline" className={cn("text-xs", RATING_STYLES[rating])}>
                            {RATING_LABELS[rating]}
                          </Badge>
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Benchmark Legend */}
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-sm font-medium mb-2">Rating Scale</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(RATING_LABELS) as RatingType[]).map(rating => (
              <Badge key={rating} variant="outline" className={cn("text-xs", RATING_STYLES[rating])}>
                {RATING_LABELS[rating]}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            * Benchmarks are general industry averages and may vary by sector
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
