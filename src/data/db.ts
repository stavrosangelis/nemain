import rawData from "@/assets/data/data-merged.json";
import type { Character } from "@/types";


export const db = rawData as unknown as Character[];

export const findById = (id: number): Character | undefined =>
  db.find(c => c.id === id);

export const filterByGender = (gender: string): Character[] =>
  db.filter(c => c.gender === gender);

export type PaginatedResult = {
  data: Character[]
  total: number
  page: number
  limit: number
  totalPages: number
};

export const findAll = ({ term, page = 1, limit = 10 }: { term?: string; page?: number; limit?: number }): PaginatedResult => {
  const filtered = term
    ? (() => {
      const lower = term.toLowerCase()
      return db.filter(
        c =>
          c.character_name.toLowerCase().includes(lower) ||
          (c.alternate_names ?? []).some(n => n.character_name.toLowerCase().includes(lower)) ||
          c.role_notes.toLowerCase().includes(lower)
      )
    })()
    : db;

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const data = filtered.slice((page - 1) * limit, page * limit);

  return { data, total, page, limit, totalPages };
}
