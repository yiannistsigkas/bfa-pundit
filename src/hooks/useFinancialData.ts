import { useState, useCallback, useMemo } from 'react';
import { FinancialRecord, computeAllMetrics, CalculatedMetrics } from '@/lib/financialCalculations';
import { loadSampleData, parseCSV, exportToCSV } from '@/lib/csvParser';

export function useFinancialData() {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    'netMargin', 'roe', 'debtToEquity', 'peRatio'
  ]);

  const loadSample = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await loadSampleData();
      setRecords(data);
    } catch (error) {
      console.error('Failed to load sample data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadFromFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      setRecords(prev => [...prev, ...parsed]);
    };
    reader.readAsText(file);
  }, []);

  const clearData = useCallback(() => {
    setRecords([]);
  }, []);

  const clearCompany = useCallback((companyName: string) => {
    setRecords(prev => prev.filter(r => r.company_name !== companyName));
  }, []);

  const companies = useMemo(() => {
    return [...new Set(records.map(r => r.company_name))].sort();
  }, [records]);

  const years = useMemo(() => {
    return [...new Set(records.map(r => r.year))].sort((a, b) => a - b);
  }, [records]);

  const calculatedData = useMemo(() => {
    return records.map(computeAllMetrics);
  }, [records]);

  const getCompanyData = useCallback((companyName: string): CalculatedMetrics[] => {
    return calculatedData.filter(d => d.company_name === companyName);
  }, [calculatedData]);

  const exportResults = useCallback((filename: string = 'financial_analysis.csv') => {
    const headers = ['company_name', 'year', ...selectedMetrics];
    const data = calculatedData.map(row => ({
      company_name: row.company_name,
      year: row.year,
      ...selectedMetrics.reduce((acc, metric) => ({
        ...acc,
        [metric]: row[metric as keyof CalculatedMetrics]
      }), {})
    }));
    exportToCSV(data, headers, filename);
  }, [calculatedData, selectedMetrics]);

  return {
    records,
    calculatedData,
    companies,
    years,
    isLoading,
    selectedMetrics,
    setSelectedMetrics,
    loadSample,
    loadFromFile,
    clearData,
    clearCompany,
    getCompanyData,
    exportResults,
  };
}
