const API = '/api'

export async function importData(file: File): Promise<{ rows: Record<string, string>[]; count: number }> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${API}/import`, { method: 'POST', body: form })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || 'Błąd importu')
  }
  return res.json()
}

export async function exportBadges(params: {
  templateFile: File
  layout: object
  columns: number
  spacing: number
  dataFile?: File | null
  singlePerson?: Record<string, string>
}): Promise<Blob> {
  const form = new FormData()
  form.append('template_file', params.templateFile)
  form.append('layout_json', JSON.stringify(params.layout))
  form.append('columns', String(params.columns))
  form.append('spacing', String(params.spacing))

  if (params.dataFile) {
    form.append('data_file', params.dataFile)
  } else if (params.singlePerson) {
    form.append('single_numer', params.singlePerson.numer ?? '')
    form.append('single_imie', params.singlePerson.imie ?? '')
    form.append('single_miejscowosc', params.singlePerson.miejscowosc ?? '')
    form.append('single_semestr', params.singlePerson.semestr ?? '')
  }

  const res = await fetch(`${API}/export`, { method: 'POST', body: form })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || 'Błąd eksportu')
  }
  return res.blob()
}
