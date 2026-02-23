/**
 * Vercel Serverless Function — ServiceNow OAuth Token Proxy
 *
 * Handles ROPC (Resource Owner Password Credentials) token exchange.
 * The browser sends only { username, password }; this function adds
 * client_id and client_secret from server-side environment variables.
 * ServiceNow never receives a cross-origin request — this is server-to-server.
 *
 * POST /api/servicenow-oauth
 * Body: { username, password }
 */
export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://loan-withdrawal.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body ?? {};

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const snInstance = process.env.SN_INSTANCE;
  const clientId = process.env.SN_OAUTH_CLIENT_ID;
  const clientSecret = process.env.SN_OAUTH_CLIENT_SECRET;

  if (!snInstance || !clientId || !clientSecret) {
    console.error('Missing required server environment variables: SN_INSTANCE, SN_OAUTH_CLIENT_ID, SN_OAUTH_CLIENT_SECRET');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const body = new URLSearchParams({
    grant_type: 'password',
    username,
    password,
    client_id: clientId,
    client_secret: clientSecret,
  });

  try {
    const snRes = await fetch(`${snInstance}/oauth_token.do`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    const text = await snRes.text();
    const contentType = snRes.headers.get('content-type') || 'application/json';
    res.setHeader('Content-Type', contentType);
    return res.status(snRes.status).send(text);
  } catch (err) {
    console.error('ServiceNow OAuth proxy error:', err);
    return res.status(502).json({ error: 'Failed to reach ServiceNow' });
  }
}
