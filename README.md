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
