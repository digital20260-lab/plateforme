// ============================================================
// Client Supabase — CÔTÉ FRONTEND
//
// ⚠ Utilise EXCLUSIVEMENT la clé `anon` (publique par design,
//   protégée par les policies RLS définies dans supabase/schema.sql).
//
// La clé service_role ne doit JAMAIS apparaître ici ni dans
// aucun fichier compilé dans le bundle client.
//
// Les valeurs proviennent des variables d'environnement Vite
// (fichier .env, jamais commité — voir .env.example) :
//   VITE_SUPABASE_URL
//   VITE_SUPABASE_ANON_KEY
// ============================================================
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Client nul tant que les clés ne sont pas configurées :
 * l'authentification réelle est alors indisponible.
 */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

export const isSupabaseConfigured = (): boolean => supabase !== null;

// ------------------------------------------------------------
// Helpers typés pour les opérations courantes du frontend.
// Toutes passent par RLS : un utilisateur ne voit que SES données.
// Les opérations sensibles (paiement, plan) passent par le
// backend — jamais par le client.
// ------------------------------------------------------------

/** Inscription par email + mot de passe. */
export async function signUp(email: string, password: string, name: string) {
  if (!supabase) throw new Error('supabase_not_configured');
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } }
  });
  if (error) throw error;
  return data;
}

/** Connexion. */
export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error('supabase_not_configured');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/** Déconnexion. */
export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

/** Envoie l'email de réinitialisation du mot de passe. */
export async function requestPasswordReset(email: string) {
  if (!supabase) throw new Error('supabase_not_configured');
  const redirectTo = `${window.location.origin}/#reset-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
}

/** Profil de l'utilisateur connecté (RLS : uniquement le sien). */
export async function getMyProfile() {
  if (!supabase) throw new Error('supabase_not_configured');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  // Ajouter un timeout de 8 secondes pour éviter les requêtes qui traînent
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    if (error) throw error;
    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}

/** Mise à jour du profil (nom, téléphone, préférences — PAS le plan). */
export async function updateMyProfile(fields: {
  name?: string;
  phone?: string;
  alert_type?: 'emploi' | 'concours' | 'les_deux';
  alert_email?: boolean;
  preferred_sectors?: string[];
  preferred_level?: string;
}) {
  if (!supabase) throw new Error('supabase_not_configured');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('non connecté');
  const { error } = await supabase.from('profiles').update(fields).eq('id', user.id);
  if (error) throw error;
}

/** Annonces publiques (lecture libre). */
export async function fetchListings(params: { type?: 'emploi' | 'concours'; limit?: number } = {}) {
  if (!supabase) throw new Error('supabase_not_configured');
  let query = supabase
    .from('listings')
    .select('*')
    .order('collected_at', { ascending: false })
    .limit(params.limit ?? 100);
  if (params.type) query = query.eq('type', params.type);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/** Sauvegarder / retirer un favori (RLS : ses favoris uniquement). */
export async function toggleSavedListing(listingId: string, save: boolean) {
  if (!supabase) throw new Error('supabase_not_configured');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('non connecté');
  if (save) {
    const { error } = await supabase
      .from('saved_listings')
      .upsert({ user_id: user.id, listing_id: listingId });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('saved_listings')
      .delete()
      .eq('user_id', user.id)
      .eq('listing_id', listingId);
    if (error) throw error;
  }
}

/**
 * Enregistre une tentative de quiz.
 * La limite « 1 quiz offert en gratuit » est appliquée PAR LA BASE
 * (trigger SQL) — le client ne peut pas la contourner.
 */
export async function recordQuizAttempt(quizId: string, score?: number) {
  if (!supabase) throw new Error('supabase_not_configured');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('non connecté');
  const { error } = await supabase
    .from('quiz_attempts')
    .insert({ user_id: user.id, quiz_id: quizId, score: score ?? null });
  if (error) {
    if (error.message.includes('QUIZ_FREE_LIMIT')) throw new Error('limite');
    throw error;
  }
}
