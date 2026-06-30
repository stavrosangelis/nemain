interface RelatedCharacter {
  id: number;
  character_name: string;
  source: string;
}

interface Source {
  name: string;
  page: number;
  role_notes: string | null;
}

interface Character {
  [key: string]: unknown;
  allegiance: string;
  alternate_names: RelatedCharacter[];
  character_name: string;
  faction: string;
  familial_links: RelatedCharacter[];
  foster_links: RelatedCharacter[];
  friendly: RelatedCharacter[];
  gender: string;
  hostile: RelatedCharacter[];
  id: number;
  page: number;
  role_notes: string;
  sources: Source[];
}

export type { Character, RelatedCharacter, Source };