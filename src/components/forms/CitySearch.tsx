'use client'

import { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface City {
  id: number
  city_name: string
  state_name: string
  country: string
  latitude: number
  longitude: number
  timezone: string
}

interface CitySearchProps {
  value: string
  onSelect: (city: City) => void
}

export function CitySearch({ value, onSelect }: CitySearchProps) {
  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<City[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search cities
  useEffect(() => {
    const searchCities = async () => {
      if (query.length < 2) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/cities/search?q=${encodeURIComponent(query)}`)
        if (!response.ok) throw new Error('Search failed')
        const data = await response.json()
        setResults(data.cities || [])
        setIsOpen(true)
      } catch (error) {
        console.error('City search error:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(searchCities, 300)
    return () => clearTimeout(debounce)
  }, [query])

  const handleSelect = (city: City) => {
    setQuery(`${city.city_name}, ${city.state_name}`)
    setIsOpen(false)
    onSelect(city)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search city... (e.g., Delhi, Mumbai, Baghpat)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="pl-10"
        />
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md">
          {isLoading ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Searching...
            </div>
          ) : results.length > 0 ? (
            results.map((city) => (
              <button
                key={city.id}
                type="button"
                onClick={() => handleSelect(city)}
                className={cn(
                  'w-full rounded-sm px-3 py-2 text-left text-sm hover:bg-accent',
                  'focus:bg-accent focus:outline-none'
                )}
              >
                <div className="font-medium">{city.city_name}</div>
                <div className="text-xs text-muted-foreground">
                  {city.state_name}, {city.country}
                </div>
              </button>
            ))
          ) : query.length >= 2 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No cities found. Try searching differently.
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
