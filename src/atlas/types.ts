export type EvidenceConclusion =
  | "lead"
  | "supported"
  | "strongly_supported"
  | "contradicted"
  | "unresolved";

export type LifeStatus = "deceased" | "living" | "uncertain";

export type RelationshipKind =
  | "parent"
  | "adoptive_parent"
  | "guardian"
  | "partner"
  | "chosen_family";

export type AtlasPerson = Readonly<{
  id: string;
  displayName: string;
  years: string;
  lifeStatus: LifeStatus;
  generation?: number;
  order?: number;
  role: string;
  summary: string;
  place?: string;
  evidence: EvidenceConclusion;
  sourceCount: number;
  accent?: "copper" | "moss" | "clay" | "gold";
}>;

export type AtlasRelationship = Readonly<{
  id: string;
  from: string;
  to: string;
  kind: RelationshipKind;
  evidence: EvidenceConclusion;
  label?: string;
}>;

export type AtlasEvent = Readonly<{
  id: string;
  year: string;
  title: string;
  description: string;
  personIds: readonly string[];
  place?: string;
  evidence: EvidenceConclusion;
}>;

export type ResearchQuestion = Readonly<{
  id: string;
  question: string;
  status: "open" | "conflicted" | "next_search";
  nextAction: string;
}>;

export type AtlasSource = Readonly<{
  schemaVersion: "1";
  assurance: "synthetic" | "sanitized";
  title: string;
  subtitle: string;
  provenanceNote: string;
  people: readonly AtlasPerson[];
  relationships: readonly AtlasRelationship[];
  events: readonly AtlasEvent[];
  researchQuestions: readonly ResearchQuestion[];
}>;

export type LayoutPoint = Readonly<{
  x: number;
  y: number;
  generation: number;
}>;

export type AtlasSceneNode = AtlasPerson &
  Readonly<{
    presentationId: string;
    layout: Readonly<{
      wide: LayoutPoint;
      compact: LayoutPoint;
    }>;
  }>;

export type AtlasSceneLink = AtlasRelationship &
  Readonly<{
    fromPresentationId: string;
    toPresentationId: string;
  }>;

export type AtlasChapter = Readonly<{
  id: string;
  eyebrow: string;
  title: string;
  copy: string;
  nodeIds: readonly string[];
  camera: Readonly<{
    xPercent: number;
    yPercent: number;
    scale: number;
  }>;
}>;

export type AtlasStoryDocument = Readonly<{
  schemaVersion: "1";
  documentId: string;
  contentClass: "public-safe";
  title: string;
  subtitle: string;
  provenanceNote: string;
  nodes: readonly AtlasSceneNode[];
  links: readonly AtlasSceneLink[];
  events: readonly AtlasEvent[];
  researchQuestions: readonly ResearchQuestion[];
  chapters: readonly AtlasChapter[];
  readingOrder: readonly string[];
}>;

export type AtlasErrorCode =
  | "SOURCE_INVALID"
  | "LIVING_DATA_BLOCKED"
  | "GRAPH_INVALID"
  | "NO_VISIBLE_CONTENT";

export type AtlasOutcome =
  | Readonly<{ ok: true; document: AtlasStoryDocument; warnings: readonly string[] }>
  | Readonly<{
      ok: false;
      error: Readonly<{
        code: AtlasErrorCode;
        message: string;
        retryable: false;
      }>;
    }>;

export type AtlasCompileRequest = Readonly<{
  access: Readonly<{ kind: "public" }>;
  source: unknown;
}>;

export type FamilyHistoryAtlas = Readonly<{
  compile(request: AtlasCompileRequest): Promise<AtlasOutcome>;
}>;
