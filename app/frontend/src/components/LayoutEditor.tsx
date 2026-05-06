import { useCallback, useState } from 'react'
import { RectSelector, type Rect } from './RectSelector'
import { MousePointer2, Type } from 'lucide-react'
import type { Layout } from '../types'

interface Props {
  templatePreview: string
  layout: Layout
  onLayoutChange: (layout: Layout) => void
}

const FIELDS = ['numer', 'imie', 'barcode', 'miejscowosc', 'semestr'] as const
const TEXT_FIELDS = ['numer', 'imie', 'miejscowosc', 'semestr'] as const

function layoutToRect(layout: Layout, key: keyof Layout): Rect | undefined {
  const cfg = layout[key]
  if (!cfg) return undefined
  if (key === 'barcode') {
    return { x: cfg.x, y: cfg.y, width: cfg.width, height: cfg.height }
  }
  const c = cfg as { x: number; y: number; font_size: number; width?: number; height?: number }
  const w = c.width ?? Math.max(120, c.font_size * 6)
  const h = c.height ?? Math.round(c.font_size * 1.3)
  return { x: c.x, y: c.y, width: w, height: h }
}

function rectToLayoutUpdate(key: keyof Layout, rect: Rect): Partial<Layout[keyof Layout]> {
  if (key === 'barcode') {
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
  }
  const font_size = Math.max(8, Math.round(rect.height * 0.8))
  return { x: rect.x, y: rect.y, font_size, width: rect.width, height: rect.height }
}

export function LayoutEditor({ templatePreview, layout, onLayoutChange }: Props) {
  const [activeField, setActiveField] = useState<keyof Layout | null>(null)

  const rects: Record<string, Rect | undefined> = {}
  for (const k of FIELDS) {
    rects[k] = layoutToRect(layout, k)
  }

  const handleRectChange = useCallback(
    (field: string, rect: Rect) => {
      const key = field as keyof Layout
      const updates = rectToLayoutUpdate(key, rect)
      onLayoutChange({
        ...layout,
        [key]: { ...layout[key], ...updates },
      })
    },
    [layout, onLayoutChange]
  )

  const handleFontSizeChange = useCallback(
    (key: keyof Layout, font_size: number) => {
      if (key === 'barcode') return
      onLayoutChange({
        ...layout,
        [key]: { ...layout[key], font_size: Math.max(8, Math.min(120, font_size)) },
      })
    },
    [layout, onLayoutChange]
  )

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="space-y-4 lg:w-56 shrink-0">
        <p className="text-sm text-zinc-500 flex items-center gap-2">
          <MousePointer2 className="w-4 h-4" />
          Wybierz pole, potem zaznacz prostokąt na obrazku. Tekst i kod kreskowy dopasują się do zaznaczenia.
        </p>
        <div className="flex flex-wrap gap-2">
          {FIELDS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveField(activeField === key ? null : key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeField === key
                  ? 'bg-cyan-500/30 border border-cyan-400 text-cyan-300'
                  : 'bg-black/30 border border-white/10 text-zinc-400 hover:border-cyan-500/30 hover:text-white'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
        {activeField && (
          <p className="text-xs text-cyan-400/80">
            Zaznacz prostokąt dla: <strong>{activeField}</strong>
          </p>
        )}
        <div className="space-y-3 pt-3 border-t border-white/10">
          <p className="text-xs text-zinc-500 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5" />
            Wielkość fontu
          </p>
          <div className="grid grid-cols-2 gap-2">
            {TEXT_FIELDS.map((key) => (
              <label key={key} className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 w-20 truncate">{key}</span>
                <input
                  type="number"
                  min={8}
                  max={120}
                  value={layout[key].font_size}
                  onChange={(e) => handleFontSizeChange(key, +e.target.value)}
                  className="w-16 px-2 py-1 rounded bg-black/30 border border-white/10 text-sm text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 outline-none"
                />
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 min-w-[400px] min-h-[350px]">
        <div className="rounded-lg overflow-hidden border border-white/10 bg-black/30 p-2 w-full h-full min-h-[350px]">
          <RectSelector
            src={templatePreview}
            rects={rects}
            activeField={activeField}
            onRectChange={handleRectChange}
          />
        </div>
      </div>
    </div>
  )
}
