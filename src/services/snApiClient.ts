/**
 * snApiClient
 *
 * All ServiceNow REST calls are routed through a proxy:
 *   Dev  → Vite proxy at /servicenow-api (see vite.config.ts)
 *   Prod → Vercel function at /api/servicenow-api
 *
 * This means no CORS configuration is required in ServiceNow —
 * every call is server-to-server from Vercel's edge network.
 * The Bearer token and X-Domain header are forwarded transparently.
 */

const isDev = import.meta.env.DEV;

/**
 * Build the proxy URL for a given ServiceNow path + optional query params.
 * The path should start with /api/... (e.g. /api/now/table/sys_user)
 */
function buildURL(snPath: string, params?: Record<string, string>): string {
  // Append SN query params directly onto the path
  const url = new URL(`https://placeholder${snPath}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const fullPath = url.pathname + url.search;

  if (isDev) {
    return `/servicenow-api${fullPath}`;
  }
  return `/api/servicenow-api?path=${encodeURIComponent(fullPath)}`;
}

// ---------------------------------------------------------------------------
// Auth headers — read token from sessionStorage set by AuthContext
// ---------------------------------------------------------------------------
function authHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  const stored = sessionStorage.getItem('sn_auth');
  if (stored) {
    try {
      const { accessToken, user } = JSON.parse(stored) as {
        accessToken: string;
        user: { sys_domain?: { value: string } };
      };
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
      const domainId = user?.sys_domain?.value;
      if (domainId) headers['X-Domain'] = domainId;
    } catch { /* ignore */ }
  }

  return headers;
}

// ---------------------------------------------------------------------------
// Response handling
// ---------------------------------------------------------------------------
async function handleResponse<T>(res: Response, label: string): Promise<T> {
  if (res.status === 401) {
    sessionStorage.removeItem('sn_auth');
    const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/login?returnTo=${returnTo}`;
    throw new Error('Session expired');
  }

  if (res.status === 403) {
    throw new Error(
      'Domain access denied. Your account does not have permission to access this record.',
    );
  }

  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json() as { error?: { message?: string } };
      detail = body?.error?.message ?? '';
    } catch { /* ignore */ }
    throw new Error(`ServiceNow ${res.status} on ${label}${detail ? `: ${detail}` : ''}`);
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------
export async function snGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = buildURL(path, params);
  const res = await fetch(url, { headers: authHeaders() });
  return handleResponse<T>(res, path);
}

export async function snPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(buildURL(path), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res, path);
}

export async function snPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(buildURL(path), {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res, path);
}

export async function snDelete(path: string): Promise<void> {
  const res = await fetch(buildURL(path), {
    method: 'DELETE',
    headers: authHeaders(),
  });
  await handleResponse<void>(res, path);
}
