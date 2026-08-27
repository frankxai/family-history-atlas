import { describe, expect, it } from "vitest";
import { createFamilyHistoryAtlas } from "./compile";
import { syntheticAlderFamily } from "./synthetic";

describe("Family History Atlas compile interface", () => {
  it("compiles a deterministic public-safe story document", async () => {
    const atlas = createFamilyHistoryAtlas();
    const first = await atlas.compile({ access: { kind: "public" }, source: syntheticAlderFamily });
    const second = await atlas.compile({ access: { kind: "public" }, source: syntheticAlderFamily });

    expect(first).toEqual(second);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(first.document.nodes).toHaveLength(8);
    expect(first.document.nodes.every((node) => node.lifeStatus === "deceased")).toBe(true);
    expect(first.document.links.some((link) => link.to.includes("hidden"))).toBe(false);
  });

  it("does not let hidden living records affect the visible scene", async () => {
    const atlas = createFamilyHistoryAtlas();
    const changedHiddenSource = {
      ...syntheticAlderFamily,
      people: syntheticAlderFamily.people.map((person) =>
        person.id === "hidden-living-demo"
          ? { ...person, displayName: "A completely different private value", generation: 11, order: 999 }
          : person,
      ),
    };

    const baseline = await atlas.compile({ access: { kind: "public" }, source: syntheticAlderFamily });
    const changed = await atlas.compile({ access: { kind: "public" }, source: changedHiddenSource });

    expect(baseline).toEqual(changed);
  });

  it("fails safely for malformed sources", async () => {
    const atlas = createFamilyHistoryAtlas();
    const result = await atlas.compile({ access: { kind: "public" }, source: { people: [] } });

    expect(result).toEqual({
      ok: false,
      error: { code: "SOURCE_INVALID", message: "The atlas source is invalid.", retryable: false },
    });
  });

  it("rejects a relationship that points to a missing person", async () => {
    const atlas = createFamilyHistoryAtlas();
    const source = {
      ...syntheticAlderFamily,
      relationships: [
        ...syntheticAlderFamily.relationships,
        {
          id: "bad-reference",
          from: "alder-elian",
          to: "missing-person",
          kind: "parent" as const,
          evidence: "lead" as const,
        },
      ],
    };

    const result = await atlas.compile({ access: { kind: "public" }, source });

    expect(result).toEqual({
      ok: false,
      error: {
        code: "GRAPH_INVALID",
        message: "The atlas graph contains a missing reference, duplicate person, or ancestry cycle.",
        retryable: false,
      },
    });
  });

  it("rejects ancestry cycles", async () => {
    const atlas = createFamilyHistoryAtlas();
    const source = {
      ...syntheticAlderFamily,
      relationships: [
        ...syntheticAlderFamily.relationships,
        {
          id: "bad-cycle",
          from: "alder-oren",
          to: "alder-elian",
          kind: "parent" as const,
          evidence: "lead" as const,
        },
      ],
    };

    const result = await atlas.compile({ access: { kind: "public" }, source });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("GRAPH_INVALID");
  });
});
