import { useState } from 'react'
import { TemplateUpload } from './components/TemplateUpload'
import { LayoutEditor } from './components/LayoutEditor'
import { DataImport } from './components/DataImport'
import { SinglePerson } from './components/SinglePerson'
import { ExportPanel } from './components/ExportPanel'
import { ProjectsList } from './components/ProjectsList'
import { ScanBarcode } from 'lucide-react'
import type { Layout } from './types'

const DEFAULT_LAYOUT: Layout = {
  numer: { x: 50, y: 80, font_size: 24 },
  imie: { x: 50, y: 110, font_size: 24 },
  barcode: { x: 50, y: 150, width: 200, height: 60 },
  miejscowosc: { x: 50, y: 220, font_size: 18 },
  semestr: { x: 50, y: 250, font_size: 18 },
}

function App() {
  const [templateFile, setTemplateFile] = useState<File | null>(null)
  const [templatePreview, setTemplatePreview] = useState<string | null>(null)
  const [layout, setLayout] = useState<Layout>(DEFAULT_LAYOUT)
  const [importedRows, setImportedRows] = useState<Record<string, string>[]>([])
  const [dataFile, setDataFile] = useState<File | null>(null)
  const [singlePerson, setSinglePerson] = useState({ numer: '', imie: '', miejscowosc: '', semestr: '' })

  const handleLoadProject = (layout: Layout, templatePreview: string, templateFile: File) => {
    setLayout(layout)
    setTemplatePreview(templatePreview)
    setTemplateFile(templateFile)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] bg-grid">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <header className="mb-16">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 rounded-xl bg-[#12121a] border border-cyan-500/30 shadow-[0_0_30px_rgba(0,245,255,0.15)]">
              <ScanBarcode className="w-10 h-10 text-cyan-400" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Generator identyfikatorów
              </h1>
              <p className="text-cyan-400/80 text-sm mt-1 font-medium">
                Fundacja Wspierania Edukacji · Code 128
              </p>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-cyan-500/50 via-fuchsia-500/30 to-transparent" />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 mb-10">
          <aside>
            <div className="rounded-2xl bg-[#12121a]/90 border border-white/5 p-6 backdrop-blur-sm lg:sticky lg:top-6">
              <ProjectsList
                layout={layout}
                templatePreview={templatePreview}
                templateFile={templateFile}
                onLoad={handleLoadProject}
              />
            </div>
          </aside>
          <div className="space-y-10">
          <section className="rounded-2xl bg-[#12121a]/90 border border-white/5 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm font-bold">1</span>
              <h2 className="text-lg font-semibold text-white">Wzór wizytówki</h2>
            </div>
            <TemplateUpload
              file={templateFile}
              preview={templatePreview}
              onFileChange={(file, preview) => {
                setTemplateFile(file)
                setTemplatePreview(preview)
              }}
            />
          </section>

          {templatePreview && (
            <section className="rounded-2xl bg-[#12121a]/90 border border-white/5 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm font-bold">2</span>
                <h2 className="text-lg font-semibold text-white">Pozycje pól</h2>
              </div>
              <LayoutEditor
                templatePreview={templatePreview}
                layout={layout}
                onLayoutChange={setLayout}
              />
            </section>
          )}

          <section className="rounded-2xl bg-[#12121a]/90 border border-white/5 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm font-bold">3</span>
              <h2 className="text-lg font-semibold text-white">Dane</h2>
            </div>
            <DataImport onImport={(rows, file) => { setImportedRows(rows); setDataFile(file) }} importedCount={importedRows.length} />
            <SinglePerson value={singlePerson} onChange={setSinglePerson} />
          </section>

          <section className="rounded-2xl bg-[#12121a]/90 border border-white/5 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm font-bold">4</span>
              <h2 className="text-lg font-semibold text-white">Eksport</h2>
            </div>
            <ExportPanel
              templateFile={templateFile}
              dataFile={dataFile}
              layout={layout}
              importedRows={importedRows}
              singlePerson={singlePerson}
            />
          </section>
        </div>
        </div>
      </div>
    </div>
  )
}

export default App
