import { FinancialRecord } from './financialCalculations';

const NUMERIC_FIELDS = [
  'revenue',
  'cogs',
  'ebit',
  'net_income',
  'total_assets',
  'total_equity',
  'total_debt',
  'shares_outstanding',
  'share_price',
  'ebitda',
] as const;

function safeFloat(value: string | undefined): number | null {
  if (!value || value.trim() === '') return null;
  const num = parseFloat(value.trim());
  return isNaN(num) ? null : num;
}

function safeInt(value: string | undefined): number | null {
  if (!value || value.trim() === '') return null;
  const num = parseInt(value.trim(), 10);
  return isNaN(num) ? null : num;
}

export function parseCSV(csvText: string): FinancialRecord[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  const records: FinancialRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row: Record<string, string> = {};
    
    headers.forEach((header, idx) => {
      row[header] = values[idx]?.trim() || '';
    });

    const companyName = row['company_name'] || '';
    const year = safeInt(row['year']);

    if (!companyName || year === null) continue;

    const record: FinancialRecord = {
      company_name: companyName,
      year: year,
      revenue: safeFloat(row['revenue']),
      cogs: safeFloat(row['cogs']),
      ebit: safeFloat(row['ebit']),
      net_income: safeFloat(row['net_income']),
      total_assets: safeFloat(row['total_assets']),
      total_equity: safeFloat(row['total_equity']),
      total_debt: safeFloat(row['total_debt']),
      shares_outstanding: safeFloat(row['shares_outstanding']),
      share_price: safeFloat(row['share_price']),
      ebitda: safeFloat(row['ebitda']),
    };

    records.push(record);
  }

  return records;
}

export async function loadSampleData(): Promise<FinancialRecord[]> {
  const response = await fetch('/data/sample_financials.csv');
  const text = await response.text();
  return parseCSV(text);
}

export function exportToCSV(
  data: Array<Record<string, unknown>>,
  headers: string[],
  filename: string
): void {
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(h => row[h] ?? '').join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
