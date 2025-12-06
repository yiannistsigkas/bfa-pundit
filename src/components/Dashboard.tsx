import { useState, useMemo } from 'react';
import { useFinancialData } from '@/hooks/useFinancialData';
import { Header } from './Header';
import { MetricCard } from './MetricCard';
import { DataTable } from './DataTable';
import { ComparisonChart } from './ComparisonChart';
import { MetricSelector } from './MetricSelector';
import { CompanySelector } from './CompanySelector';
import { FileUpload } from './FileUpload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatValue, formatLargeNumber, METRICS_INFO } from '@/lib/financialCalculations';
import { Filter, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

export function Dashboard() {
  const {
    calculatedData,
    companies,
    isLoading,
    selectedMetrics,
    setSelectedMetrics,
    loadSample,
    loadFromFile,
    clearData,
    exportResults,
  } = useFinancialData();

  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [comparisonMetric, setComparisonMetric] = useState('roe');
  const [yearFilter, setYearFilter] = useState<string>('all');

  const years = useMemo(() => {
    return [...new Set(calculatedData.map(d => d.year))].sort((a, b) => a - b);
  }, [calculatedData]);

  const filteredData = useMemo(() => {
    let data = calculatedData;
    if (selectedCompanies.length > 0) {
      data = data.filter(d => selectedCompanies.includes(d.company_name));
    }
    if (yearFilter !== 'all') {
      data = data.filter(d => d.year === parseInt(yearFilter));
    }
    return data;
  }, [calculatedData, selectedCompanies, yearFilter]);

  const latestYearData = useMemo(() => {
    if (calculatedData.length === 0) return [];
    const maxYear = Math.max(...calculatedData.map(d => d.year));
    return calculatedData.filter(d => d.year === maxYear);
  }, [calculatedData]);

  const summaryMetrics = useMemo(() => {
    if (latestYearData.length === 0) return null;
    
    const avgRoe = latestYearData
      .filter(d => d.roe !== null)
      .reduce((acc, d, _, arr) => acc + (d.roe || 0) / arr.length, 0);
    
    const avgPe = latestYearData
      .filter(d => d.peRatio !== null && d.peRatio > 0)
      .reduce((acc, d, _, arr) => acc + (d.peRatio || 0) / arr.length, 0);

    const avgDebtEquity = latestYearData
      .filter(d => d.debtToEquity !== null)
      .reduce((acc, d, _, arr) => acc + (d.debtToEquity || 0) / arr.length, 0);

    return {
      companies: companies.length,
      avgRoe,
      avgPe,
      avgDebtEquity,
    };
  }, [latestYearData, companies]);

  const handleLoadSample = async () => {
    await loadSample();
    toast.success('Sample data loaded successfully');
  };

  const handleFileUpload = (file: File) => {
    loadFromFile(file);
    toast.success(`Loaded data from ${file.name}`);
  };

  const handleClearData = () => {
    clearData();
    setSelectedCompanies([]);
    toast.info('All data cleared');
  };

  const handleExport = () => {
    exportResults();
    toast.success('Data exported to CSV');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        hasData={calculatedData.length > 0}
        onLoadSample={handleLoadSample}
        onClearData={handleClearData}
        onExport={handleExport}
        isLoading={isLoading}
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {calculatedData.length === 0 ? (
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <FileUpload onFileSelect={handleFileUpload} />
            <Card 
              className="cursor-pointer hover:bg-muted/50 transition-colors border-dashed"
              onClick={handleLoadSample}
            >
              <CardContent className="flex flex-col items-center justify-center gap-2 p-8">
                <div className="p-3 rounded-full bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Load Sample Data</p>
                  <p className="text-sm text-muted-foreground">
                    Apple, Netflix, Credit Suisse & more
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            {summaryMetrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                  title="Companies"
                  value={summaryMetrics.companies.toString()}
                  description="In dataset"
                />
                <MetricCard
                  title="Avg ROE"
                  value={formatValue(summaryMetrics.avgRoe, true)}
                  description="Latest year"
                  trend={summaryMetrics.avgRoe > 0.15 ? 'up' : summaryMetrics.avgRoe > 0.05 ? 'neutral' : 'down'}
                />
                <MetricCard
                  title="Avg P/E"
                  value={formatValue(summaryMetrics.avgPe)}
                  description="Latest year"
                  trend={summaryMetrics.avgPe < 20 ? 'up' : summaryMetrics.avgPe < 35 ? 'neutral' : 'down'}
                />
                <MetricCard
                  title="Avg Debt/Equity"
                  value={formatValue(summaryMetrics.avgDebtEquity)}
                  description="Latest year"
                  trend={summaryMetrics.avgDebtEquity < 1 ? 'up' : summaryMetrics.avgDebtEquity < 2 ? 'neutral' : 'down'}
                />
              </div>
            )}

            <Tabs defaultValue="table" className="space-y-6">
              <TabsList>
                <TabsTrigger value="table">Data Table</TabsTrigger>
                <TabsTrigger value="compare">Compare</TabsTrigger>
              </TabsList>

              <TabsContent value="table" className="space-y-6">
                <MetricSelector 
                  selectedMetrics={selectedMetrics}
                  onSelect={setSelectedMetrics}
                />

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base font-medium">
                      <Filter className="h-4 w-4" />
                      Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Companies</label>
                      <CompanySelector
                        companies={companies}
                        selectedCompanies={selectedCompanies}
                        onSelect={setSelectedCompanies}
                        multiple
                        placeholder="All companies"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Year</label>
                      <Select value={yearFilter} onValueChange={setYearFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All years" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All years</SelectItem>
                          {years.map(year => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <DataTable 
                  data={filteredData} 
                  selectedMetrics={selectedMetrics}
                />
              </TabsContent>

              <TabsContent value="compare" className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base font-medium">
                      <BarChart3 className="h-4 w-4" />
                      Comparison Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Companies</label>
                      <CompanySelector
                        companies={companies}
                        selectedCompanies={selectedCompanies}
                        onSelect={setSelectedCompanies}
                        multiple
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Metric to Compare</label>
                      <Select value={comparisonMetric} onValueChange={setComparisonMetric}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {METRICS_INFO.map(metric => (
                            <SelectItem key={metric.key} value={metric.key}>
                              {metric.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <ComparisonChart
                  data={calculatedData}
                  selectedCompanies={selectedCompanies}
                  metric={comparisonMetric}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>

      <footer className="border-t border-border mt-auto">
        <div className="container mx-auto px-4 py-4">
          <p className="text-sm text-muted-foreground text-center">
            Sample data is for demonstration purposes only and does not represent actual financial data.
          </p>
        </div>
      </footer>
    </div>
  );
}
