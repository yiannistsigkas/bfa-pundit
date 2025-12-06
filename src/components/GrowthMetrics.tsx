import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalculatedMetrics, METRICS_INFO } from '@/lib/financialCalculations';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GrowthMetricsProps {
  data: CalculatedMetrics[];
  companies: string[];
  selectedMetrics: string[];
}

interface GrowthData {
  company_name: string;
  metric: string;
  metricName: string;
  yoyGrowth: number | null;
  cagr: number | null;
  startValue: number | null;
  endValue: number | null;
  startYear: number;
  endYear: number;
}

function calculateYoYGrowth(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null || previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function calculateCAGR(startValue: number | null, endValue: number | null, years: number): number | null {
  if (startValue === null || endValue === null || startValue <= 0 || endValue <= 0 || years <= 0) return null;
  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
}

export function GrowthMetrics({ data, companies, selectedMetrics }: GrowthMetricsProps) {
  const growthData = useMemo(() => {
    const results: GrowthData[] = [];
    const targetCompanies = companies.length > 0 ? companies : [...new Set(data.map(d => d.company_name))];
    const metricsToShow = METRICS_INFO.filter(m => selectedMetrics.includes(m.key));

    targetCompanies.forEach(company => {
      const companyData = data
        .filter(d => d.company_name === company)
        .sort((a, b) => a.year - b.year);

      if (companyData.length < 2) return;

      const startYear = companyData[0].year;
      const endYear = companyData[companyData.length - 1].year;
      const yearSpan = endYear - startYear;

      metricsToShow.forEach(metric => {
        const startValue = companyData[0][metric.key as keyof CalculatedMetrics] as number | null;
        const endValue = companyData[companyData.length - 1][metric.key as keyof CalculatedMetrics] as number | null;
        const previousValue = companyData.length > 1 
          ? companyData[companyData.length - 2][metric.key as keyof CalculatedMetrics] as number | null
          : null;

        results.push({
          company_name: company,
          metric: metric.key,
          metricName: metric.name,
          yoyGrowth: calculateYoYGrowth(endValue, previousValue),
          cagr: calculateCAGR(startValue, endValue, yearSpan),
          startValue,
          endValue,
          startYear,
          endYear,
        });
      });
    });

    return results;
  }, [data, companies, selectedMetrics]);

  const formatGrowth = (value: number | null): string => {
    if (value === null) return 'N/A';
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getGrowthIcon = (value: number | null) => {
    if (value === null) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (value > 0) return <ArrowUpRight className="h-4 w-4 text-emerald-500" />;
    if (value < 0) return <ArrowDownRight className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getGrowthClass = (value: number | null) => {
    if (value === null) return 'text-muted-foreground';
    if (value > 0) return 'text-emerald-500';
    if (value < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  if (growthData.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Not enough data for growth analysis</p>
          <p className="text-sm text-muted-foreground/70">Need at least 2 years of data per company</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <TrendingUp className="h-4 w-4" />
          Growth Analysis (YoY & CAGR)
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="font-semibold">Company</TableHead>
              <TableHead className="font-semibold">Metric</TableHead>
              <TableHead className="font-semibold text-right">YoY Growth</TableHead>
              <TableHead className="font-semibold text-right">CAGR</TableHead>
              <TableHead className="font-semibold text-right">Period</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {growthData.map((row, idx) => (
              <TableRow key={`${row.company_name}-${row.metric}-${idx}`} className="border-border">
                <TableCell className="font-medium">{row.company_name}</TableCell>
                <TableCell>{row.metricName}</TableCell>
                <TableCell className="text-right">
                  <span className={cn("flex items-center justify-end gap-1", getGrowthClass(row.yoyGrowth))}>
                    {getGrowthIcon(row.yoyGrowth)}
                    {formatGrowth(row.yoyGrowth)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className={cn("flex items-center justify-end gap-1", getGrowthClass(row.cagr))}>
                    {getGrowthIcon(row.cagr)}
                    {formatGrowth(row.cagr)}
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {row.startYear} — {row.endYear}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
