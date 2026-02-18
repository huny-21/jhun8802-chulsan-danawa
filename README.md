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
- Secret: `OPENAI_API_KEY`

### 1) Install Wrangler

```bash
npm i -g wrangler
wrangler login
```

### 2) Set OpenAI key as Worker secret

```bash
cd cloudflare-worker
wrangler secret put OPENAI_API_KEY
```

### 3) Deploy Worker

```bash
wrangler deploy
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
