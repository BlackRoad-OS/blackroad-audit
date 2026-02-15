// BlackRoad Audit Logs Service
// Track all API activity for compliance and security

interface Env {
  ENVIRONMENT: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  actor: { id: string; email: string; type: 'user' | 'api_key' | 'system' };
  action: string;
  resource: { type: string; id: string; name?: string };
  details: Record<string, any>;
  ip: string;
  userAgent: string;
  status: 'success' | 'failure';
  duration: number;
  metadata: Record<string, any>;
}

// Event categories
const CATEGORIES = [
  { id: 'auth', name: 'Authentication', icon: '🔐' },
  { id: 'api', name: 'API Access', icon: '🔌' },
  { id: 'deploy', name: 'Deployments', icon: '🚀' },
  { id: 'config', name: 'Configuration', icon: '⚙️' },
  { id: 'user', name: 'User Management', icon: '👤' },
  { id: 'billing', name: 'Billing', icon: '💳' },
  { id: 'security', name: 'Security', icon: '🛡️' },
  { id: 'data', name: 'Data Access', icon: '📊' },
];

// Generate demo logs
function generateLogs(): AuditLog[] {
  const actions = [
    { action: 'user.login', resource: 'auth', status: 'success' as const },
    { action: 'api.request', resource: 'graphql', status: 'success' as const },
    { action: 'deployment.create', resource: 'deploy', status: 'success' as const },
    { action: 'webhook.trigger', resource: 'webhook', status: 'success' as const },
    { action: 'email.send', resource: 'email', status: 'success' as const },
    { action: 'flag.update', resource: 'feature-flag', status: 'success' as const },
    { action: 'key.create', resource: 'api-key', status: 'success' as const },
    { action: 'user.invite', resource: 'user', status: 'success' as const },
    { action: 'config.update', resource: 'settings', status: 'success' as const },
    { action: 'user.login', resource: 'auth', status: 'failure' as const },
    { action: 'api.request', resource: 'graphql', status: 'failure' as const },
    { action: 'key.revoke', resource: 'api-key', status: 'success' as const },
  ];

  const actors = [
    { id: 'usr_alice', email: 'alice@blackroad.io', type: 'user' as const },
    { id: 'usr_bob', email: 'bob@blackroad.io', type: 'user' as const },
    { id: 'key_prod', email: 'api-key:production', type: 'api_key' as const },
    { id: 'key_ci', email: 'api-key:ci-pipeline', type: 'api_key' as const },
    { id: 'system', email: 'system@blackroad.io', type: 'system' as const },
  ];

  const ips = ['192.168.1.100', '10.0.0.50', '203.0.113.42', '198.51.100.23', '100.72.180.98'];
  const userAgents = [
    'BlackRoad-SDK/1.0.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    'BlackRoad-CLI/1.0.0',
    'curl/7.79.1',
    'GitHub-Hookshot/abc123',
  ];

  const logs: AuditLog[] = [];
  const now = Date.now();

  for (let i = 0; i < 100; i++) {
    const action = actions[Math.floor(Math.random() * actions.length)];
    const actor = actors[Math.floor(Math.random() * actors.length)];

    logs.push({
      id: 'log_' + crypto.randomUUID().split('-')[0],
      timestamp: new Date(now - i * 60000 * Math.random() * 60).toISOString(),
      actor,
      action: action.action,
      resource: {
        type: action.resource,
        id: action.resource + '_' + Math.random().toString(36).slice(2, 8),
        name: action.resource.charAt(0).toUpperCase() + action.resource.slice(1),
      },
      details: {
        method: action.action.includes('api') ? 'POST' : undefined,
        path: action.action.includes('api') ? '/graphql' : undefined,
        statusCode: action.status === 'success' ? 200 : 401,
      },
      ip: ips[Math.floor(Math.random() * ips.length)],
      userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
      status: action.status,
      duration: Math.floor(Math.random() * 500) + 10,
      metadata: { region: 'us-east-1', version: '1.0.0' },
    });
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

let logs: AuditLog[] = [];
let initialized = false;

function initLogs() {
  if (!initialized) {
    logs = generateLogs();
    initialized = true;
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const dashboardHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BlackRoad Audit Logs</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #000; color: #fff; min-height: 100vh; }
    .header { background: linear-gradient(135deg, #111 0%, #000 100%); border-bottom: 1px solid #333; padding: 21px 34px; display: flex; justify-content: space-between; align-items: center; }
    .logo { font-size: 21px; font-weight: bold; background: linear-gradient(135deg, #F5A623 0%, #FF1D6C 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .header-actions { display: flex; gap: 13px; }
    .btn { padding: 10px 21px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; transition: transform 0.2s; font-size: 13px; }
    .btn:hover { transform: scale(1.05); }
    .btn-secondary { background: #222; color: #fff; border: 1px solid #444; }
    .container { max-width: 1400px; margin: 0 auto; padding: 34px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 21px; margin-bottom: 34px; }
    .stat-card { background: #111; border: 1px solid #333; border-radius: 13px; padding: 21px; text-align: center; }
    .stat-value { font-size: 34px; font-weight: bold; background: linear-gradient(135deg, #FF1D6C 0%, #F5A623 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .stat-label { color: #888; font-size: 13px; margin-top: 8px; }
    .filters { display: flex; gap: 13px; margin-bottom: 21px; flex-wrap: wrap; }
    .filter-input { padding: 10px 16px; border-radius: 8px; border: 1px solid #333; background: #111; color: #fff; font-size: 13px; min-width: 150px; }
    .filter-input:focus { border-color: #FF1D6C; outline: none; }
    .logs-table { width: 100%; border-collapse: collapse; }
    .logs-table th { text-align: left; padding: 13px; background: #111; color: #888; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #333; }
    .logs-table td { padding: 13px; border-bottom: 1px solid #222; font-size: 13px; }
    .logs-table tr:hover { background: #0a0a0a; }
    .status-badge { padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .status-badge.success { background: #10B98122; color: #10B981; }
    .status-badge.failure { background: #EF444422; color: #EF4444; }
    .actor-type { padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 8px; }
    .actor-type.user { background: #2979FF22; color: #2979FF; }
    .actor-type.api_key { background: #9C27B022; color: #9C27B0; }
    .actor-type.system { background: #F5A62322; color: #F5A623; }
    .action-name { font-family: monospace; color: #FF1D6C; }
    .resource-name { color: #888; }
    .timestamp { color: #666; font-size: 12px; }
    .ip { font-family: monospace; color: #666; font-size: 12px; }
    .duration { color: #10B981; font-size: 12px; }
    .pagination { display: flex; justify-content: center; gap: 8px; margin-top: 21px; }
    .pagination button { padding: 8px 16px; border-radius: 6px; border: 1px solid #333; background: #111; color: #fff; cursor: pointer; }
    .pagination button:hover { border-color: #FF1D6C; }
    .pagination button.active { background: linear-gradient(135deg, #FF1D6C 0%, #9C27B0 100%); border: none; }
    .footer { border-top: 1px solid #333; padding: 21px 34px; text-align: center; color: #666; font-size: 13px; margin-top: 34px; }
    .footer a { color: #FF1D6C; text-decoration: none; }
    @media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } .logs-table { font-size: 12px; } }
  </style>
</head>
<body>
  <header class="header">
    <div class="logo">BlackRoad Audit Logs</div>
    <div class="header-actions">
      <button class="btn btn-secondary" onclick="exportLogs()">Export CSV</button>
    </div>
  </header>
  <div class="container">
    <div class="stats-grid" id="stats"></div>
    <div class="filters">
      <input type="text" class="filter-input" id="search" placeholder="Search actions..." oninput="filterLogs()">
      <select class="filter-input" id="status-filter" onchange="filterLogs()">
        <option value="">All Status</option>
        <option value="success">Success</option>
        <option value="failure">Failure</option>
      </select>
      <select class="filter-input" id="actor-filter" onchange="filterLogs()">
        <option value="">All Actors</option>
        <option value="user">Users</option>
        <option value="api_key">API Keys</option>
        <option value="system">System</option>
      </select>
      <select class="filter-input" id="time-filter" onchange="filterLogs()">
        <option value="1h">Last Hour</option>
        <option value="24h" selected>Last 24 Hours</option>
        <option value="7d">Last 7 Days</option>
        <option value="30d">Last 30 Days</option>
      </select>
    </div>
    <table class="logs-table">
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>Actor</th>
          <th>Action</th>
          <th>Resource</th>
          <th>Status</th>
          <th>Duration</th>
          <th>IP</th>
        </tr>
      </thead>
      <tbody id="logs-body"></tbody>
    </table>
    <div class="pagination" id="pagination"></div>
  </div>
  <footer class="footer">
    <p>Powered by <a href="https://blackroad.io">BlackRoad OS</a> &bull; <a href="https://blackroad-dev-portal.amundsonalexa.workers.dev">Developer Portal</a></p>
  </footer>
  <script>
    let allLogs = [];
    let currentPage = 1;
    const perPage = 20;

    async function loadLogs() {
      const resp = await fetch('/api/logs');
      const data = await resp.json();
      allLogs = data.logs;
      updateStats(allLogs);
      renderLogs(allLogs);
    }

    function updateStats(logs) {
      const success = logs.filter(l => l.status === 'success').length;
      const failure = logs.filter(l => l.status === 'failure').length;
      const uniqueActors = new Set(logs.map(l => l.actor.id)).size;
      document.getElementById('stats').innerHTML = \`
        <div class="stat-card"><div class="stat-value">\${logs.length}</div><div class="stat-label">Total Events</div></div>
        <div class="stat-card"><div class="stat-value">\${success}</div><div class="stat-label">Successful</div></div>
        <div class="stat-card"><div class="stat-value">\${failure}</div><div class="stat-label">Failed</div></div>
        <div class="stat-card"><div class="stat-value">\${uniqueActors}</div><div class="stat-label">Unique Actors</div></div>
      \`;
    }

    function renderLogs(logs) {
      const start = (currentPage - 1) * perPage;
      const pageLogs = logs.slice(start, start + perPage);
      document.getElementById('logs-body').innerHTML = pageLogs.map(l => \`
        <tr>
          <td class="timestamp">\${new Date(l.timestamp).toLocaleString()}</td>
          <td>\${l.actor.email}<span class="actor-type \${l.actor.type}">\${l.actor.type}</span></td>
          <td class="action-name">\${l.action}</td>
          <td class="resource-name">\${l.resource.type}</td>
          <td><span class="status-badge \${l.status}">\${l.status}</span></td>
          <td class="duration">\${l.duration}ms</td>
          <td class="ip">\${l.ip}</td>
        </tr>
      \`).join('');

      const pages = Math.ceil(logs.length / perPage);
      document.getElementById('pagination').innerHTML = Array.from({length: Math.min(pages, 5)}, (_, i) =>
        \`<button class="\${i + 1 === currentPage ? 'active' : ''}" onclick="goToPage(\${i + 1})">\${i + 1}</button>\`
      ).join('');
    }

    function filterLogs() {
      const search = document.getElementById('search').value.toLowerCase();
      const status = document.getElementById('status-filter').value;
      const actor = document.getElementById('actor-filter').value;
      let filtered = allLogs.filter(l => {
        if (search && !l.action.toLowerCase().includes(search)) return false;
        if (status && l.status !== status) return false;
        if (actor && l.actor.type !== actor) return false;
        return true;
      });
      currentPage = 1;
      updateStats(filtered);
      renderLogs(filtered);
    }

    function goToPage(page) { currentPage = page; filterLogs(); }
    function exportLogs() { alert('Exporting logs as CSV...'); }
    loadLogs();
  </script>
</body>
</html>`;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    initLogs();
    const url = new URL(request.url);
    const method = request.method;

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // List logs
    if (url.pathname === '/api/logs' && method === 'GET') {
      const search = url.searchParams.get('search');
      const status = url.searchParams.get('status');
      const actorType = url.searchParams.get('actor');
      const limit = parseInt(url.searchParams.get('limit') || '100');

      let filtered = logs;
      if (search) filtered = filtered.filter(l => l.action.includes(search));
      if (status) filtered = filtered.filter(l => l.status === status);
      if (actorType) filtered = filtered.filter(l => l.actor.type === actorType);

      return Response.json({
        logs: filtered.slice(0, limit),
        total: filtered.length,
        categories: CATEGORIES,
      }, { headers: corsHeaders });
    }

    // Get single log
    if (url.pathname.match(/^\/api\/logs\/[\w]+$/) && method === 'GET') {
      const id = url.pathname.split('/').pop()!;
      const log = logs.find(l => l.id === id);
      if (!log) return Response.json({ error: 'Log not found' }, { status: 404, headers: corsHeaders });
      return Response.json({ log }, { headers: corsHeaders });
    }

    // Ingest new log
    if (url.pathname === '/api/logs' && method === 'POST') {
      const body = await request.json() as any;
      const newLog: AuditLog = {
        id: 'log_' + crypto.randomUUID().split('-')[0],
        timestamp: new Date().toISOString(),
        actor: body.actor || { id: 'unknown', email: 'unknown', type: 'system' },
        action: body.action,
        resource: body.resource || { type: 'unknown', id: 'unknown' },
        details: body.details || {},
        ip: request.headers.get('CF-Connecting-IP') || 'unknown',
        userAgent: request.headers.get('User-Agent') || 'unknown',
        status: body.status || 'success',
        duration: body.duration || 0,
        metadata: body.metadata || {},
      };
      logs.unshift(newLog);
      return Response.json({ success: true, log: newLog }, { headers: corsHeaders });
    }

    // Stats
    if (url.pathname === '/api/stats') {
      const success = logs.filter(l => l.status === 'success').length;
      const failure = logs.filter(l => l.status === 'failure').length;
      const byAction: Record<string, number> = {};
      logs.forEach(l => { byAction[l.action] = (byAction[l.action] || 0) + 1; });

      return Response.json({
        total: logs.length,
        success,
        failure,
        successRate: ((success / logs.length) * 100).toFixed(1),
        byAction,
        categories: CATEGORIES,
      }, { headers: corsHeaders });
    }

    // Health
    if (url.pathname === '/api/health') {
      return Response.json({ status: 'healthy', version: '1.0.0', logCount: logs.length }, { headers: corsHeaders });
    }

    return new Response(dashboardHTML, { headers: { 'Content-Type': 'text/html' } });
  },
};
