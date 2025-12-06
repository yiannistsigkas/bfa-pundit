/**
 * Financial calculations module
 * Pure functions for financial ratios and valuation multiples
 */

export interface FinancialRecord {
  company_name: string;
  year: number;
  revenue: number | null;
  cogs: number | null;
  ebit: number | null;
  net_income: number | null;
  total_assets: number | null;
  total_equity: number | null;
  total_debt: number | null;
  shares_outstanding: number | null;
  share_price: number | null;
  ebitda: number | null;
}

export interface CalculatedMetrics {
  company_name: string;
  year: number;
  netMargin: number | null;
  ebitMargin: number | null;
  roa: number | null;
  roe: number | null;
  debtToEquity: number | null;
  eps: number | null;
  peRatio: number | null;
  evToEbit: number | null;
  evToEbitda: number | null;
  enterpriseValue: number | null;
}

/**
 * Safe division - returns null if denominator is 0 or if either value is null
 */
function safeDiv(numerator: number | null, denominator: number | null): number | null {
  if (numerator === null || denominator === null || denominator === 0) {
    return null;
  }
  return numerator / denominator;
}

/**
 * Net margin = net_income / revenue
 */
export function netMargin(record: FinancialRecord): number | null {
  return safeDiv(record.net_income, record.revenue);
}

/**
 * EBIT margin = ebit / revenue
 */
export function ebitMargin(record: FinancialRecord): number | null {
  return safeDiv(record.ebit, record.revenue);
}

/**
 * Return on Assets (ROA) = net_income / total_assets
 */
export function returnOnAssets(record: FinancialRecord): number | null {
  return safeDiv(record.net_income, record.total_assets);
}

/**
 * Return on Equity (ROE) = net_income / total_equity
 */
export function returnOnEquity(record: FinancialRecord): number | null {
  return safeDiv(record.net_income, record.total_equity);
}

/**
 * Debt to Equity = total_debt / total_equity
 */
export function debtToEquity(record: FinancialRecord): number | null {
  return safeDiv(record.total_debt, record.total_equity);
}

/**
 * Earnings per Share (EPS) = net_income / shares_outstanding
 */
export function earningsPerShare(record: FinancialRecord): number | null {
  return safeDiv(record.net_income, record.shares_outstanding);
}

/**
 * Price/Earnings (P/E) = share_price / EPS
 */
export function priceEarningsRatio(record: FinancialRecord): number | null {
  const eps = earningsPerShare(record);
  return safeDiv(record.share_price, eps);
}

/**
 * Enterprise Value (EV) = share_price * shares_outstanding + total_debt
 */
export function enterpriseValue(record: FinancialRecord): number | null {
  const { share_price, shares_outstanding, total_debt } = record;
  if (share_price === null || shares_outstanding === null || total_debt === null) {
    return null;
  }
  return share_price * shares_outstanding + total_debt;
}

/**
 * EV/EBIT = Enterprise Value / EBIT
 */
export function evToEbit(record: FinancialRecord): number | null {
  const ev = enterpriseValue(record);
  return safeDiv(ev, record.ebit);
}

/**
 * EV/EBITDA = Enterprise Value / EBITDA
 */
export function evToEbitda(record: FinancialRecord): number | null {
  const ev = enterpriseValue(record);
  return safeDiv(ev, record.ebitda);
}

/**
 * Compute all metrics for a single record
 */
export function computeAllMetrics(record: FinancialRecord): CalculatedMetrics {
  return {
    company_name: record.company_name,
    year: record.year,
    netMargin: netMargin(record),
    ebitMargin: ebitMargin(record),
    roa: returnOnAssets(record),
    roe: returnOnEquity(record),
    debtToEquity: debtToEquity(record),
    eps: earningsPerShare(record),
    peRatio: priceEarningsRatio(record),
    evToEbit: evToEbit(record),
    evToEbitda: evToEbitda(record),
    enterpriseValue: enterpriseValue(record),
  };
}

/**
 * Format value for display
 */
export function formatValue(value: number | null, isPercentage: boolean = false): string {
  if (value === null) return 'N/A';
  if (isPercentage) {
    return `${(value * 100).toFixed(2)}%`;
  }
  return value.toFixed(2);
}

/**
 * Format large numbers with abbreviations
 */
export function formatLargeNumber(value: number | null): string {
  if (value === null) return 'N/A';
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}

export const METRICS_INFO = [
  { key: 'netMargin', name: 'Net Margin', description: 'Net income / Revenue', isPercentage: true },
  { key: 'ebitMargin', name: 'EBIT Margin', description: 'EBIT / Revenue', isPercentage: true },
  { key: 'roa', name: 'ROA', description: 'Net income / Total assets', isPercentage: true },
  { key: 'roe', name: 'ROE', description: 'Net income / Total equity', isPercentage: true },
  { key: 'debtToEquity', name: 'Debt/Equity', description: 'Total debt / Total equity', isPercentage: false },
  { key: 'peRatio', name: 'P/E', description: 'Share price / Earnings per share', isPercentage: false },
  { key: 'evToEbit', name: 'EV/EBIT', description: 'Enterprise value / EBIT', isPercentage: false },
  { key: 'evToEbitda', name: 'EV/EBITDA', description: 'Enterprise value / EBITDA', isPercentage: false },
] as const;
