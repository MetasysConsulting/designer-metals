// Utility to manage filter state across all pages using localStorage

export interface FilterState {
  year: string
  customer: string
  category: string
}

const FILTER_STORAGE_KEY = 'designer-metals-filters'

export function saveFilters(filters: FilterState): void {
  try {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters))
    console.log('Filters saved:', filters)
  } catch (error) {
    console.error('Error saving filters:', error)
  }
}

export function loadFilters(): FilterState {
  try {
    const saved = localStorage.getItem(FILTER_STORAGE_KEY)
    if (saved) {
      const filters = JSON.parse(saved)
      console.log('Filters loaded:', filters)
      return filters
    }
  } catch (error) {
    console.error('Error loading filters:', error)
  }
  
  // Return default filters if nothing saved
  return {
    year: 'All',
    customer: 'All',
    category: 'All'
  }
}

export function clearFilters(): void {
  try {
    localStorage.removeItem(FILTER_STORAGE_KEY)
    console.log('Filters cleared')
  } catch (error) {
    console.error('Error clearing filters:', error)
  }
}
