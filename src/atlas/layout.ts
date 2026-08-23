import type { AtlasPerson, AtlasRelationship, LayoutPoint } from "./types";

const ancestryKinds = new Set(["parent", "adoptive_parent", "guardian"]);

function deriveGenerations(
  people: readonly AtlasPerson[],
  relationships: readonly AtlasRelationship[],
): Map<string, number> {
  const ranks = new Map(people.map((person) => [person.id, person.generation ?? 0]));

  for (let pass = 0; pass < people.length; pass += 1) {
    let changed = false;
    for (const relation of relationships) {
      if (!ancestryKinds.has(relation.kind)) continue;
      const parentRank = ranks.get(relation.from) ?? 0;
      const childRank = ranks.get(relation.to) ?? 0;
      const next = Math.max(childRank, parentRank + 1);
      if (next !== childRank) {
        ranks.set(relation.to, next);
        changed = true;
      }
    }
    if (!changed) break;
  }

  const minimum = Math.min(...ranks.values());
  for (const [id, rank] of ranks) ranks.set(id, rank - minimum);
  return ranks;
}

export function createLayouts(
  people: readonly AtlasPerson[],
  relationships: readonly AtlasRelationship[],
): Map<string, { wide: LayoutPoint; compact: LayoutPoint }> {
  const ranks = deriveGenerations(people, relationships);
  const generations = new Map<number, AtlasPerson[]>();

  for (const person of people) {
    const rank = ranks.get(person.id) ?? 0;
    const group = generations.get(rank) ?? [];
    group.push(person);
    generations.set(rank, group);
  }

  for (const group of generations.values()) {
    group.sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.id.localeCompare(b.id));
  }

  const maxGeneration = Math.max(...generations.keys());
  const wideHeight = 650;
  const wideWidth = 1000;
  const compactWidth = 320;
  const result = new Map<string, { wide: LayoutPoint; compact: LayoutPoint }>();
  let compactIndex = 0;

  for (let generation = 0; generation <= maxGeneration; generation += 1) {
    const group = generations.get(generation) ?? [];
    const y = maxGeneration === 0 ? wideHeight / 2 : 74 + (generation / maxGeneration) * 490;

    group.forEach((person, index) => {
      const x = group.length === 1 ? wideWidth / 2 : 94 + (index / (group.length - 1)) * 812;
      const compactX = compactIndex % 2 === 0 ? 92 : compactWidth - 92;
      result.set(person.id, {
        wide: { x, y, generation },
        compact: { x: compactX, y: 76 + compactIndex * 132, generation },
      });
      compactIndex += 1;
    });
  }

  return result;
}
