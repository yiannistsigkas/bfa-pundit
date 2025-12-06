import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CalculatedMetrics, METRICS_INFO, formatValue } from '@/lib/financialCalculations';
import { TrendingUp } from 'lucide-react';

interface ComparisonChartProps {
  data: CalculatedMetrics[];
  selectedCompanies: string[];
  metric: string;
  title?: string;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function ComparisonChart({ data, selectedCompanies, metric, title }: ComparisonChartProps) {
  const metricInfo = METRICS_INFO.find(m => m.key === metric);
  
  // Get all years
  const years = [...new Set(data.map(d => d.year))].sort((a, b) => a - b);
  
  // Transform data for Recharts
  const chartData = years.map(year => {
    const point: Record<string, number | string | null> = { year };
    selectedCompanies.forEach(company => {
      const record = data.find(d => d.company_name === company && d.year === year);
      const value = record?.[metric as keyof CalculatedMetrics] as number | null;
      point[company] = value !== null && metricInfo?.isPercentage ? value * 100 : value;
    });
    return point;
  });

  if (selectedCompanies.length === 0 || !metricInfo) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Select companies to view chart</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <TrendingUp className="h-4 w-4" />
          {title || `${metricInfo.name} Comparison`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="year" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => metricInfo.isPercentage ? `${value.toFixed(0)}%` : value.toFixed(1)}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  color: 'hsl(var(--card-foreground))'
                }}
                formatter={(value: number) => [
                  formatValue(metricInfo.isPercentage ? value / 100 : value, metricInfo.isPercentage),
                  ''
                ]}
              />
              <Legend />
              {selectedCompanies.map((company, idx) => (
                <Line
                  key={company}
                  type="monotone"
                  dataKey={company}
                  stroke={COLORS[idx % COLORS.length]}
                  strokeWidth={2}
                  dot={{ fill: COLORS[idx % COLORS.length], strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
