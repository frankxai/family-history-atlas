# Deployment

## Public synthetic showcase on Vercel

Use the Deploy with Vercel button in the README or import `frankxai/family-history-atlas` in the Vercel dashboard.

The public showcase requires no environment variables. Vercel should detect Next.js and run `pnpm build` using the package-manager declaration in `package.json`.

Before promoting a deployment:

- run `pnpm check` and `pnpm build` against the exact commit;
- verify desktop, mobile, keyboard, and reduced-motion behavior;
- confirm the health route returns a successful public-safe response;
- inspect the deployment for unexpected environment variables or source maps;
- confirm every visible person, fact, question, and image is synthetic or reviewed for publication; and
- verify that the repository URL in the Deploy button resolves to the intended public source.

## Private family instance

Do not turn this public showcase into a private database by adding a secret JSON file or hiding a route. Use a separate private repository and deployment project. Pin the public engine to a reviewed release or commit, keep the deployment locked by default, and connect authenticated storage through explicit adapters.

A preview URL is not an authorization boundary. Re-check access wherever data is read, including route handlers, server actions, and MCP or other connector handlers.

Do not promote a private instance until its policy, audit, backup, export, deletion, and restore behavior has automated tests and an operator-owned recovery procedure.
