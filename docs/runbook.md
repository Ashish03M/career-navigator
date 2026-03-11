# Operations Runbook

## Deployment

### Docker (Recommended)

```bash
# Build
docker build -t career-navigator .

# Run
docker run -d \
  --name career-navigator \
  -p 3000:3000 \
  -e ADMIN_PASSWORD=your-strong-password \
  -e GOOGLE_SERVICE_ACCOUNT_EMAIL=... \
  -e GOOGLE_PRIVATE_KEY=... \
  -e GOOGLE_SHEET_ID=... \
  -v $(pwd)/data:/app/data \
  career-navigator
```

### Docker Compose

```bash
docker compose up -d
```

### Manual (Node.js)

```bash
npm ci
npm run build
NODE_ENV=production npm start
```

## Health Check

**Endpoint**: `GET /api/health`

| Response | Meaning |
|----------|---------|
| `200 { status: "ok" }` | Application is healthy |
| `503 { status: "degraded" }` | Syllabus data file is missing or inaccessible |

Docker automatically polls this endpoint every 30 seconds.

## Rollback

### Docker

```bash
# Stop current
docker stop career-navigator

# Run previous version
docker run -d --name career-navigator -p 3000:3000 career-navigator:previous-tag
```

### Git-based

```bash
git log --oneline -5        # Find the last good commit
git checkout <commit-hash>
npm ci && npm run build
npm start
```

## Common Issues

### App won't start

1. Check `ADMIN_PASSWORD` is set (required)
2. Check `data/syllabus_v3.json` exists and is readable
3. Check port 3000 is not already in use

### Syllabus data corrupted

The app creates `data/syllabus_v3.json.backup` before every write.

```bash
# Restore from backup
cp data/syllabus_v3.json.backup data/syllabus_v3.json
```

### Lead/feedback not saving to Google Sheets

1. Verify all three `GOOGLE_*` env vars are set
2. Verify the service account email has Editor access to the spreadsheet
3. Check application logs for `sheets:` prefixed errors

### Rate limit hit

Rate limits reset after 15 minutes. Limits:
- Login: 5 attempts per IP
- Leads/Feedback: 10 per IP
- Syllabus GET: 30 per IP

### Admin panel login fails

1. Verify `ADMIN_PASSWORD` matches what you're entering
2. Check if rate-limited (5 attempts per 15 minutes)
3. Clear browser cookies and retry

## Monitoring Checklist

After deployment, verify:

- [ ] `https://your-domain/api/health` returns `200`
- [ ] Homepage loads correctly
- [ ] Admin login works at `/admin`
- [ ] PDF generation works (complete wizard, download PDF)
- [ ] Lead data appears in Google Sheet (if configured)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ADMIN_PASSWORD` | Yes | Admin panel password and HMAC key |
| `AUTH_SECRET` | No | Separate HMAC key (falls back to ADMIN_PASSWORD) |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | No | Google Sheets API service account |
| `GOOGLE_PRIVATE_KEY` | No | Google Sheets API private key (PEM) |
| `GOOGLE_SHEET_ID` | No | Target Google Sheet ID |
| `STRICT_VALIDATION` | No | Enable strict plan validation |

## Incident Response

### If the site is down

1. Check health endpoint: `curl https://your-domain/api/health`
2. Check Docker container: `docker ps` / `docker logs career-navigator`
3. Restart: `docker restart career-navigator`
4. If persistent, check disk space and memory

### If admin panel is compromised

1. Change `ADMIN_PASSWORD` immediately
2. Restart the application (invalidates all sessions)
3. Review syllabus data for unauthorized changes
4. Restore from backup if needed

### If data is lost

1. Check `data/syllabus_v3.json.backup`
2. Check Docker volume mounts (data may be in container, not host)
3. Restore from git if syllabus was committed
