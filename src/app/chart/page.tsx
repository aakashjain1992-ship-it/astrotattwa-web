import { Suspense } from 'react'
import ChartClient from './ChartClient'

export default function ChartPage() {
  return (
    <Suspense fallback={null}>
      <ChartClient />
    </Suspense>
  )
}
