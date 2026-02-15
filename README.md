# BlackRoad Audit Logs

Track all API activity, user actions, and security events.

## Live

- **Dashboard**: https://blackroad-audit.amundsonalexa.workers.dev
- **API**: https://blackroad-audit.amundsonalexa.workers.dev/api/logs

## Features

- **Real-time Logging** - Track all API and user activity
- **Search & Filter** - Find events by action, status, actor
- **Actor Types** - Users, API keys, system events
- **8 Categories** - Auth, API, deploy, config, user, billing, security, data
- **Export** - Download logs as CSV
- **Pagination** - Browse large log volumes

## Event Categories

| Category | Icon | Description |
|----------|------|-------------|
| Authentication | 🔐 | Login, logout, MFA |
| API Access | 🔌 | GraphQL queries, REST calls |
| Deployments | 🚀 | Service deploys, rollbacks |
| Configuration | ⚙️ | Settings changes |
| User Management | 👤 | Invites, role changes |
| Billing | 💳 | Payments, subscriptions |
| Security | 🛡️ | Key rotation, permissions |
| Data Access | 📊 | Read/write operations |

## API

### GET /api/logs
List audit logs with optional filters.

Query params:
- `search` - Search action names
- `status` - Filter by success/failure
- `actor` - Filter by actor type (user/api_key/system)
- `limit` - Max results (default 100)

### GET /api/logs/:id
Get a single log entry.

### POST /api/logs
Ingest a new log entry.

```json
{
  "action": "user.login",
  "actor": { "id": "usr_123", "email": "user@example.com", "type": "user" },
  "resource": { "type": "auth", "id": "session_abc" },
  "status": "success",
  "details": { "method": "password" }
}
```

### GET /api/stats
Get aggregated statistics.

## Log Structure

```json
{
  "id": "log_abc123",
  "timestamp": "2026-02-15T05:00:00Z",
  "actor": { "id": "usr_123", "email": "user@example.com", "type": "user" },
  "action": "deployment.create",
  "resource": { "type": "deploy", "id": "dep_xyz", "name": "my-service" },
  "details": { "version": "1.0.0", "environment": "production" },
  "ip": "192.168.1.100",
  "userAgent": "BlackRoad-CLI/1.0.0",
  "status": "success",
  "duration": 234,
  "metadata": { "region": "us-east-1" }
}
```

## Development

```bash
npm install
npm run dev      # Local development
npm run deploy   # Deploy to Cloudflare
```

## License

Proprietary - BlackRoad OS, Inc.
