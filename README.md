# Family History Atlas

Every branch has a story. Every story keeps its source.

Family History Atlas is an open-source, evidence-aware family tree experience built with Next.js and GSAP. It turns reviewed people, relationships, places, sources, and unresolved questions into a cinematic narrative without turning genealogy into a wall of boxes.

The included Alder family is entirely fictional. No real family records are shipped in this repository.

![Family History Atlas opening artwork](public/images/archive-thread.png)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ffrankxai%2Ffamily-history-atlas&project-name=family-history-atlas&repository-name=family-history-atlas)

## What makes it different

- A scroll-directed story on wide screens and a calm generation river on mobile.
- Evidence states remain visible: lead, supported, strongly supported, contradicted, and unresolved.
- Parenthood, adoption, guardianship, partnership, and chosen family are modeled explicitly.
- Public projection runs before layout. Living-person records cannot influence public node positions, counts, links, chapters, or animation timing.
- Motion respects `prefers-reduced-motion`, and the experience retains a semantic reading order without JavaScript animation.
- The reusable compiler emits a render-neutral `AtlasStoryDocument`; GSAP only receives that public-safe document.

## Quick start

Requirements: Node.js 20.9 or newer and pnpm 11.

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

Run the quality gates with:

```bash
pnpm check
pnpm build
```

## Customize the story

Start with [`src/atlas/synthetic.ts`](src/atlas/synthetic.ts). Keep `assurance: "synthetic"` while experimenting. Before publishing real historical material, create a reviewed, public-safe source and set `assurance: "sanitized"`.

```ts
import { createFamilyHistoryAtlas } from "@frankxai/family-history-atlas/engine";

const atlas = createFamilyHistoryAtlas();
const result = await atlas.compile({
  access: { kind: "public" },
  source: reviewedPublicSource,
});
```

The compiler validates the schema and graph, removes living people and anything connected only to them, remaps internal identifiers, and only then creates layout coordinates and story chapters.

## Privacy boundary

This repository is a public presentation engine, not a private genealogy database. Do not commit birth dates, addresses, contact details, medical information, private notes, DNA data, unreviewed media, or records about living people.

The living-person filter is defense in depth, not consent management. Free-text fields can still contain sensitive facts, so every public source needs human review. A real family deployment should keep its source records in a separate private system with authentication, authorization, audit logs, backups, export, deletion, and restore procedures.

Read the full [privacy model](docs/PRIVACY.md) and [architecture](docs/ARCHITECTURE.md) before connecting real data.

## Deployment

Vercel is the primary deployment path. The button above creates a copy under your own Git provider and deploys the public synthetic showcase. No environment variables are required.

See [deployment guidance](docs/DEPLOYMENT.md) for private-instance requirements and the release checklist.

## Project structure

```text
src/app/                 Next.js App Router shell and public route
src/atlas/               schema, graph validation, projection, layout, tests
src/components/          responsive GSAP presentation layer
public/images/           original project-bound decorative artwork
docs/                    architecture, privacy, deployment, asset provenance
```

## Contributing

Contributions are welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md), and please preserve the projection-before-layout privacy invariant.

MIT licensed. See [LICENSE](LICENSE).
