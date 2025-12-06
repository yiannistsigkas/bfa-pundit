import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalculatedMetrics, formatValue, METRICS_INFO } from '@/lib/financialCalculations';
import { TableIcon } from 'lucide-react';

interface DataTableProps {
  data: CalculatedMetrics[];
  selectedMetrics: string[];
  title?: string;
}

export function DataTable({ data, selectedMetrics, title = "Financial Metrics" }: DataTableProps) {
  const metricsToShow = METRICS_INFO.filter(m => selectedMetrics.includes(m.key));

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <TableIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No data to display</p>
          <p className="text-sm text-muted-foreground/70">Load sample data or upload a CSV file to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <TableIcon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="font-semibold">Company</TableHead>
              <TableHead className="font-semibold text-right">Year</TableHead>
              {metricsToShow.map(metric => (
                <TableHead key={metric.key} className="font-semibold text-right">
                  {metric.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow key={`${row.company_name}-${row.year}-${idx}`} className="border-border">
                <TableCell className="font-medium">{row.company_name}</TableCell>
                <TableCell className="text-right tabular-nums">{row.year}</TableCell>
                {metricsToShow.map(metric => (
                  <TableCell key={metric.key} className="text-right tabular-nums">
                    {formatValue(row[metric.key as keyof CalculatedMetrics] as number | null, metric.isPercentage)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
