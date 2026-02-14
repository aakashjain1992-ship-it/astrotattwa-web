'use client'

import dynamic from 'next/dynamic'

const BirthDataForm = dynamic(() => import('@/components/forms/BirthDataForm'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-8">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  ),
})

export default function BirthDataFormWrapper() {
  return <BirthDataForm />
}
