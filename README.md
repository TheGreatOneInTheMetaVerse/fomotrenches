# chaintrenches

A read-only, static first increment for a multi-chain trader tape. It loads the public rhtrenches trader export, keeps the EVM wallet links, and leaves a dedicated column for verified Solana mappings.

## Run locally

Serve this directory with any static web server so the browser can fetch the CSV:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy

This increment has no build step and can be deployed as a static site. Set the publish directory to the repository root (`.`). The next increment will add the live ingestion API and chain adapters; those should run in a server-side environment and must not expose RPC secrets in the browser.

## Data contract direction

The current CSV remains the seed watchlist. Future adapters should emit a common event shape with `chain_id`, `wallet_address`, `asset_id`, `side`, `quantity`, `quote_amount`, `price_usd`, `tx_id`, and `confidence`. EVM and Solana addresses remain separate even when they are attached to the same verified trader profile.
