import { Suspense } from 'react'
import ChartClient from '../ChartClient'

export default function SavedChartPage() {
  return (
    <Suspense fallback={null}>
      <ChartClient />
    </Suspense>
  )
}
