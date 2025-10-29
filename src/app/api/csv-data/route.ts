import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET() {
  try {
    // Check if we have blob storage configured and file available
    if (BLOB_READ_WRITE_TOKEN) {
      try {
        const { list } = await import('@vercel/blob');
        const { blobs } = await list({
          token: BLOB_READ_WRITE_TOKEN,
        });

        // Log available blobs for debugging
        console.log('Available blobs:', blobs.map(b => ({ pathname: b.pathname, size: b.size })));

        // Find the CSV file - check for various formats including .brotli
        const csvBlob = blobs.find(blob => 
          blob.pathname.includes('Designer Metals Data') || 
          blob.pathname.includes('designer-metals-data') ||
          blob.pathname.toLowerCase().includes('data') ||
          blob.pathname.endsWith('.gz') ||
          blob.pathname.endsWith('.brotli') ||
          blob.pathname.endsWith('.csv')
        );

        if (csvBlob) {
          console.log('Found blob:', csvBlob.pathname, 'Size:', csvBlob.size, 'URL:', csvBlob.url);
          
          // Fetch the blob content - try with and without auth header
          let response = await fetch(csvBlob.url);
          
          if (!response.ok) {
            // Try with auth header
            response = await fetch(csvBlob.url, {
              headers: {
                'Authorization': `Bearer ${BLOB_READ_WRITE_TOKEN}`,
              },
            });
          }
          
          if (!response.ok) {
            throw new Error(`Failed to fetch blob: ${response.statusText} (${response.status})`);
          }

          const arrayBuffer = await response.arrayBuffer();
          let buffer = Buffer.from(arrayBuffer);

          console.log('✅ Successfully fetched blob:', {
            pathname: csvBlob.pathname,
            size: buffer.length,
            sizeInMB: (buffer.length / 1024 / 1024).toFixed(2)
          });

          // Convert Brotli to Gzip for client compatibility (browsers support gzip natively)
          if (csvBlob.pathname.endsWith('.brotli')) {
            console.log('📦 Converting Brotli to Gzip...');
            try {
              const { brotliDecompressSync, gzipSync } = await import('zlib');
              console.log('   Decompressing Brotli...');
              const decompressed = brotliDecompressSync(buffer);
              console.log(`   Decompressed: ${(decompressed.length / 1024 / 1024).toFixed(2)} MB`);
              
              console.log('   Compressing to Gzip...');
              buffer = gzipSync(decompressed);
              
              console.log('✅ Converted Brotli to Gzip:', {
                brotliSize: (arrayBuffer.byteLength / 1024 / 1024).toFixed(2) + ' MB',
                decompressedSize: (decompressed.length / 1024 / 1024).toFixed(2) + ' MB',
                gzipSize: (buffer.length / 1024 / 1024).toFixed(2) + ' MB'
              });
            } catch (error) {
              console.error('❌ Failed to convert Brotli to Gzip:', error);
              throw new Error('Failed to process compressed file');
            }
          } else {
            console.log('ℹ️  File is not Brotli, returning as-is');
          }

          // Return the file (converted to gzip if needed)
          return new NextResponse(buffer, {
            headers: {
              'Content-Type': 'application/gzip',
              'Content-Disposition': `attachment; filename="${csvBlob.pathname.replace('.brotli', '.gz')}"`,
              'Content-Length': buffer.length.toString(),
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET',
              'Access-Control-Allow-Headers': 'Content-Type',
            },
          });
        } else {
          console.log('No matching blob found. Available blobs:', blobs.map(b => b.pathname));
        }
      } catch (blobError) {
        console.warn('Blob storage not available, falling back to Supabase:', blobError);
      }
    }

    // Fallback: Generate CSV data from Supabase
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'No data source configured. Please set up Supabase or Vercel Blob Storage.' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all data from Supabase
    const { data: records, error } = await supabase
      .from('ARINV')
      .select('*')
      .not('TREE_DESCR', 'eq', 'Employee Appreciation')
      .not('TREE_DESCR', 'eq', 'Shipped To');

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    if (!records || records.length === 0) {
      return NextResponse.json(
        { error: 'No data found in database' },
        { status: 404 }
      );
    }

    // Convert to CSV
    const headers = Object.keys(records[0]);
    const csvContent = [
      headers.join(','),
      ...records.map(record => 
        headers.map(header => {
          const value = record[header];
          // Escape CSV values
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');

    // Compress the CSV content
    const { gzipSync } = await import('zlib');
    const compressed = gzipSync(csvContent);

    return new NextResponse(compressed, {
      headers: {
        'Content-Type': 'application/gzip',
        'Content-Disposition': 'attachment; filename="designer-metals-data.csv.gz"',
        'Content-Length': compressed.length.toString(),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Error fetching CSV data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch CSV data' },
      { status: 500 }
    );
  }
}

