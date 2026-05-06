import type { Layout, SavedProject } from '../types'

const STORAGE_KEY = 'badge-projects'
const MAX_PROJECTS = 20

export function loadProjects(): SavedProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SavedProject[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveProject(project: Omit<SavedProject, 'id' | 'createdAt'>): SavedProject {
  const projects = loadProjects()
  const now = Date.now()
  const newProject: SavedProject = {
    ...project,
    id: `p-${now}`,
    createdAt: now,
  }
  const filtered = projects.filter((p) => p.id !== newProject.id)
  const updated = [newProject, ...filtered].slice(0, MAX_PROJECTS)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return newProject
}

export function deleteProject(id: string): void {
  const projects = loadProjects().filter((p) => p.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export async function projectToFile(templatePreview: string, templateName: string): Promise<File> {
  const res = await fetch(templatePreview)
  const blob = await res.blob()
  const ext = templateName.includes('.') ? templateName.split('.').pop() ?? 'png' : 'png'
  return new File([blob], templateName || `template.${ext}`, { type: blob.type })
}
