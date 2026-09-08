# Multichain Trader Tape — Working Brief

## Goal

Build a deployable, read-only trader-monitoring dashboard inspired by the public rhtrenches workflow, with a shared event model for EVM networks and Solana.

## Scope for the first increment

- Preserve the existing trader seed list and its public Fomo profile links.
- Create a small, deployable project shell with chain-aware configuration.
- Define a normalized trade-event contract that keeps EVM and Solana identities separate.
- Keep the UI read-only and suitable for one-click deployment later.

## Non-goals

- No wallet connection, signing, trading, copy-trading, or custody.
- No assumption that an EVM address and a Solana address belong to the same person.
- No scraping of private or authenticated Fomo data.
- No production deployment until the user connects a GitHub/hosting account and supplies permitted RPC endpoints.

## Affected areas

- Frontend dashboard and chain filters.
- EVM and Solana ingestion adapters.
- Normalized trade schema and PnL projections.
- Environment/secrets configuration for RPC endpoints.
- Deployment configuration for Cloudflare.

## Risks

- A token transfer can be mistaken for a trade; parse transaction context and balance deltas.
- Solana and EVM wallet identities must remain chain-scoped.
- Live indexers need persistent processing and RPC capacity; static hosting alone is insufficient.
- Public data may be delayed, reorged, incomplete, or incorrectly attributed.

## Verification

- Validate the normalized schema with representative EVM and Solana fixtures.
- Run the build and type checks after each implementation slice.
- Confirm no secrets are committed.
- Manually verify chain filtering and read-only links in the browser.

## Done criteria for this increment

- Project shell exists and builds locally.
- Chain configuration supports multiple EVM networks plus Solana.
- The trader CSV is loaded as seed data without inventing Solana mappings.
- Deployment configuration is documented, but no external account is changed.
