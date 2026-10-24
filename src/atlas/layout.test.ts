import { describe, expect, it } from "vitest";
import { createLayouts } from "./layout";
import type { AtlasPerson, AtlasRelationship } from "./types";

describe("layout", () => {
  it("derives generations correctly when not provided", () => {
    const people: AtlasPerson[] = [
      {
        id: "p1",
        displayName: "Person 1",
        years: "2000-2020",
        lifeStatus: "deceased",
        role: "Role",
        summary: "Summary",
        evidence: "supported",
        sourceCount: 1,
        // No generation provided
      },
      {
        id: "p2",
        displayName: "Person 2",
        years: "2020-2040",
        lifeStatus: "deceased",
        role: "Role",
        summary: "Summary",
        evidence: "supported",
        sourceCount: 1,
        // No generation provided
      },
    ];

    const relationships: AtlasRelationship[] = [
      {
        id: "r1",
        from: "p1",
        to: "p2",
        kind: "parent",
        evidence: "supported",
      },
    ];

    const layouts = createLayouts(people, relationships);
    expect(layouts.get("p1")?.wide.generation).toBe(0);
    expect(layouts.get("p2")?.wide.generation).toBe(1);
  });

  it("handles sorting by id when order is missing", () => {
    const people: AtlasPerson[] = [
      {
        id: "b",
        displayName: "Person B",
        years: "2000-2020",
        lifeStatus: "deceased",
        role: "Role",
        summary: "Summary",
        evidence: "supported",
        sourceCount: 1,
        generation: 0,
        // No order provided
      },
      {
        id: "a",
        displayName: "Person A",
        years: "2000-2020",
        lifeStatus: "deceased",
        role: "Role",
        summary: "Summary",
        evidence: "supported",
        sourceCount: 1,
        generation: 0,
        // No order provided
      },
    ];

    const layouts = createLayouts(people, []);
    const layoutA = layouts.get("a");
    const layoutB = layouts.get("b");

    expect(layoutA?.wide.x).toBeLessThan(layoutB!.wide.x);
  });

  it("positions a single person exactly in the center horizontally", () => {
    const people: AtlasPerson[] = [
      {
        id: "single",
        displayName: "Single Person",
        years: "2000-2020",
        lifeStatus: "deceased",
        role: "Role",
        summary: "Summary",
        evidence: "supported",
        sourceCount: 1,
        generation: 0,
      }
    ];

    const layouts = createLayouts(people, []);
    expect(layouts.get("single")?.wide.x).toBe(500); // 1000 / 2
  });
});
