# Privacy model

Genealogy combines identity, relationships, dates, locations, images, documents, and inference. Treat it as sensitive even when individual facts appear harmless.

## Public repository guarantee

The shipped demo is entirely fictional. The public compiler accepts only `public` access requests and removes all people whose life status is `living` or `uncertain` before it computes layout or narrative chapters. Relationships and events that no longer point to a visible person are removed. Internal person and event identifiers are replaced with presentation identifiers.

Tests verify that valid changes to the hidden living fixture do not change the compiled scene.

## What the compiler cannot guarantee

Automated projection cannot recognize every private fact inside prose, titles, places, research questions, images, or source metadata. A deceased person's summary can mention a living relative. A historic photograph can reveal a current address. Sanitization therefore requires human review and, where appropriate, consent.

Do not treat `assurance: "sanitized"` as an automatic classifier. It is a declaration by the source adapter that review occurred.

## Recommended public review

Before deployment:

1. Use synthetic content until the presentation is complete.
2. Review every field and media asset, not only person records.
3. Exclude living and uncertain people by default.
4. Generalize places and dates where exactness adds risk but little historical value.
5. Keep claims linked to sources and label contradictions or uncertainty.
6. Obtain consent for identifiable living people and establish a correction/removal channel.
7. Re-run the review whenever source data or projection logic changes.

## Private instance requirements

A private family instance needs more than a private GitHub repository. At minimum it should have:

- identity-based authentication and deny-by-default authorization;
- record-level access checks in every route, server action, and connector handler;
- encrypted storage and encrypted backups;
- an append-only audit trail for reads, exports, edits, and deletions;
- consent and visibility preferences per person or branch;
- rate limits and protections against bulk enumeration;
- tested export, deletion, backup, and restore procedures; and
- no plaintext secrets or real record exports in Git history, logs, fixtures, previews, or analytics.

Until those controls are connected and verified, a private implementation should remain locked and use synthetic preview data only.
