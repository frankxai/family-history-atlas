# Contributing

Thank you for helping make family history more humane, accessible, and evidence-aware.

## Development

1. Fork the repository and create a focused branch.
2. Install with `pnpm install`.
3. Make the smallest coherent change.
4. Run `pnpm check` and `pnpm build`.
5. Open a pull request describing the user-facing effect and privacy implications.

## Non-negotiable invariants

- Only synthetic fixtures belong in this public repository.
- Public projection happens before layout, aggregation, chapter construction, analytics, and animation.
- Never encode uncertainty as certainty or merge distinct relationship kinds for visual convenience.
- Motion must preserve a usable reduced-motion and keyboard experience.
- Connector behavior remains read-only unless policy, confirmation, audit, and rollback semantics are implemented and tested.
- Every schema, privacy-policy, or connector behavior change needs tests.

## Visual contributions

Keep the editorial archival direction: charcoal, parchment, copper, restrained moss, tactile material, and generous negative space. Avoid decorative motion that competes with names, evidence, or source meaning.

All contributed media must be original or appropriately licensed, documented, and free of private information.
