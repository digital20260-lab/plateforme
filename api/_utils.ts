import * as crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

type JsonBody = Record<string, unknown>;

const APP_URL = process.env.APP_URL || process.env.VITE_APP_URL || 'https://plateforme-tau.vercel.app';
const GENIUSPAY_ENDPOINT = 'https://pay.genius.ci/api/v1/merchant/payments';

export function setSecurityHeaders(res: any) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; frame-ancestors 'none'; base-uri 'none'"
  );
}

export function safeError(res: any, status = 500) {
  return res.status(status).json({ error: 'Une erreur est survenue' });
}

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('supabase_server_env_missing');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export async function readRawBody(req: any): Promise<string> {
  if (typeof req.body === 'string') return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');
  if (req.body && typeof req.body === 'object') return JSON.stringify(req.body);

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

export async function parseJsonBody(req: any): Promise<JsonBody> {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  const raw = await readRawBody(req);
  return raw ? JSON.parse(raw) : {};
}

export function getBearerToken(req: any) {
  const header = req.headers.authorization || req.headers.Authorization || '';
  const value = Array.isArray(header) ? header[0] : header;
  if (!value.startsWith('Bearer ')) return '';
  return value.slice('Bearer '.length).trim();
}

export async function verifySupabaseJwt(req: any, expectedUserId?: string) {
  const token = getBearerToken(req);
  if (!token) throw new Error('missing_jwt');

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) throw new Error('invalid_jwt');
  if (expectedUserId && data.user.id !== expectedUserId) throw new Error('user_mismatch');
  return data.user;
}

export function requirePost(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return false;
  }
  if (req.method !== 'POST') {
    safeError(res, 405);
    return false;
  }
  return true;
}

export function verifyGeniusPaySignature(rawBody: string, timestamp: string, signature: string) {
  const secret = process.env.GENIUSPAY_WEBHOOK_SECRET;
  if (!secret || !timestamp || !signature) return false;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > 300) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function createGeniusPayCheckout(input: {
  amount: number;
  description: string;
  userEmail: string;
  userName: string;
  metadata: Record<string, string>;
  successUrl?: string;
  errorUrl?: string;
}) {
  const apiKey = process.env.GENIUSPAY_API_KEY;
  const apiSecret = process.env.GENIUSPAY_API_SECRET;
  if (!apiKey || !apiSecret) throw new Error('geniuspay_env_missing');

  const response = await fetch(GENIUSPAY_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
      'X-API-Secret': apiSecret
    },
    body: JSON.stringify({
      amount: input.amount,
      currency: 'XOF',
      description: input.description,
      customer: {
        name: input.userName,
        email: input.userEmail,
        country: 'CI'
      },
      success_url: input.successUrl || `${APP_URL}/paiement/succes`,
      error_url: input.errorUrl || `${APP_URL}/paiement/echec`,
      metadata: input.metadata
    })
  });

  const json = (await response.json().catch(() => null)) as any;
  if (!response.ok || !json?.success || !json?.data) throw new Error('geniuspay_create_failed');
  return json.data;
}

export function getAppUrl() {
  return APP_URL;
}