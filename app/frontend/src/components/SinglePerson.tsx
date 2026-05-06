import { User } from 'lucide-react'

interface Props {
  value: { numer: string; imie: string; miejscowosc: string; semestr: string }
  onChange: (v: { numer: string; imie: string; miejscowosc: string; semestr: string }) => void
}

const inputs = [
  { key: 'numer' as const, placeholder: 'Numer', label: 'Numer' },
  { key: 'imie' as const, placeholder: 'Imię', label: 'Imię' },
  { key: 'miejscowosc' as const, placeholder: 'Miejscowość', label: 'Miejscowość' },
  { key: 'semestr' as const, placeholder: 'Semestr', label: 'Semestr' },
]

export function SinglePerson({ value, onChange }: Props) {
  return (
    <div>
      <p className="text-sm text-zinc-500 mb-3 flex items-center gap-2">
        <User className="w-4 h-4" />
        Pojedyncza osoba
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {inputs.map(({ key, placeholder }) => (
          <input
            key={key}
            placeholder={placeholder}
            value={value[key]}
            onChange={(e) => onChange({ ...value, [key]: e.target.value })}
            className="px-4 py-2.5 rounded-lg bg-black/30 border border-white/10 text-sm text-white placeholder-zinc-500 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 outline-none transition-all"
          />
        ))}
      </div>
    </div>
  )
}
