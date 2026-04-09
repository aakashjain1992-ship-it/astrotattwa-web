'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

interface ChartLabelModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'save' | 'edit-label'
  initialLabel?: string
  initialIsFavorite?: boolean
  /** Name of the chart that is currently "My Chart", for replacement warning */
  currentFavoriteChartName?: string | null
  onConfirm: (label: string | null, isFavorite: boolean) => void
  isLoading?: boolean
}

export function ChartLabelModal({
  open,
  onOpenChange,
  mode,
  initialLabel = '',
  initialIsFavorite = false,
  currentFavoriteChartName = null,
  onConfirm,
  isLoading = false,
}: ChartLabelModalProps) {
  const [label, setLabel] = useState(initialLabel)
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setLabel(initialLabel)
      setIsFavorite(initialIsFavorite)
    }
  }, [open, initialLabel, initialIsFavorite])

  const handleConfirm = () => {
    onConfirm(label.trim() || null, isFavorite)
  }

  const showReplaceWarning =
    isFavorite && !initialIsFavorite && currentFavoriteChartName

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'save' ? 'Save Chart' : 'Update Label'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'save'
              ? 'Add a label to identify this chart.'
              : 'Update the label for this chart.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Label input */}
          <div className="space-y-2">
            <Label htmlFor="chart-label">Label</Label>
            <Input
              id="chart-label"
              placeholder="e.g. Friend, Family, Wife, Client"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) handleConfirm()
              }}
              autoFocus
            />
          </div>

          {/* My Chart checkbox */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="my-chart"
              checked={isFavorite}
              onCheckedChange={(checked) => setIsFavorite(checked === true)}
            />
            <div className="space-y-1">
              <Label htmlFor="my-chart" className="text-sm font-medium leading-none cursor-pointer">
                Set as My Chart
              </Label>
              <p className="text-xs text-muted-foreground">
                Links this chart to &quot;My Chart&quot; in the header menu.
              </p>
            </div>
          </div>

          {/* Replace warning */}
          {showReplaceWarning && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              &quot;My Chart&quot; is currently set to <strong>{currentFavoriteChartName}</strong>.
              Saving will replace it with this chart.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {mode === 'save' ? 'Saving...' : 'Updating...'}
              </>
            ) : mode === 'save' ? (
              'Save'
            ) : (
              'Update'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
