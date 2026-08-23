# Security policy

## Supported version

Security fixes are applied to the latest release and the default branch.

## Reporting a vulnerability

Please do not open a public issue for a vulnerability or an accidental disclosure of personal information. Use GitHub's private vulnerability reporting for this repository. Include the affected version, reproduction steps, impact, and any suggested mitigation.

Do not include real family records, credentials, access tokens, or private media in the report. Use synthetic examples.

## Security boundary

Family History Atlas is a public presentation engine. It does not provide authentication, tenant isolation, consent workflows, encrypted record storage, audit history, or backup/restore controls. A deployment that handles private family data must add those controls outside this repository and re-check authorization at every data-reading route, server action, and connector handler.

The compiler's living-person projection is defense in depth. It does not make arbitrary source text safe to publish.
