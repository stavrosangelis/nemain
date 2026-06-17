import rawData from '@/assets/data/data.json'

export type Character = {
  id: number
  character_name: string
  alternate_names: string[] | null
  page: number
  role_notes: string
  gender: string
  friendly: string[]
  hostile: string[]
  familial_links: string[]
  foster_links: string[] | null
}

export const db = rawData as Character[]

export const findById = (id: number): Character | undefined =>
  db.find(c => c.id === id)

export const filterByGender = (gender: string): Character[] =>
  db.filter(c => c.gender === gender)

export type PaginatedResult = {
  data: Character[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const findAll = ({ term, page = 1, limit = 10 }: { term?: string; page?: number; limit?: number }): PaginatedResult => {
  const filtered = term
    ? (() => {
      const lower = term.toLowerCase()
      return db.filter(
        c =>
          c.character_name.toLowerCase().includes(lower) ||
          (c.alternate_names ?? []).some(n => n.toLowerCase().includes(lower)) ||
          c.role_notes.toLowerCase().includes(lower)
      )
    })()
    : db

  const total = filtered.length
  const totalPages = Math.ceil(total / limit)
  const data = filtered.slice((page - 1) * limit, page * limit)

  return { data, total, page, limit, totalPages }
}
