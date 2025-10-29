import { clientCSVDataSource, ARINVRecord } from '@/utils/clientCSVDataSource';

export interface ChartDataPoint {
  name: string;
  value: number;
  amount?: number;
  month?: string;
  year?: string;
  category?: string;
}

export interface MonthlyData {
  month: string;
  amount: number;
}

export interface YearlyData {
  year: string;
  amount: number;
}

export interface CategoryData {
  category: string;
  amount: number;
}

export interface StackedBarData {
  year: string;
  categories: { [key: string]: number };
}

/**
 * Get filtered data from CSV
 */
async function getFilteredData(filters: any = {}): Promise<ARINVRecord[]> {
  try {
    return await clientCSVDataSource.getFilteredData(filters);
  } catch (error) {
    console.error('Error getting filtered data:', error);
    return [];
  }
}

/**
 * Monthly Sales Data
 */
export async function fetchMonthlySalesData(filters: any = {}): Promise<MonthlyData[]> {
  const records = await getFilteredData(filters);
  
  const monthlyData: { [key: string]: number } = {};
  
  records.forEach(record => {
    if (record.INV_DATE) {
      const date = new Date(record.INV_DATE);
      const month = date.toLocaleDateString('en-US', { month: 'long' });
      const amount = parseFloat(record.TOTAL || '0') || 0;
      
      if (monthlyData[month]) {
        monthlyData[month] += amount;
      } else {
        monthlyData[month] = amount;
      }
    }
  });

  const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];
  
  return monthOrder
    .filter(month => monthlyData[month] > 0)
    .map(month => ({
      month,
      amount: monthlyData[month]
    }));
}

/**
 * Yearly Sales Data
 */
export async function fetchYearlySalesData(filters: any = {}): Promise<YearlyData[]> {
  const records = await getFilteredData(filters);
  
  const yearlyData: { [key: string]: number } = {};
  
  records.forEach(record => {
    if (record.INV_DATE) {
      const date = new Date(record.INV_DATE);
      const year = date.getFullYear().toString();
      const amount = parseFloat(record.TOTAL || '0') || 0;
      
      if (yearlyData[year]) {
        yearlyData[year] += amount;
      } else {
        yearlyData[year] = amount;
      }
    }
  });

  return Object.entries(yearlyData)
    .map(([year, amount]) => ({ year, amount }))
    .sort((a, b) => a.year.localeCompare(b.year));
}

/**
 * Category Sales Data
 */
export async function fetchCategorySalesData(filters: any = {}): Promise<CategoryData[]> {
  const records = await getFilteredData(filters);
  
  const categoryData: { [key: string]: number } = {};
  
  records.forEach(record => {
    if (record.TREE_DESCR) {
      const amount = parseFloat(record.TOTAL || '0') || 0;
      
      if (categoryData[record.TREE_DESCR]) {
        categoryData[record.TREE_DESCR] += amount;
      } else {
        categoryData[record.TREE_DESCR] = amount;
      }
    }
  });

  return Object.entries(categoryData)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Stacked Bar Chart Data (Year + Category)
 */
export async function fetchStackedBarData(filters: any = {}): Promise<StackedBarData[]> {
  const records = await getFilteredData(filters);
  
  const yearlyData: { [key: string]: { [key: string]: number } } = {};
  
  records.forEach(record => {
    if (record.INV_DATE && record.TREE_DESCR) {
      const date = new Date(record.INV_DATE);
      const year = date.getFullYear().toString();
      const category = record.TREE_DESCR;
      const amount = parseFloat(record.TOTAL || '0') || 0;
      
      if (!yearlyData[year]) {
        yearlyData[year] = {};
      }
      
      if (yearlyData[year][category]) {
        yearlyData[year][category] += amount;
      } else {
        yearlyData[year][category] = amount;
      }
    }
  });

  return Object.entries(yearlyData)
    .map(([year, categories]) => ({ year, categories }))
    .sort((a, b) => a.year.localeCompare(b.year));
}

/**
 * Customer Location Data
 */
export async function fetchCustomerLocationData(filters: any = {}): Promise<{
  name: string;
  address: string;
  total: number;
  lat?: number;
  lng?: number;
}[]> {
  const records = await getFilteredData(filters);
  
  const customerData: { [key: string]: { 
    name: string;
    address: string;
    total: number;
    lat?: number;
    lng?: number;
  } } = {};
  
  records.forEach(record => {
    if (record.NAME) {
      const amount = parseFloat(record.TOTAL || '0') || 0;
      const address = [record.ADDRESS1, record.ADDRESS2].filter(Boolean).join(', ');
      
      if (customerData[record.NAME]) {
        customerData[record.NAME].total += amount;
      } else {
        customerData[record.NAME] = {
          name: record.NAME,
          address,
          total: amount
        };
      }
    }
  });

  return Object.values(customerData)
    .sort((a, b) => b.total - a.total);
}

/**
 * Get all unique categories
 */
export async function fetchCategories(): Promise<string[]> {
  const records = await getFilteredData();
  
  const categories = new Set<string>();
  records.forEach(record => {
    if (record.TREE_DESCR && 
        record.TREE_DESCR !== 'Employee Appreciation' && 
        record.TREE_DESCR !== 'Shipped To') {
      categories.add(record.TREE_DESCR);
    }
  });
  
  return Array.from(categories).sort();
}

/**
 * Get all unique customers
 */
export async function fetchCustomers(): Promise<string[]> {
  const records = await getFilteredData();
  
  const customers = new Set<string>();
  records.forEach(record => {
    if (record.NAME) {
      customers.add(record.NAME);
    }
  });
  
  return Array.from(customers).sort();
}

/**
 * Get all unique years
 */
export async function fetchYears(): Promise<string[]> {
  const records = await getFilteredData();
  
  const years = new Set<string>();
  records.forEach(record => {
    if (record.INV_DATE) {
      const year = new Date(record.INV_DATE).getFullYear().toString();
      years.add(year);
    }
  });
  
  return Array.from(years).sort((a, b) => b.localeCompare(a));
}

/**
 * Get data summary
 */
export async function fetchDataSummary(): Promise<{
  totalRecords: number;
  totalAmount: number;
  dateRange: { min: string; max: string };
  categories: { [key: string]: number };
  customers: { [key: string]: number };
  years: { [key: string]: number };
}> {
  try {
    return await clientCSVDataSource.getDataSummary();
  } catch (error) {
    console.error('Error fetching data summary:', error);
    return {
      totalRecords: 0,
      totalAmount: 0,
      dateRange: { min: '', max: '' },
      categories: {},
      customers: {},
      years: {}
    };
  }
}

