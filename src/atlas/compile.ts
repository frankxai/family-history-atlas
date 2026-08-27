import { atlasSourceSchema } from "./schema";
import { createLayouts } from "./layout";
import type {
  AtlasChapter,
  AtlasOutcome,
  AtlasSceneNode,
  AtlasSource,
  FamilyHistoryAtlas,
} from "./types";

const ancestryKinds = new Set(["parent", "adoptive_parent", "guardian"]);

function presentationId(index: number): string {
  return `person-${String(index + 1).padStart(2, "0")}`;
}

function sourceGraphIsValid(source: AtlasSource): boolean {
  const personIds = new Set(source.people.map((person) => person.id));
  if (personIds.size !== source.people.length) return false;

  if (
    source.relationships.some(
      (relationship) =>
        !personIds.has(relationship.from) || !personIds.has(relationship.to),
    ) ||
    source.events.some((event) => event.personIds.some((id) => !personIds.has(id)))
  ) {
    return false;
  }

  const childrenByParent = new Map<string, string[]>();
  for (const relationship of source.relationships) {
    if (!ancestryKinds.has(relationship.kind)) continue;
    const children = childrenByParent.get(relationship.from) ?? [];
    children.push(relationship.to);
    childrenByParent.set(relationship.from, children);
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const hasCycle = (id: string): boolean => {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;

    visiting.add(id);
    for (const child of childrenByParent.get(id) ?? []) {
      if (hasCycle(child)) return true;
    }
    visiting.delete(id);
    visited.add(id);
    return false;
  };

  return !source.people.some((person) => hasCycle(person.id));
}

function createChapters(nodes: readonly AtlasSceneNode[]): readonly AtlasChapter[] {
  const byGeneration = new Map<number, string[]>();
  for (const node of nodes) {
    const generation = node.layout.wide.generation;
    const ids = byGeneration.get(generation) ?? [];
    ids.push(node.presentationId);
    byGeneration.set(generation, ids);
  }

  const generations = [...byGeneration.keys()].sort((a, b) => a - b);
  const earliest = byGeneration.get(generations.at(0) ?? 0) ?? [];
  const middle = byGeneration.get(generations[Math.floor(generations.length / 2)] ?? 0) ?? [];
  const latest = byGeneration.get(generations.at(-1) ?? 0) ?? [];

  return [
    {
      id: "origin",
      eyebrow: "Chapter 01 · Origins",
      title: "A tree begins as a question.",
      copy: "Start with what is known, keep every source attached, and let uncertainty remain visible.",
      nodeIds: earliest,
      camera: { xPercent: 0, yPercent: 9, scale: 1.04 },
    },
    {
      id: "branches",
      eyebrow: "Chapter 02 · Branches",
      title: "Generations become a living pattern.",
      copy: "Parenthood, partnership, guardianship, adoption, and chosen family can coexist without being flattened into one kind of line.",
      nodeIds: middle,
      camera: { xPercent: 0, yPercent: -2, scale: 1.12 },
    },
    {
      id: "journeys",
      eyebrow: "Chapter 03 · Journeys",
      title: "Places hold the shape of a life.",
      copy: "Reviewed places and dated events become a route through time—never a live location feed.",
      nodeIds: latest,
      camera: { xPercent: -3, yPercent: -12, scale: 1.08 },
    },
    {
      id: "evidence",
      eyebrow: "Chapter 04 · Evidence",
      title: "Every line can show why we believe it.",
      copy: "Supported, contradicted, unresolved, and source-rich claims stay distinct. A beautiful tree never turns a lead into a fact.",
      nodeIds: nodes
        .filter((node) => node.evidence === "strongly_supported" || node.evidence === "unresolved")
        .map((node) => node.presentationId),
      camera: { xPercent: 2, yPercent: -3, scale: 0.98 },
    },
  ];
}

function projectPublicSource(source: AtlasSource): AtlasOutcome {
  const visiblePeople = source.people.filter((person) => person.lifeStatus === "deceased");
  if (visiblePeople.length === 0) {
    return {
      ok: false,
      error: { code: "NO_VISIBLE_CONTENT", message: "No public-safe history is available.", retryable: false },
    };
  }

  const visibleIds = new Set(visiblePeople.map((person) => person.id));
  const visibleRelationships = source.relationships.filter(
    (relation) => visibleIds.has(relation.from) && visibleIds.has(relation.to),
  );
  const visibleEvents = source.events
    .map((event) => ({ ...event, personIds: event.personIds.filter((id) => visibleIds.has(id)) }))
    .filter((event) => event.personIds.length > 0);

  const layouts = createLayouts(visiblePeople, visibleRelationships);
  const idMap = new Map<string, string>();
  const nodes = visiblePeople.map((person, index) => {
    const safeId = presentationId(index);
    idMap.set(person.id, safeId);
    return {
      ...person,
      id: safeId,
      presentationId: safeId,
      layout: layouts.get(person.id)!,
    };
  });

  const links = visibleRelationships.map((relation) => ({
    ...relation,
    id: `relation-${idMap.get(relation.from)}-${idMap.get(relation.to)}-${relation.kind}`,
    from: idMap.get(relation.from)!,
    to: idMap.get(relation.to)!,
    fromPresentationId: idMap.get(relation.from)!,
    toPresentationId: idMap.get(relation.to)!,
  }));

  const events = visibleEvents.map((event, index) => ({
    ...event,
    id: `event-${String(index + 1).padStart(2, "0")}`,
    personIds: event.personIds.map((id) => idMap.get(id)!),
  }));

  return {
    ok: true,
    warnings: [],
    document: {
      schemaVersion: "1",
      documentId: "public-synthetic-atlas-v1",
      contentClass: "public-safe",
      title: source.title,
      subtitle: source.subtitle,
      provenanceNote: source.provenanceNote,
      nodes,
      links,
      events,
      researchQuestions: source.researchQuestions,
      chapters: createChapters(nodes),
      readingOrder: nodes.map((node) => node.presentationId),
    },
  };
}

export function createFamilyHistoryAtlas(): FamilyHistoryAtlas {
  return {
    async compile(request) {
      if (request.access.kind !== "public") {
        return {
          ok: false,
          error: { code: "SOURCE_INVALID", message: "Unsupported access mode.", retryable: false },
        };
      }

      const parsed = atlasSourceSchema.safeParse(request.source);
      if (!parsed.success) {
        return {
          ok: false,
          error: { code: "SOURCE_INVALID", message: "The atlas source is invalid.", retryable: false },
        };
      }

      if (!sourceGraphIsValid(parsed.data)) {
        return {
          ok: false,
          error: {
            code: "GRAPH_INVALID",
            message: "The atlas graph contains a missing reference, duplicate person, or ancestry cycle.",
            retryable: false,
          },
        };
      }

      return projectPublicSource(parsed.data);
    },
  };
}
