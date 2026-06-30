import rawData from "../../assets/data/data-merged.json";

const EDGE_TYPES = [
  "friendly",
  "hostile",
  "familial_links",
  "foster_links",
] as const;

type RawChar = Record<string, unknown> & {
  id: number;
  character_name: string;
  gender: string;
};

type Rel = { id: number | null };

const db = rawData as unknown as RawChar[];

const nodes = db.map((c) => ({
  data: { id: String(c.id), label: c.character_name, gender: c.gender },
}));

const edgeSet = new Set<string>();
const edges: object[] = [];

for (const char of db) {
  const sourceId = String(char.id);
  for (const type of EDGE_TYPES) {
    const targets = ((char[type] as Rel[]) ?? []);
    for (const rel of targets) {
      if (rel.id == null) continue;
      const targetId = String(rel.id);
      const [a, b] = [sourceId, targetId].sort();
      const key = `${a}|${b}|${type}`;
      if (edgeSet.has(key)) continue;
      edgeSet.add(key);
      edges.push({ data: { id: `e-${key}`, source: sourceId, target: targetId, type } });
    }
  }
}

self.postMessage([...nodes, ...edges]);
