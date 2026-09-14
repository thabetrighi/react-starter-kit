# Thabet Stack Architecture

This repository keeps the Kriasoft React Starter Kit as its upstream foundation and adds only boundaries that are useful across future products.

## Applications

```text
apps/
├── web/       Astro edge entry and marketing
├── app/       React 19 SPA
├── api/       Hono + tRPC + Better Auth on Cloudflare Workers
├── email/     React Email
└── mobile/    Expo + React Native (planned after lockfile-backed scaffold)
```

## Shared packages

```text
packages/
├── ui/             shadcn/ui primitives
├── core/            generic shared utilities/types
├── api-client/     transport-neutral HTTP client for external/mobile REST APIs
├── permissions/    shared permission vocabulary and pure policy helpers
└── ws-protocol/    realtime message contracts
```

## API boundary

- **tRPC** remains the preferred contract for first-party TypeScript clients where the server and client can share the application type graph.
- **REST/OpenAPI** is the preferred boundary for public integrations, mobile clients that must remain independently deployable, and third-party consumers.
- `@repo/api-client` intentionally contains transport concerns only. It does not know about Better Auth, organizations, database models, or UI state.

## Authorization boundary

Authentication proves identity; authorization decides whether an identity may perform an operation.

`@repo/permissions` contains pure, reusable permission primitives. It is **not** a security boundary by itself. Every protected API operation must continue to enforce authorization on the server, including organization membership and resource ownership checks. Client-side permission checks are for UX only.

## Multi-tenancy

Organization/tenant isolation remains a server concern. A request must establish the authenticated user and the target organization, then verify membership/authorization before reading or mutating tenant data. Shared packages must not silently infer tenant identity from client state.

## Cloudflare strategy

Use the existing Cloudflare Workers architecture as the default:

- Workers for web/app/API execution
- Hyperdrive for pooled PostgreSQL access
- R2 for object storage where needed
- Queues/Workflows for asynchronous or durable work when a request should not wait
- Durable Objects only where stateful coordination/realtime semantics justify them

Avoid adding infrastructure merely because a Cloudflare product exists.

## Mobile strategy

The mobile app will use Expo + React Native + Expo Router. The first mobile scaffold will share API contracts and business primitives without importing web-only UI or server/database code.

Expo's current stable SDK line is SDK 57, and Expo Router is the recommended file-based routing layer for that SDK. Dependencies should be installed with Expo's version-aware installer so the Expo/React Native versions remain compatible.

## Upstream strategy

Keep the fork easy to synchronize with Kriasoft:

1. Prefer additive packages and isolated application boundaries.
2. Avoid broad renames of existing `@repo/*` packages.
3. Do not rewrite the existing auth, database, infra, or deployment architecture without a concrete requirement.
4. Keep product-specific code out of generic packages.
5. Record architectural deviations in `docs/architecture/`.
