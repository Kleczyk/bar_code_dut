import { useRef, useState } from 'react'
import { importData } from '../api'
import { FileSpreadsheet, Loader2, CheckCircle } from 'lucide-react'

interface Props {
  onImport: (rows: Record<string, string>[], file: File | null) => void
  importedCount: number
}

export function DataImport({ onImport, importedCount }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setLoading(true)
    try {
      const { rows } = await importData(file)
      onImport(rows, file)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd importu')
    } finally {
      setLoading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-3 mb-6">
      <p className="text-sm text-zinc-500">
        Kolumny: numer, imię, miejscowość, semestr.
      </p>
      <label className="inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-black/30 border border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all cursor-pointer group">
        <input ref={inputRef} type="file" accept=".csv,.xls,.xlsx" onChange={handleFile} className="hidden" />
        <FileSpreadsheet className="w-5 h-5 text-cyan-400/70 group-hover:text-cyan-400 transition-colors" strokeWidth={1.5} />
        <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">
          {loading ? 'Importowanie…' : 'Wybierz CSV, XLS lub XLSX'}
        </span>
        {loading && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />}
      </label>
      {error && (
        <p className="text-sm text-red-400 flex items-center gap-2">
          {error}
        </p>
      )}
      {importedCount > 0 && (
        <p className="text-sm text-emerald-400/90 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Zaimportowano {importedCount} wierszy
        </p>
      )}
    </div>
  )
}
