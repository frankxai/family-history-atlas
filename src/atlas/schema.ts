import { z } from "zod";

const evidence = z.enum([
  "lead",
  "supported",
  "strongly_supported",
  "contradicted",
  "unresolved",
]);

const person = z.object({
  id: z.string().min(1).max(80),
  displayName: z.string().min(1).max(120),
  years: z.string().min(1).max(80),
  lifeStatus: z.enum(["deceased", "living", "uncertain"]),
  generation: z.number().int().min(0).max(12).optional(),
  order: z.number().int().min(0).max(1000).optional(),
  role: z.string().min(1).max(100),
  summary: z.string().min(1).max(480),
  place: z.string().min(1).max(120).optional(),
  evidence,
  sourceCount: z.number().int().min(0).max(999),
  accent: z.enum(["copper", "moss", "clay", "gold"]).optional(),
});

const relationship = z.object({
  id: z.string().min(1).max(80),
  from: z.string().min(1).max(80),
  to: z.string().min(1).max(80),
  kind: z.enum(["parent", "adoptive_parent", "guardian", "partner", "chosen_family"]),
  evidence,
  label: z.string().min(1).max(100).optional(),
});

const event = z.object({
  id: z.string().min(1).max(80),
  year: z.string().min(1).max(80),
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(480),
  personIds: z.array(z.string().min(1).max(80)).max(40),
  place: z.string().min(1).max(120).optional(),
  evidence,
});

const researchQuestion = z.object({
  id: z.string().min(1).max(80),
  question: z.string().min(1).max(240),
  status: z.enum(["open", "conflicted", "next_search"]),
  nextAction: z.string().min(1).max(320),
});

export const atlasSourceSchema = z
  .object({
    schemaVersion: z.literal("1"),
    assurance: z.enum(["synthetic", "sanitized"]),
    title: z.string().min(1).max(120),
    subtitle: z.string().min(1).max(240),
    provenanceNote: z.string().min(1).max(320),
    people: z.array(person).min(1).max(500),
    relationships: z.array(relationship).max(1000),
    events: z.array(event).max(500),
    researchQuestions: z.array(researchQuestion).max(200),
  })
  .strict();
