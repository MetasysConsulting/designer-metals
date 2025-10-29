import { parse } from 'csv-parse/sync';
import pako from 'pako';

export interface ARINVRecord {
  TOTAL: string;
  INV_DATE: string;
  NAME: string;
  TREE_DESCR: string;
  ADDRESS1?: string;
  ADDRESS2?: string;
  [key: string]: any;
}

export class ClientCSVDataSource {
  private static instance: ClientCSVDataSource;
  private parsedData: ARINVRecord[] | null = null;
  private lastModified: number = 0;
  private loadingPromise: Promise<ARINVRecord[]> | null = null;

  static getInstance(): ClientCSVDataSource {
    if (!ClientCSVDataSource.instance) {
      ClientCSVDataSource.instance = new ClientCSVDataSource();
    }
    return ClientCSVDataSource.instance;
  }

  /**
   * Decompress gzip data using pako (more reliable than DecompressionStream for large files)
   */
  private decompressGzip(compressedData: Uint8Array): string {
    try {
      console.log(`🔓 Decompressing ${(compressedData.length / 1024 / 1024).toFixed(2)} MB gzip data using pako...`);
      
      // Use pako to decompress gzip
      const decompressed = pako.ungzip(compressedData);
      
      console.log(`✅ Decompressed to ${(decompressed.length / 1024 / 1024).toFixed(2)} MB`);
      
      // Convert to string
      const csvContent = new TextDecoder().decode(decompressed);
      
      console.log(`✅ Converted to text, ${csvContent.length.toLocaleString()} characters`);
      
      return csvContent;
    } catch (error) {
      console.error('❌ Failed to decompress with pako:', error);
      throw new Error('Failed to decompress gzip data');
    }
  }

  /**
   * Load data from Vercel Blob Storage (client-side)
   */
  async loadFromBlobStorage(): Promise<ARINVRecord[]> {
    try {
      console.log('🌐 Loading compressed data from Vercel Blob Storage...');
      
      // Fetch compressed data from our API endpoint
      const response = await fetch('/api/csv-data');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(`Failed to fetch CSV data: ${errorData.error || response.statusText}`);
      }
      
      // Get the compressed data as array buffer
      const compressedBuffer = await response.arrayBuffer();
      const compressedData = new Uint8Array(compressedBuffer);
      const contentType = response.headers.get('content-type') || '';
      
      console.log(`📦 Downloaded ${(compressedData.length / 1024 / 1024).toFixed(2)} MB compressed data (${contentType})`);
      
      // Decompress the data on client side using pako
      const csvContent = this.decompressGzip(compressedData);
      
      console.log(`✅ Successfully decompressed data (${(csvContent.length / 1024 / 1024).toFixed(2)} MB)`);
      
      // Parse CSV data
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      }) as ARINVRecord[];
      
      this.parsedData = records;
      this.lastModified = Date.now();
      
      console.log(`📊 Loaded ${records.length.toLocaleString()} records from blob storage`);
      return records;
    } catch (error) {
      console.error('❌ Error loading data from blob storage:', error);
      throw error;
    }
  }

  /**
   * Get cached data or load from blob storage
   */
  async getData(): Promise<ARINVRecord[]> {
    if (this.parsedData && this.lastModified > 0) {
      console.log(`✨ Using cached data: ${this.parsedData.length.toLocaleString()} records (no download needed)`);
      return this.parsedData;
    }
    
    // If already loading, wait for that promise to avoid duplicate downloads
    if (this.loadingPromise) {
      console.log('⏳ Waiting for existing load to complete...');
      return await this.loadingPromise;
    }
    
    // Start loading and cache the promise
    this.loadingPromise = this.loadFromBlobStorage();
    
    try {
      const data = await this.loadingPromise;
      this.loadingPromise = null;
      return data;
    } catch (error) {
      this.loadingPromise = null;
      throw error;
    }
  }

  /**
   * Filter data based on criteria
   */
  async getFilteredData(filters: {
    year?: string;
    customer?: string;
    category?: string;
  } = {}): Promise<ARINVRecord[]> {
    const data = await this.getData();
    
    return data.filter(record => {
      // Exclude specific categories (case-insensitive)
      const category = (record.TREE_DESCR || '').trim();
      if (category.toLowerCase() === 'employee appreciation' || 
          category.toLowerCase() === 'shipped to') {
        return false;
      }
      
      // Apply year filter
      if (filters.year && filters.year !== 'All') {
        const recordYear = new Date(record.INV_DATE).getFullYear().toString();
        if (recordYear !== filters.year) return false;
      }
      
      // Apply customer filter
      if (filters.customer && filters.customer !== 'All') {
        if (record.NAME !== filters.customer) return false;
      }
      
      // Apply category filter
      if (filters.category && filters.category !== 'All') {
        if (record.TREE_DESCR !== filters.category) return false;
      }
      
      return true;
    });
  }

  /**
   * Get data summary statistics
   */
  async getDataSummary(): Promise<{
    totalRecords: number;
    totalAmount: number;
    dateRange: { min: string; max: string };
    categories: { [key: string]: number };
    customers: { [key: string]: number };
    years: { [key: string]: number };
  }> {
    const data = await this.getData();
    
    let totalAmount = 0;
    const categories: { [key: string]: number } = {};
    const customers: { [key: string]: number } = {};
    const years: { [key: string]: number } = {};
    const dates: string[] = [];
    
    data.forEach(record => {
      // Exclude specific categories (case-insensitive)
      const category = (record.TREE_DESCR || '').trim();
      if (category.toLowerCase() === 'employee appreciation' || 
          category.toLowerCase() === 'shipped to') {
        return; // Skip this record
      }
      
      const amount = parseFloat(record.TOTAL || '0') || 0;
      totalAmount += amount;
      
      // Category aggregation
      if (record.TREE_DESCR) {
        categories[record.TREE_DESCR] = (categories[record.TREE_DESCR] || 0) + amount;
      }
      
      // Customer aggregation
      if (record.NAME) {
        customers[record.NAME] = (customers[record.NAME] || 0) + amount;
      }
      
      // Year aggregation
      if (record.INV_DATE) {
        const year = new Date(record.INV_DATE).getFullYear().toString();
        years[year] = (years[year] || 0) + amount;
        dates.push(record.INV_DATE);
      }
    });
    
    // Calculate date range
    const sortedDates = dates.sort();
    
    return {
      totalRecords: data.length,
      totalAmount: Math.round(totalAmount * 100) / 100,
      dateRange: {
        min: sortedDates[0] || '',
        max: sortedDates[sortedDates.length - 1] || ''
      },
      categories: Object.fromEntries(
        Object.entries(categories)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 20) // Top 20 categories
      ),
      customers: Object.fromEntries(
        Object.entries(customers)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 20) // Top 20 customers
      ),
      years: Object.fromEntries(
        Object.entries(years)
          .sort(([a], [b]) => b.localeCompare(a))
      )
    };
  }

  /**
   * Clear cached data
   */
  clearCache(): void {
    this.parsedData = null;
    this.lastModified = 0;
    console.log('🗑️ Cache cleared');
  }
}

// Export singleton instance
export const clientCSVDataSource = ClientCSVDataSource.getInstance();

