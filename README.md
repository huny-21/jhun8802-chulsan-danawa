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
