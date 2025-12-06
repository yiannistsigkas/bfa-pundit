import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { METRICS_INFO } from '@/lib/financialCalculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

interface MetricSelectorProps {
  selectedMetrics: string[];
  onSelect: (metrics: string[]) => void;
}

export function MetricSelector({ selectedMetrics, onSelect }: MetricSelectorProps) {
  const toggleMetric = (metricKey: string) => {
    if (selectedMetrics.includes(metricKey)) {
      onSelect(selectedMetrics.filter(m => m !== metricKey));
    } else {
      onSelect([...selectedMetrics, metricKey]);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <BarChart3 className="h-4 w-4" />
          Select Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {METRICS_INFO.map(metric => (
          <div key={metric.key} className="flex items-start space-x-2">
            <Checkbox
              id={metric.key}
              checked={selectedMetrics.includes(metric.key)}
              onCheckedChange={() => toggleMetric(metric.key)}
            />
            <div className="grid gap-0.5 leading-none">
              <Label
                htmlFor={metric.key}
                className="text-sm font-medium cursor-pointer"
              >
                {metric.name}
              </Label>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
