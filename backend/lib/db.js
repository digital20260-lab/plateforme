// ============================================================
// Couche données du collecteur — Supabase (service_role)
// Tables : listings, profiles, scrape_logs
// Déduplication par hash SHA-256 (titre normalisé + URL source)
// ============================================================
import crypto from 'node:crypto';
import { supabaseAdmin } from './supabase.js';

// ------------------------------------------------------------
// Déduplication
// ------------------------------------------------------------

/** Normalise un titre pour la comparaison (minuscules, sans accents ni ponctuation). */
export function normalizeTitle(title) {
  return (title || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Hash unique d'une annonce : titre normalisé + URL source. */
export function computeHash(title, sourceUrl) {
  return crypto
    .createHash('sha256')
    .update(normalizeTitle(title) + '|' + (sourceUrl || ''))
    .digest('hex');
}

// ------------------------------------------------------------
// Listings
// ------------------------------------------------------------

/**
 * Insère uniquement les annonces nouvelles (hash inconnu en base).
 * @returns {Promise<{ inserted: object[], skipped: number }>}
 */
export async function insertNewListings(candidates) {
  if (candidates.length === 0) return { inserted: [], skipped: 0 };

  // 1. Calculer les hashs des candidats
  const withHash = candidates.map(c => ({
    ...c,
    hash: computeHash(c.title, c.sourceUrl)
  }));

  // 2. Récupérer les hashs déjà connus (par lots de 200)
  const known = new Set();
  const hashes = withHash.map(c => c.hash);
  for (let i = 0; i < hashes.length; i += 200) {
    const batch = hashes.slice(i, i + 200);
    const { data, error } = await supabaseAdmin
      .from('listings')
      .select('hash')
      .in('hash', batch);
    if (error) throw new Error(`Lecture hashs : ${error.message}`);
    for (const row of data) known.add(row.hash);
  }

  // 3. Dédupliquer aussi à l'intérieur du lot courant
  const fresh = [];
  const seenInBatch = new Set();
  for (const c of withHash) {
    if (known.has(c.hash) || seenInBatch.has(c.hash)) continue;
    seenInBatch.add(c.hash);
    fresh.push(c);
  }

  if (fresh.length === 0) {
    return { inserted: [], skipped: candidates.length };
  }

  // 4. Insertion (mapping vers les colonnes snake_case)
  const rows = fresh.map(c => ({
    hash: c.hash,
    title: c.title,
    type: c.type,
    sector: c.sector || 'Autre',
    ministry: c.ministry || '',
    location: c.location || '',
    level: c.level || '',
    excerpt: c.excerpt || '',
    source_id: c.sourceId,
    source_name: c.sourceName,
    source_url: c.sourceUrl,
    link: c.link || '',
    deadline: c.deadline ? toIsoDate(c.deadline) : null,
    published_at: c.publishedAt || null
  }));

  const { data, error } = await supabaseAdmin
    .from('listings')
    .insert(rows)
    .select();

  if (error) throw new Error(`Insertion listings : ${error.message}`);

  return { inserted: data ?? [], skipped: candidates.length - (data?.length ?? 0) };
}

/** Convertit "JJ/MM/AAAA" ou "JJ-MM-AAAA" en ISO, sinon null. */
function toIsoDate(raw) {
  const m = String(raw).trim().match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/);
  if (!m) return null;
  const [, d, mo, y] = m;
  const year = y.length === 2 ? `20${y}` : y;
  const iso = `${year}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
  return Number.isNaN(Date.parse(iso)) ? null : iso;
}

// ------------------------------------------------------------
// Abonnés Premium (pour les alertes email)
// ------------------------------------------------------------

/**
 * Charge les abonnés Premium avec alertes email actives
 * et leur adresse email (table auth.users via l'API admin).
 */
export async function loadPremiumUsers() {
  const { data: profiles, error } = await supabaseAdmin
    .from('profiles')
    .select('id, name, plan, alert_type, alert_email, preferred_sectors, preferred_level')
    .eq('plan', 'premium')
    .eq('alert_email', true);

  if (error) throw new Error(`Lecture profils : ${error.message}`);
  if (!profiles?.length) return [];

  // Récupérer les emails via l'API admin (auth.users n'est pas exposée en SQL client)
  const users = [];
  for (const p of profiles) {
    const { data, error: userErr } = await supabaseAdmin.auth.admin.getUserById(p.id);
    if (userErr || !data?.user?.email) continue;
    users.push({
      email: data.user.email,
      name: p.name,
      plan: p.plan,
      alertType: p.alert_type,
      preferredSectors: p.preferred_sectors ?? [],
      preferredLevel: p.preferred_level ?? ''
    });
  }
  return users;
}

/**
 * Charge tous les utilisateurs ayant activé les alertes email.
 * Les emails sont envoyés selon le planning (lundi/jeudi), pas en instantané.
 */
export async function loadEmailAlertUsers() {
  const today = new Date().toISOString().split('T')[0];
  const { data: profiles, error } = await supabaseAdmin
    .from('profiles')
    .select('id, name, plan, alert_type, alert_email, preferred_sectors, preferred_level, plan_expiry')
    .eq('plan', 'premium')
    .eq('alert_email', true)
    .gte('plan_expiry', today);

  if (error) throw new Error(`Lecture profils alertes : ${error.message}`);
  if (!profiles?.length) return [];

  const users = [];
  for (const p of profiles) {
    const { data, error: userErr } = await supabaseAdmin.auth.admin.getUserById(p.id);
    if (userErr || !data?.user?.email) continue;
    users.push({
      email: data.user.email,
      name: p.name,
      plan: p.plan,
      alertType: p.alert_type,
      preferredSectors: p.preferred_sectors ?? [],
      preferredLevel: p.preferred_level ?? ''
    });
  }
  return users;
}

/**
 * Annonces collectées depuis une date donnée, utilisées pour le digest email.
 */
export async function loadListingsSince(sinceDate) {
  const { data, error } = await supabaseAdmin
    .from('listings')
    .select('*')
    .gte('collected_at', sinceDate.toISOString())
    .order('collected_at', { ascending: false })
    .limit(200);

  if (error) throw new Error(`Lecture annonces récentes : ${error.message}`);
  return data ?? [];
}

// ------------------------------------------------------------
// Journal des exécutions
// ------------------------------------------------------------

export async function appendLog(entry) {
  const { error } = await supabaseAdmin.from('scrape_logs').insert({
    started_at: entry.startedAt,
    finished_at: entry.finishedAt,
    duration_ms: entry.durationMs ?? null,
    totals: entry.totals ?? null,
    sources: entry.sources ?? null,
    emails: entry.emails ?? null,
    errors: entry.errors ?? []
  });
  if (error) {
    // Journalisation best-effort : on n'échoue pas la collecte pour un log
    console.error('⚠ Impossible d\u2019écrire le log en base :', error.message);
  }
}

export async function loadLogs(limit = 10) {
  const { data, error } = await supabaseAdmin
    .from('scrape_logs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Lecture logs : ${error.message}`);
  return data ?? [];
}
