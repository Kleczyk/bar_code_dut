import { useState } from 'react'
import { exportBadges } from '../api'
import { Download, Loader2 } from 'lucide-react'
import type { Layout } from '../types'

interface Props {
  templateFile: File | null
  dataFile: File | null
  layout: Layout
  importedRows: Record<string, string>[]
  singlePerson: { numer: string; imie: string; miejscowosc: string; semestr: string }
}

export function ExportPanel({ templateFile, dataFile, layout, importedRows, singlePerson }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [columns, setColumns] = useState(3)
  const [spacing, setSpacing] = useState(20)

  const useDataFile = importedRows.length > 0
  const useSingle = !useDataFile && (singlePerson.numer || singlePerson.imie)

  const handleExport = async () => {
    if (!templateFile) {
      setError('Wybierz wzór wizytówki')
      return
    }
    if (!useDataFile && !useSingle) {
      setError('Zaimportuj dane lub wpisz dane pojedynczej osoby')
      return
    }

    setError(null)
    setLoading(true)
    try {
      const blob = await exportBadges({
        templateFile,
        layout,
        columns,
        spacing,
        dataFile: useDataFile ? dataFile ?? undefined : undefined,
        singlePerson: useSingle ? singlePerson : undefined,
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'wizytowki.png'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd eksportu')
    } finally {
      setLoading(false)
    }
  }

  const canExport = templateFile && (useDataFile || useSingle)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-6">
        <div>
          <label className="text-xs text-zinc-500 block mb-1">Kolumny</label>
          <input
            type="number"
            value={columns}
            onChange={(e) => setColumns(+e.target.value)}
            min={1}
            max={10}
            className="w-20 px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500 block mb-1">Odstęp (px)</label>
          <input
            type="number"
            value={spacing}
            onChange={(e) => setSpacing(+e.target.value)}
            min={0}
            className="w-20 px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 outline-none"
          />
        </div>
      </div>
      <button
        type="button"
        onClick={handleExport}
        disabled={!canExport || loading}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 border border-cyan-500/40 text-cyan-300 hover:from-cyan-500/30 hover:to-fuchsia-500/30 hover:border-cyan-500/60 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(0,245,255,0.1)] hover:shadow-[0_0_30px_rgba(0,245,255,0.2)]"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Download className="w-5 h-5" />
        )}
        {loading ? 'Generowanie…' : 'Pobierz PNG'}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {importedRows.length > 0 && (
        <p className="text-xs text-zinc-500">{importedRows.length} wizytówek do wygenerowania</p>
      )}
    </div>
  )
}
