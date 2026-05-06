import { useCallback } from 'react'
import { ImagePlus, FileImage } from 'lucide-react'

interface Props {
  file: File | null
  preview: string | null
  onFileChange: (file: File | null, preview: string | null) => void
}

export function TemplateUpload({ file, preview, onFileChange }: Props) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0]
      if (!f) {
        onFileChange(null, null)
        return
      }
      const ext = f.name.toLowerCase().slice(-4)
      if (!['.png', '.jpg', '.jpeg', '.svg'].some((e) => ext.endsWith(e))) {
        onFileChange(null, null)
        return
      }
      const reader = new FileReader()
      reader.onload = () => onFileChange(f, reader.result as string)
      reader.readAsDataURL(f)
    },
    [onFileChange]
  )

  return (
    <div className="space-y-4">
      <label className="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all cursor-pointer group">
        <input type="file" accept=".png,.jpg,.jpeg,.svg" onChange={handleChange} className="hidden" />
        <ImagePlus className="w-12 h-12 text-cyan-400/70 group-hover:text-cyan-400 mb-2 transition-colors" strokeWidth={1.5} />
        <span className="text-sm text-zinc-400 group-hover:text-cyan-400/90 transition-colors">
          {file ? file.name : 'PNG, JPG lub SVG'}
        </span>
      </label>
      {preview && (
        <div className="rounded-xl overflow-hidden border border-white/10 bg-black/30 p-2">
          <div className="flex items-center gap-2 mb-2">
            <FileImage className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-zinc-500">Podgląd</span>
          </div>
          <img src={preview} alt="Wzór" className="max-w-full max-h-64 object-contain rounded-lg" />
        </div>
      )}
    </div>
  )
}
