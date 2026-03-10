import { describe, it, expect, beforeEach, vi } from 'vitest';

const ENV = { ENVIRONMENT: 'test' };

function makeRequest(method: string, path: string, body?: unknown): Request {
  const url = `https://audit.example.com${path}`;
  if (body) {
    return new Request(url, {
      method,
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Request(url, { method });
}

describe('Audit Logs Worker', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let handler: { fetch: (req: Request, env: typeof ENV) => Promise<Response> };

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import('./index');
    handler = mod.default as typeof handler;
  });

  describe('GET /api/health', () => {
    it('returns healthy status with 100 demo logs', async () => {
      const res = await handler.fetch(makeRequest('GET', '/api/health'), ENV);
      expect(res.status).toBe(200);
      const data = await res.json() as { status: string; version: string; logCount: number };
      expect(data.status).toBe('healthy');
      expect(data.version).toBe('1.0.0');
      expect(data.logCount).toBe(100);
    });
  });

  describe('GET /api/logs', () => {
    it('returns 100 demo logs and 8 categories by default', async () => {
      const res = await handler.fetch(makeRequest('GET', '/api/logs'), ENV);
      expect(res.status).toBe(200);
      const data = await res.json() as { logs: unknown[]; total: number; categories: unknown[] };
      expect(data.logs).toHaveLength(100);
      expect(data.total).toBe(100);
      expect(data.categories).toHaveLength(8);
    });

    it('filters logs by search param', async () => {
      const res = await handler.fetch(makeRequest('GET', '/api/logs?search=user.login'), ENV);
      const data = await res.json() as { logs: Array<{ action: string }> };
      expect(data.logs.length).toBeGreaterThan(0);
      expect(data.logs.every(l => l.action.includes('user.login'))).toBe(true);
    });

    it('filters logs by status=failure', async () => {
      const res = await handler.fetch(makeRequest('GET', '/api/logs?status=failure'), ENV);
      const data = await res.json() as { logs: Array<{ status: string }> };
      expect(data.logs.length).toBeGreaterThan(0);
      expect(data.logs.every(l => l.status === 'failure')).toBe(true);
    });

    it('filters logs by status=success', async () => {
      const res = await handler.fetch(makeRequest('GET', '/api/logs?status=success'), ENV);
      const data = await res.json() as { logs: Array<{ status: string }> };
      expect(data.logs.length).toBeGreaterThan(0);
      expect(data.logs.every(l => l.status === 'success')).toBe(true);
    });

    it('filters logs by actor type', async () => {
      const res = await handler.fetch(makeRequest('GET', '/api/logs?actor=system'), ENV);
      const data = await res.json() as { logs: Array<{ actor: { type: string } }> };
      expect(data.logs.every(l => l.actor.type === 'system')).toBe(true);
    });

    it('respects limit param', async () => {
      const res = await handler.fetch(makeRequest('GET', '/api/logs?limit=10'), ENV);
      const data = await res.json() as { logs: unknown[] };
      expect(data.logs).toHaveLength(10);
    });

    it('includes CORS headers', async () => {
      const res = await handler.fetch(makeRequest('GET', '/api/logs'), ENV);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });
  });

  describe('GET /api/logs/:id', () => {
    it('returns a single log by id', async () => {
      // Fetch the list to get a real id
      const listRes = await handler.fetch(makeRequest('GET', '/api/logs'), ENV);
      const listData = await listRes.json() as { logs: Array<{ id: string }> };
      const id = listData.logs[0].id;

      const res = await handler.fetch(makeRequest('GET', `/api/logs/${id}`), ENV);
      expect(res.status).toBe(200);
      const data = await res.json() as { log: { id: string } };
      expect(data.log.id).toBe(id);
    });

    it('returns 404 for an unknown id', async () => {
      const res = await handler.fetch(makeRequest('GET', '/api/logs/log_doesnotexist'), ENV);
      expect(res.status).toBe(404);
      const data = await res.json() as { error: string };
      expect(data.error).toBe('Log not found');
    });
  });

  describe('POST /api/logs', () => {
    it('ingests a new log entry and returns it', async () => {
      const payload = {
        action: 'user.login',
        actor: { id: 'usr_test', email: 'test@example.com', type: 'user' },
        resource: { type: 'auth', id: 'session_test' },
        status: 'success',
        details: { method: 'password' },
      };
      const res = await handler.fetch(makeRequest('POST', '/api/logs', payload), ENV);
      expect(res.status).toBe(200);
      const data = await res.json() as { success: boolean; log: { id: string; action: string } };
      expect(data.success).toBe(true);
      expect(data.log.action).toBe('user.login');
      expect(data.log.id).toMatch(/^log_/);
    });

    it('ingested log is returned by subsequent GET /api/logs', async () => {
      const payload = {
        action: 'config.update',
        actor: { id: 'usr_ci', email: 'ci@example.com', type: 'api_key' },
        resource: { type: 'settings', id: 'cfg_001' },
        status: 'success',
      };
      await handler.fetch(makeRequest('POST', '/api/logs', payload), ENV);

      const listRes = await handler.fetch(makeRequest('GET', '/api/logs'), ENV);
      const listData = await listRes.json() as { total: number };
      expect(listData.total).toBe(101); // 100 demo + 1 new
    });

    it('sets default values for optional fields', async () => {
      const payload = { action: 'api.request' };
      const res = await handler.fetch(makeRequest('POST', '/api/logs', payload), ENV);
      const data = await res.json() as { log: { status: string; actor: { type: string } } };
      expect(data.log.status).toBe('success');
      expect(data.log.actor.type).toBe('system');
    });
  });

  describe('GET /api/stats', () => {
    it('returns aggregated statistics covering all 100 logs', async () => {
      const res = await handler.fetch(makeRequest('GET', '/api/stats'), ENV);
      expect(res.status).toBe(200);
      const data = await res.json() as {
        total: number;
        success: number;
        failure: number;
        successRate: string;
        byAction: Record<string, number>;
        categories: unknown[];
      };
      expect(data.total).toBe(100);
      expect(data.success + data.failure).toBe(100);
      expect(parseFloat(data.successRate)).toBeGreaterThanOrEqual(0);
      expect(parseFloat(data.successRate)).toBeLessThanOrEqual(100);
      expect(Object.keys(data.byAction).length).toBeGreaterThan(0);
      expect(data.categories).toHaveLength(8);
    });
  });

  describe('OPTIONS (CORS preflight)', () => {
    it('returns CORS headers with 200', async () => {
      const res = await handler.fetch(makeRequest('OPTIONS', '/api/logs'), ENV);
      expect(res.status).toBe(200);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(res.headers.get('Access-Control-Allow-Methods')).toContain('GET');
    });
  });

  describe('GET / (dashboard)', () => {
    it('serves the HTML dashboard', async () => {
      const res = await handler.fetch(makeRequest('GET', '/'), ENV);
      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toContain('text/html');
      const body = await res.text();
      expect(body).toContain('BlackRoad Audit Logs');
    });

    it('dashboard HTML contains Export CSV button', async () => {
      const res = await handler.fetch(makeRequest('GET', '/'), ENV);
      const body = await res.text();
      expect(body).toContain('Export CSV');
    });

    it('dashboard HTML references the /api/logs endpoint', async () => {
      const res = await handler.fetch(makeRequest('GET', '/'), ENV);
      const body = await res.text();
      expect(body).toContain('/api/logs');
    });
  });
});
