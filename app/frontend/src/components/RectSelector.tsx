import { useRef, useState, useCallback, useEffect } from 'react'

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

interface Props {
  src: string
  rects: Record<string, Rect | undefined>
  activeField: string | null
  onRectChange: (field: string, rect: Rect) => void
  onImageLoad?: (naturalWidth: number, naturalHeight: number) => void
}

/** Oblicza rzeczywisty prostokąt obrazu przy object-contain (letterboxing). */
function getActualImageRect(
  imgRect: DOMRect,
  naturalWidth: number,
  naturalHeight: number
): { left: number; top: number; width: number; height: number } {
  const scale = Math.min(imgRect.width / naturalWidth, imgRect.height / naturalHeight)
  const w = naturalWidth * scale
  const h = naturalHeight * scale
  const left = imgRect.left + (imgRect.width - w) / 2
  const top = imgRect.top + (imgRect.height - h) / 2
  return { left, top, width: w, height: h }
}

function toImageCoords(
  clientX: number,
  clientY: number,
  actualRect: { left: number; top: number; width: number; height: number },
  naturalWidth: number,
  naturalHeight: number
): { x: number; y: number } {
  const scaleX = naturalWidth / actualRect.width
  const scaleY = naturalHeight / actualRect.height
  return {
    x: Math.round((clientX - actualRect.left) * scaleX),
    y: Math.round((clientY - actualRect.top) * scaleY),
  }
}

export function RectSelector({ src, rects, activeField, onRectChange, onImageLoad }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null)
  const [drawing, setDrawing] = useState<{ startX: number; startY: number } | null>(null)
  const [currentEnd, setCurrentEnd] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const img = imgRef.current
    if (img?.complete && img.naturalWidth) {
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
      onImageLoad?.(img.naturalWidth, img.naturalHeight)
    }
  }, [src, onImageLoad])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!activeField || !imgRef.current || !naturalSize) return
      const imgRect = imgRef.current.getBoundingClientRect()
      const actualRect = getActualImageRect(imgRect, naturalSize.w, naturalSize.h)
      const { x, y } = toImageCoords(e.clientX, e.clientY, actualRect, naturalSize.w, naturalSize.h)
      if (x >= 0 && y >= 0 && x <= naturalSize.w && y <= naturalSize.h) {
        setDrawing({ startX: x, startY: y })
        setCurrentEnd({ x, y })
      }
    },
    [activeField, naturalSize]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!drawing || !imgRef.current || !naturalSize) return
      const imgRect = imgRef.current.getBoundingClientRect()
      const actualRect = getActualImageRect(imgRect, naturalSize.w, naturalSize.h)
      const { x, y } = toImageCoords(e.clientX, e.clientY, actualRect, naturalSize.w, naturalSize.h)
      setCurrentEnd({ x, y })
    },
    [drawing, naturalSize]
  )

  const finishDrawing = useCallback(() => {
    if (!drawing || !currentEnd || !activeField) {
      setDrawing(null)
      setCurrentEnd(null)
      return
    }
    const x = Math.min(drawing.startX, currentEnd.x)
    const y = Math.min(drawing.startY, currentEnd.y)
    const width = Math.abs(currentEnd.x - drawing.startX)
    const height = Math.abs(currentEnd.y - drawing.startY)
    if (width >= 5 && height >= 5) {
      onRectChange(activeField, { x, y, width, height })
    }
    setDrawing(null)
    setCurrentEnd(null)
  }, [drawing, currentEnd, activeField, onRectChange])

  const handleMouseUp = finishDrawing

  useEffect(() => {
    window.addEventListener('mouseup', finishDrawing)
    return () => window.removeEventListener('mouseup', finishDrawing)
  }, [finishDrawing])

  const toDisplayRect = (r: Rect): Rect => {
    if (!imgRef.current || !naturalSize) return r
    const imgRect = imgRef.current.getBoundingClientRect()
    const actual = getActualImageRect(imgRect, naturalSize.w, naturalSize.h)
    const offsetX = actual.left - imgRect.left
    const offsetY = actual.top - imgRect.top
    const sx = actual.width / naturalSize.w
    const sy = actual.height / naturalSize.h
    return {
      x: offsetX + r.x * sx,
      y: offsetY + r.y * sy,
      width: r.width * sx,
      height: r.height * sy,
    }
  }

  const previewRectNat = drawing && currentEnd
    ? {
        x: Math.min(drawing.startX, currentEnd.x),
        y: Math.min(drawing.startY, currentEnd.y),
        width: Math.abs(currentEnd.x - drawing.startX),
        height: Math.abs(currentEnd.y - drawing.startY),
      }
    : null

  return (
    <div
      ref={containerRef}
      className="relative w-full cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <img
        ref={imgRef}
        src={src}
        alt="Wzór"
        className="block w-full min-h-[400px] object-contain select-none pointer-events-none"
        draggable={false}
        onLoad={() => {
          const img = imgRef.current
          if (img?.naturalWidth) {
            setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
            onImageLoad?.(img.naturalWidth, img.naturalHeight)
          }
        }}
      />
      {imgRef.current && naturalSize && (
        <div className="absolute inset-0 pointer-events-none">
          {Object.entries(rects).map(([field, rect]) => {
            if (!rect) return null
            const d = toDisplayRect(rect)
            const isActive = field === activeField
            return (
              <div
                key={field}
                className={`absolute border-2 ${isActive ? 'border-cyan-400 bg-cyan-500/20' : 'border-cyan-500/50 bg-cyan-500/10'}`}
                style={{ left: d.x, top: d.y, width: d.width, height: d.height }}
              />
            )
          })}
          {previewRectNat && (
            <div
              className="absolute border-2 border-dashed border-fuchsia-400 bg-fuchsia-500/20"
              style={(() => {
                const d = toDisplayRect(previewRectNat)
                return { left: d.x, top: d.y, width: d.width, height: d.height }
              })()}
            />
          )}
        </div>
      )}
    </div>
  )
}
