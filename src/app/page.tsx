'use client'

import { useState, useCallback } from 'react'
import html2canvas from 'html2canvas'
import { printDashboard as printDashboardUtil } from '@/utils/printDashboard'
import SalesChart from '@/components/SalesChart'
import CategoryChart from '@/components/CategoryChart'
import YTDChart from '@/components/YTDChart'
import KPICards from '@/components/KPICards'
import FilterBar from '@/components/FilterBar'
import SalesDetailsTable from '@/components/SalesDetailsTable'
import Header from '@/components/Header'

import { LoginLink } from '@kinde-oss/kinde-auth-nextjs/components'

import { useSearchParams } from 'next/navigation'

export default function LandingHome() {



  return (
    <>
      <style jsx>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0.3in;
          }
          
          body {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
            transform: rotate(0deg);
            width: 100%;
            height: 100vh;
          }
          
          html {
            width: 100%;
            height: 100%;
          }
          
          .export-buttons {
            display: none !important;
          }
          .no-print {
            display: none !important;
          }
          
          .min-h-screen {
            min-height: 100vh !important;
            background: white !important;
            padding: 0.5rem !important;
            margin: 0 !important;
            width: 100% !important;
            height: 100vh !important;
            display: flex !important;
            flex-direction: column !important;
          }
          
          .bg-gray-50 {
            background: white !important;
          }
          
          .bg-white {
            background: white !important;
            border: 1px solid #e5e7eb !important;
            box-shadow: none !important;
          }
          
          .shadow-sm {
            box-shadow: none !important;
          }
          
          .rounded-lg {
            border-radius: 0.375rem !important;
          }
          
          .grid {
            display: grid !important;
            gap: 1rem !important;
          }
          
          .grid-cols-1 {
            grid-template-columns: 1fr !important;
          }
          
          .xl\\:grid-cols-2 {
            grid-template-columns: 1fr 1fr !important;
          }
          
          /* Force landscape layout */
          .grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 0.5rem !important;
            width: 100% !important;
          }
          
          .h-80 {
            height: 15rem !important;
            max-height: 15rem !important;
          }
          
          .w-full {
            width: 100% !important;
          }
          
          .p-6, .p-8 {
            padding: 0.5rem !important;
          }
          
          .mb-6, .mb-8 {
            margin-bottom: 0.5rem !important;
          }
          
          .text-2xl {
            font-size: 1.25rem !important;
          }
          
          .text-4xl {
            font-size: 1.5rem !important;
          }
          
          .text-lg {
            font-size: 0.875rem !important;
          }
          
          .font-bold {
            font-weight: 700 !important;
          }
          
          .font-semibold {
            font-weight: 600 !important;
          }
          
          .text-gray-900 {
            color: #111827 !important;
          }
          
          .text-gray-800 {
            color: #1f2937 !important;
          }
          
          .text-gray-600 {
            color: #4b5563 !important;
          }
          
          .border-gray-200 {
            border-color: #e5e7eb !important;
          }
          
          /* Ensure charts are visible in print */
          .echarts-for-react {
            width: 100% !important;
            height: 100% !important;
          }
          
          canvas {
            max-width: 100% !important;
            height: auto !important;
          }
          
          /* Table styles for print */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          
          th, td {
            border: 1px solid #e5e7eb !important;
            padding: 0.5rem !important;
            text-align: left !important;
          }
          
          th {
            background-color: #f9fafb !important;
            font-weight: 600 !important;
          }
          
          /* Ensure all content fits on one page */
          .overflow-x-auto {
            overflow: visible !important;
          }
          
          .max-h-96 {
            max-height: none !important;
          }
          
          .overflow-y-auto {
            overflow: visible !important;
          }
          
          /* KPI Cards print styles */
          .kpi-card {
            background: white !important;
            border: 1px solid #e5e7eb !important;
            box-shadow: none !important;
          }
          
          /* Chart containers */
          .chart-container {
            width: 100% !important;
            height: 15rem !important;
          }
          
          /* Ensure everything fits on one A4 landscape page */
          * {
            page-break-inside: avoid !important;
          }
          
          .bg-white {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          /* Ensure proper spacing */
          .space-y-4 > * + * {
            margin-top: 1rem !important;
          }
          
          .space-y-6 > * + * {
            margin-top: 1.5rem !important;
          }
          
          .space-y-8 > * + * {
            margin-top: 2rem !important;
          }
        }
      `}</style>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-xl w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Unauthorized notice */}
          {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('unauthorized') && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              You are signed in but not authorized yet. Please contact an administrator to be granted access.
            </div>
          )}
          <div className="text-center">
            <img src="/Designer Metals Logo.png" alt="Designer Metals" className="h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-gray-900">Designer Metals Analytics</h1>
            <p className="text-gray-600 mt-2">Sign in to access dashboards</p>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-3">
            <LoginLink className="w-full px-4 py-3 bg-teal-600 text-white rounded-lg text-center hover:bg-teal-700">Sign in</LoginLink>
          </div>
        </div>
    </div>
    </>
  )
}