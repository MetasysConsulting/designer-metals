'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface FilterOptions {
  years: string[]
  customers: string[]
  categories: string[]
}

export default function FilterBar({ onFiltersChange }: { onFiltersChange: (filters: any) => void }) {
  const [selectedYear, setSelectedYear] = useState('All')
  const [selectedCustomer, setSelectedCustomer] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [options, setOptions] = useState<FilterOptions>({
    years: [],
    customers: [],
    categories: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFilterOptions()
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
      )].sort()

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
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">YEAR</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
        >
          {options.years.map(year => (
            <option key={year} value={year} className="text-gray-900">{year}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">CUSTOMER</label>
        <select
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
        >
          {options.customers.map(customer => (
            <option key={customer} value={customer} className="text-gray-900">{customer}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">CATEGORY</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
        >
          {options.categories.map(category => (
            <option key={category} value={category} className="text-gray-900">{category}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
