A simple HTML/JS/CSS starter template

## Deploy With Auto Version History

Use `deploy.sh` whenever you deploy. It automatically:
- commits current changes (if any),
- creates a deploy tag (`deploy-YYYYMMDD-HHMMSS` in UTC),
- pushes `main` and the deploy tag to GitHub,
- runs Firebase Hosting deploy.

```bash
chmod +x deploy.sh
./deploy.sh "배포 메모"
```

If you need a specific Firebase project, set:

```bash
FIREBASE_PROJECT=<your-project-id> ./deploy.sh "배포 메모"
```

## AdSense Setup

Ad slots are already wired into the page with `public/ads.js`.

1. Open `public/index.html`.
2. Update `window.ADSENSE_CONFIG.client` with your AdSense publisher ID (example: `ca-pub-1234567890123456`).
3. Update `window.ADSENSE_CONFIG.slots.top` and `window.ADSENSE_CONFIG.slots.bottom` with your ad slot IDs.
4. Set `window.ADSENSE_CONFIG.enabled` to `true`.
5. Deploy with `./deploy.sh "adsense enable"`.

## AI API Backend (Cloudflare Workers)

This project includes a Cloudflare Worker backend:
- Endpoints: `POST /api/ai`, `POST /api/baby-photo`
- Worker source: `cloudflare-worker/src/index.js`
- Baby photo prompt source: `cloudflare-worker/src/baby-photo-config.js`
- Secrets: `OPENAI_API_KEY` (general/baby-photo), `GEMINI_API_KEY` (naming-report)

### 1) Install Wrangler

```bash
npm i -g wrangler
wrangler login
```

### 2) Set Worker secrets

```bash
cd cloudflare-worker
wrangler secret put OPENAI_API_KEY
wrangler secret put GEMINI_API_KEY
```

### 3) Deploy Worker

```bash
wrangler deploy
```

Optional model/prompt settings are in `cloudflare-worker/wrangler.toml`:
- `AI_DEFAULT_MODEL`
- `BABY_PHOTO_IMAGE_MODEL`
- `BABY_PHOTO_ANALYSIS_MODEL`
- `BABY_PHOTO_PROMPT_VERSION`
- `BABY_PHOTO_ANALYSIS_PROMPT_VERSION`
- `BABY_PHOTO_ANALYSIS_SYSTEM_PROMPT`
- `BABY_PHOTO_ANALYSIS_INSTRUCTION_OVERRIDE`
- `BABY_PHOTO_IMAGE_PROMPT_OVERRIDE`

Admin access settings:
- `ADMIN_EMAIL_ALLOWLIST` (comma-separated emails)
- `ADMIN_UID_ALLOWLIST` (comma-separated Firebase UIDs)

### Security Notes (Firebase API key)

- Do not commit active Firebase Web API keys to Git.
- Rotate compromised keys immediately in Google Cloud Console.
- Apply API restrictions and HTTP referrer restrictions to the new key.
- Keep `cloudflare-worker/wrangler.toml` value `FIREBASE_WEB_API_KEY` as placeholder in Git.
- Put the real Firebase key only in `public/runtime-config.js` (git-ignored).
- Use `public/runtime-config.sample.js` as template.

Runtime config setup:

```bash
cp public/runtime-config.sample.js public/runtime-config.js
```

Then edit:
- `firebaseApiKey`: rotated restricted key
- `firebaseEnabled`: `true`

Predeploy security check:

```bash
bash scripts/security-check.sh
```

### 4) Connect frontend to Worker

Open `public/index.html` and set:

```html
window.AI_API_BASE = "https://<your-worker-subdomain>.workers.dev";
```

### 5) Deploy Hosting

```bash
firebase deploy --only hosting --project test-17133889-10c0f
```

## Admin Console

- URL: `/admin.html`
- Frontend files: `public/admin.html`, `public/admin.js`
- Admin APIs:
  - `GET /api/admin/whoami`
  - `GET /api/admin/overview`
  - `GET/PUT /api/admin/runtime-config`
  - `GET /api/admin/payments`
  - `GET /api/admin/users`
