'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { loadFilters } from '@/utils/filterState'

interface FilterOptions {
  years: string[]
  customers: string[]
  categories: string[]
}

export default function FilterBar({ onFiltersChange }: { onFiltersChange: (filters: any) => void }) {
  const savedFilters = loadFilters()
  const [selectedYear, setSelectedYear] = useState(savedFilters.year || 'All')
  const [selectedCustomer, setSelectedCustomer] = useState(savedFilters.customer || 'All')
  const [selectedCategory, setSelectedCategory] = useState(savedFilters.category || 'All')
  const [options, setOptions] = useState<FilterOptions>({
    years: [],
    customers: [],
    categories: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFilterOptions()
  }, [])

  // Sync with localStorage on mount
  useEffect(() => {
    const savedFilters = loadFilters()
    setSelectedYear(savedFilters.year || 'All')
    setSelectedCustomer(savedFilters.customer || 'All')
    setSelectedCategory(savedFilters.category || 'All')
  }, [])

  useEffect(() => {
    onFiltersChange({
      year: selectedYear,
      customer: selectedCustomer,
      category: selectedCategory
    })
  }, [selectedYear, selectedCustomer, selectedCategory, onFiltersChange])

  const fetchFilterOptions = async () => {
    try {
      setLoading(true)
      
      // Get unique years
      const { data: yearData } = await supabase
        .from('ARINV')
        .select('INV_DATE')
        .not('INV_DATE', 'is', null)
      
      const years = [...new Set(
        yearData?.map(record => {
          const date = new Date(record.INV_DATE)
          return date.getFullYear().toString()
        }).filter(Boolean) || []
      )].sort((a, b) => b.localeCompare(a))

      // Get unique customers
      const { data: customerData } = await supabase
        .from('ARINV')
        .select('NAME')
        .not('NAME', 'is', null)
        .limit(100) // Limit for performance
      
      const customers = [...new Set(
        customerData?.map(record => record.NAME).filter(Boolean) || []
      )].sort()

      // Get unique categories
      const { data: categoryData } = await supabase
        .from('ARINV')
        .select('TREE_DESCR')
        .not('TREE_DESCR', 'is', null)
      
      const categories = [...new Set(
        categoryData?.map(record => record.TREE_DESCR).filter(Boolean) || []
      )]
        .filter(category => 
          category !== 'Employee Appreciation' && 
          category !== 'Shipped To'
        )
        .sort()

      setOptions({
        years: ['All', ...years],
        customers: ['All', ...customers],
        categories: ['All', ...categories]
      })
    } catch (error) {
      console.error('Error fetching filter options:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-8">
      <div className="flex flex-col">
        <label className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Year</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800 text-base font-medium shadow-sm hover:border-gray-400 transition-all duration-150 min-w-[140px] relative z-50"
        >
          {options.years.map(year => (
            <option key={year} value={year} className="text-gray-800 font-medium">{year}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Customer</label>
        <select
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800 text-base font-medium shadow-sm hover:border-gray-400 transition-all duration-150 min-w-[160px] relative z-50"
        >
          {options.customers.map(customer => (
            <option key={customer} value={customer} className="text-gray-800 font-medium">{customer}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800 text-base font-medium shadow-sm hover:border-gray-400 transition-all duration-150 min-w-[160px] relative z-50"
        >
          {options.categories.map(category => (
            <option key={category} value={category} className="text-gray-800 font-medium">{category}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
