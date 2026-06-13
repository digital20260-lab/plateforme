// ============================================================
// Client Supabase — CÔTÉ SERVEUR UNIQUEMENT
//
// ⚠ Utilise la clé service_role (bypass RLS).
//   Ce module ne doit JAMAIS être importé par le frontend
//   ni packagé dans un bundle client.
//
// Les clés proviennent exclusivement de variables
// d'environnement (.env — jamais commité).
// ============================================================
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error(
    'Configuration Supabase manquante : définissez SUPABASE_URL et ' +
    'SUPABASE_SERVICE_ROLE_KEY dans votre fichier .env (cf. .env.example).'
  );
}

export const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
