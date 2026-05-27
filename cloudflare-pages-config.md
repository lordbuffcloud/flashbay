# Cloudflare Pages — Flashbay deployment

> Deploys the web target to `https://flashbay.ck42x.com` via Cloudflare Pages.
> Two paths: **A. Dashboard (manual, 5 min)** or **B. Wrangler CLI (scripted)**.

---

## Path A — Dashboard setup (recommended for first-time)

### 1. Create Pages project

1. Go to https://dash.cloudflare.com → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Authorize GitHub if not already done.
3. Pick the **`lordbuffcloud/flashbay`** repo.
4. Click **Begin setup**.

### 2. Build configuration

| Field | Value |
|---|---|
| Project name | `flashbay` |
| Production branch | `main` |
| Framework preset | **None** (we configure manually) |
| Build command | `npx expo export --platform web` |
| Build output directory | `dist` |
| Root directory (advanced) | `/` (leave blank) |
| Environment variables | (none for v1) |

Click **Save and Deploy**.

### 3. Wait for first build (~3-5 min)

You'll get a default `flashbay.pages.dev` URL when it finishes. Confirm the build succeeded.

### 4. Custom domain

1. In the project, **Custom domains** → **Set up a custom domain**.
2. Domain: `flashbay.ck42x.com`
3. Cloudflare will offer to add a CNAME automatically since `ck42x.com` is on Cloudflare nameservers. Click **Activate domain**.
4. DNS propagation: usually instant (Cloudflare is the authoritative DNS).
5. SSL certificate: Cloudflare provisions one automatically (~1 min).

Visit https://flashbay.ck42x.com — should serve the app.

### 5. Build hook (optional but recommended)

In **Settings** → **Builds & deployments** → **Build hooks**, create a hook named `data-refresh`. Use this URL to trigger a rebuild when you merge a firmware-submission PR to `main` (so `devices.json` updates without a code change). GitHub Actions can call this hook on PR merge.

---

## Path B — Wrangler CLI (scripted)

### Prerequisites

```bash
npm install -g wrangler
wrangler login   # opens browser for Cloudflare OAuth
```

### One-shot deploy

```bash
# build the web target
cd ~/Projects/flashbay
npx expo export --platform web

# create the Pages project (one-time)
wrangler pages project create flashbay --production-branch=main

# deploy the dist/ folder
wrangler pages deploy dist --project-name=flashbay
```

Add custom domain via dashboard (Wrangler doesn't expose this cleanly yet).

---

## Required Cloudflare API token scopes (if scripting)

If you set up `CLOUDFLARE_API_TOKEN` in `~/.claude/.env` for PAI to manage Pages projects across multiple apps:

| Scope | Why |
|---|---|
| `Account.Cloudflare Pages:Edit` | Create / update Pages projects |
| `Zone.DNS:Edit` (for `ck42x.com` zone) | Auto-add custom domain CNAME |
| `Zone.Zone:Read` (for `ck42x.com` zone) | Look up zone ID |

Create at https://dash.cloudflare.com/profile/api-tokens → **Create Token** → **Custom token** → add the three scopes above, scoped to your account + `ck42x.com` zone.

Then add to `~/.claude/.env`:

```
CLOUDFLARE_API_TOKEN=<token>
CLOUDFLARE_ACCOUNT_ID=<account-id-from-dashboard-sidebar>
CLOUDFLARE_ZONE_ID_CK42X=<zone-id-for-ck42x.com>
```

Future PAI projects can use these env vars without re-asking.

---

## Verify deployment

```bash
curl -I https://flashbay.ck42x.com
# expect: HTTP/2 200, server: cloudflare
```

In a browser: hard-refresh the page, confirm the wordmark and monogram render, the Operator Console aesthetic is intact, the device list loads.

---

## Rebuild on data change (firmware-submission merge)

When a PR merges to `main` that only changes `data/devices.json`, Cloudflare Pages will trigger a rebuild automatically (any push to `main` triggers a build by default). No extra config needed.

### GitHub Actions deploy (`.github/workflows/deploy-pages.yml`)

If the site still shows an old device count after a git push, the Pages project may not be connected to GitHub. Add these repository secrets and let the workflow deploy on every `main` push:

| Secret | Where to get it |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare dashboard → API Tokens → Pages Edit |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard sidebar |

Then: **Actions** → **Deploy web to Cloudflare Pages** → **Run workflow**, or push to `main`.

The web app loads `data/devices.json` from GitHub at runtime. After catalog-only changes, a hard refresh is usually enough; stale `localStorage` caches are invalidated automatically when the catalog version increases.

For zero-rebuild data refresh (faster), see future work: move `devices.json` to Cloudflare R2 with a cache-busting query param.
