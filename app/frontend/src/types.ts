export interface Layout {
  numer: { x: number; y: number; font_size: number; width?: number; height?: number }
  imie: { x: number; y: number; font_size: number; width?: number; height?: number }
  barcode: { x: number; y: number; width: number; height: number }
  miejscowosc: { x: number; y: number; font_size: number; width?: number; height?: number }
  semestr: { x: number; y: number; font_size: number; width?: number; height?: number }
}

export interface SavedProject {
  id: string
  name: string
  layout: Layout
  templatePreview: string
  templateName: string
  createdAt: number
}
