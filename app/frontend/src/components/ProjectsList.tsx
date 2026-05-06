import { useState } from 'react'
import { FolderOpen, Plus, Trash2, Clock } from 'lucide-react'
import type { Layout, SavedProject } from '../types'
import { loadProjects, saveProject, deleteProject, projectToFile } from '../lib/projects'

interface Props {
  layout: Layout
  templatePreview: string | null
  templateFile: File | null
  onLoad: (layout: Layout, templatePreview: string, templateFile: File) => void
}

function formatDate(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - ts
  if (diff < 86400000) return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
  if (diff < 604800000) return d.toLocaleDateString('pl-PL', { weekday: 'short' })
  return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })
}

export function ProjectsList({ layout, templatePreview, templateFile, onLoad }: Props) {
  const [projects, setProjects] = useState<SavedProject[]>(() => loadProjects())
  const [projectName, setProjectName] = useState('')
  const [saving, setSaving] = useState(false)

  const refresh = () => setProjects(loadProjects())

  const handleSave = async () => {
    const name = projectName.trim()
    if (!name) return
    if (!templatePreview || !templateFile) return
    setSaving(true)
    try {
      saveProject({
        name,
        layout,
        templatePreview,
        templateName: templateFile.name,
      })
      setProjectName('')
      refresh()
    } finally {
      setSaving(false)
    }
  }

  const handleLoad = async (p: SavedProject) => {
    try {
      const file = await projectToFile(p.templatePreview, p.templateName)
      onLoad(p.layout, p.templatePreview, file)
    } catch (err) {
      console.error('Błąd wczytywania projektu:', err)
    }
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteProject(id)
    refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FolderOpen className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-medium text-white">Projekty</h3>
      </div>

      <div className="space-y-2">
        <input
          type="text"
          placeholder="Nazwa projektu"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-sm text-white placeholder-zinc-500 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 outline-none"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={!projectName.trim() || !templatePreview || !templateFile || saving}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-sm font-medium hover:bg-cyan-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Plus className="w-4 h-4" />
          Zapisz
        </button>
      </div>

      {projects.length > 0 ? (
        <div className="space-y-1">
          <p className="text-xs text-zinc-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Ostatnie projekty
          </p>
          <ul className="space-y-1 max-h-48 overflow-y-auto">
            {projects.map((p) => (
              <li
                key={p.id}
                onClick={() => handleLoad(p)}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-black/30 border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/5 cursor-pointer transition-all group"
              >
                <span className="text-sm text-white truncate flex-1">{p.name}</span>
                <span className="text-[10px] text-zinc-500 shrink-0">{formatDate(p.createdAt)}</span>
                <button
                  type="button"
                  onClick={(e) => handleDelete(p.id, e)}
                  className="p-1 rounded text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Usuń"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-xs text-zinc-500">Brak zapisanych projektów</p>
      )}
    </div>
  )
}
